import {
  ApiError,
  AuthenticationError,
  ConfigError,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  RequestAbortedError,
  TimeoutError,
  UnauthorizedError,
} from "../errors/index.js";
import { sleep } from "../internal/timers.js";
import { RateLimiter } from "./rate-limiter.js";
import { hasStatus, isRetryableStatus, parseRetryAfter, retryDelayFor } from "./retry.js";
import type { QueryValue, RequestSpec, TransportConfig, TransportHooks } from "./types.js";

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function serialiseQueryValue(value: QueryValue): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) {
    return value.length === 0 ? undefined : value.map(String).join(",");
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

export function buildRequestUrl(
  baseUrl: string,
  path: string,
  pathParams: Readonly<Record<string, string | number>> = {},
  query: Readonly<Record<string, QueryValue>> = {},
): string {
  const interpolated = path.replace(/\{([^}]+)\}/g, (_match, name: string) => {
    const value = pathParams[name];
    if (value === undefined) {
      throw new ConfigError(`Не передан обязательный параметр пути «${name}» для ${path}`);
    }
    return encodeURIComponent(String(value));
  });

  const url = new URL(`${baseUrl.replace(/\/+$/, "")}${interpolated}`);

  for (const [key, value] of Object.entries(query)) {
    const serialised = serialiseQueryValue(value);
    if (serialised !== undefined) url.searchParams.set(key, serialised);
  }

  return url.toString();
}

function errorMessageFrom(body: unknown): string | undefined {
  if (!isRecord(body)) return undefined;
  const error = body.error;
  if (isRecord(error)) {
    if (typeof error.message === "string" && error.message.length > 0) return error.message;
    if (typeof error.name === "string" && error.name.length > 0) return error.name;
  }
  if (typeof body.message === "string" && body.message.length > 0) return body.message;
  return undefined;
}

function apiCodeFrom(body: unknown): string | undefined {
  if (!isRecord(body) || !isRecord(body.error)) return undefined;
  return typeof body.error.name === "string" ? body.error.name : undefined;
}

function requestIdFrom(response: Response, body: unknown): string | undefined {
  const header =
    response.headers.get("x-request-id") ??
    response.headers.get("x-yandex-request-id") ??
    response.headers.get("request-id");
  if (header) return header;

  if (isRecord(body)) {
    const info = body.invocationInfo;
    if (isRecord(info)) {
      const id = info["req-id"] ?? info.reqId;
      if (typeof id === "string") return id;
    }
  }
  return undefined;
}

function toHttpError(
  status: number,
  body: unknown,
  endpoint: string,
  requestId: string | undefined,
  retryAfterMs: number | undefined,
): Error {
  const message = errorMessageFrom(body) ?? `Запрос завершился со статусом ${status}`;
  const options = { status, endpoint, requestId, retryAfterMs, details: body };

  if (status === 401) return new UnauthorizedError(message, options);
  if (status === 403) return new ForbiddenError(message, options);
  if (status === 404) return new NotFoundError(message, options);
  if (status === 429) return new RateLimitError(message, options);
  return new ApiError(message, apiCodeFrom(body), options);
}

export class HttpTransport {
  readonly #config: TransportConfig;
  readonly #limiter: RateLimiter | null;
  readonly #getToken: () => Promise<string | null>;
  readonly #hooks: TransportHooks;

  constructor(
    config: TransportConfig,
    getToken: () => Promise<string | null>,
    hooks: TransportHooks = {},
  ) {
    this.#config = config;
    this.#getToken = getToken;
    this.#hooks = hooks;
    this.#limiter = config.rateLimit ? new RateLimiter(config.rateLimit) : null;
  }

  async request<T = unknown>(spec: RequestSpec): Promise<T> {
    const retries = spec.retries ?? this.#config.retries;
    let attempt = 0;

    for (;;) {
      await this.#limiter?.acquire(spec.signal);

      try {
        return (await this.#attempt(spec)) as T;
      } catch (error) {
        if (error instanceof UnauthorizedError) this.#hooks.onUnauthorized?.();

        if (spec.signal?.aborted) throw error;
        if (error instanceof RequestAbortedError) throw error;
        if (!spec.idempotent) throw error;

        const retryable =
          error instanceof NetworkError ||
          (hasStatus(error) && isRetryableStatus(error.status, this.#config.retryOnStatus));

        if (!retryable || attempt >= retries) throw error;

        await sleep(
          retryDelayFor(error, attempt, {
            baseDelayMs: this.#config.baseDelayMs,
            maxDelayMs: this.#config.maxDelayMs,
          }),
          spec.signal,
        );
        attempt += 1;
      }
    }
  }

  async #attempt(spec: RequestSpec): Promise<unknown> {
    const url = buildRequestUrl(this.#config.baseUrl, spec.path, spec.pathParams, spec.query);
    const timeoutMs = spec.timeoutMs ?? this.#config.timeoutMs;

    let token: string | null;
    try {
      token = await this.#getToken();
    } catch (cause) {
      throw new AuthenticationError("Не удалось получить OAuth-токен", { cause, endpoint: url });
    }

    const headers = this.#buildHeaders(spec, token);
    const body = this.#serialiseBody(spec.body, headers);

    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    const onAbort = (): void => controller.abort();
    if (spec.signal) {
      if (spec.signal.aborted) {
        clearTimeout(timer);
        throw new RequestAbortedError(undefined, { endpoint: url });
      }
      spec.signal.addEventListener("abort", onAbort, { once: true });
    }

    let response: Response;
    try {
      response = await this.#config.fetch(url, {
        method: spec.method,
        headers,
        body,
        signal: controller.signal,
      });
    } catch (cause) {
      if (timedOut) {
        throw new TimeoutError(
          `Запрос ${spec.operationId} превысил таймаут ${timeoutMs} мс`,
          { endpoint: url, cause },
        );
      }
      if (spec.signal?.aborted) {
        throw new RequestAbortedError(undefined, { endpoint: url, cause });
      }
      throw new NetworkError(`Сетевая ошибка при запросе ${spec.operationId}`, {
        endpoint: url,
        cause,
      });
    } finally {
      clearTimeout(timer);
      spec.signal?.removeEventListener("abort", onAbort);
    }

    const text = await response.text();
    let data: unknown;

    if (text.trim().length > 0) {
      try {
        data = JSON.parse(text);
      } catch {
        if (response.ok) {
          throw new ApiError("Сервер вернул ответ, который не является JSON", undefined, {
            status: response.status,
            endpoint: url,
            details: text.slice(0, 512),
          });
        }
      }
    }

    const requestId = requestIdFrom(response, data);
    const retryAfterMs = parseRetryAfter(response.headers.get("retry-after"));

    if (!response.ok) {
      throw toHttpError(response.status, data, url, requestId, retryAfterMs);
    }

    if (
      isRecord(data) &&
      isRecord(data.error) &&
      !("result" in data) &&
      errorMessageFrom(data) !== undefined
    ) {
      throw new ApiError(errorMessageFrom(data)!, apiCodeFrom(data), {
        status: response.status,
        endpoint: url,
        requestId,
        details: data,
      });
    }

    return data;
  }

  #buildHeaders(spec: RequestSpec, token: string | null): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": this.#config.userAgent,
      ...this.#config.headers,
    };

    if (token) headers.Authorization = `OAuth ${token}`;
    if (this.#config.clientName) headers["X-Yandex-Music-Client"] = this.#config.clientName;

    const language = spec.language ?? this.#config.language;
    if (language) headers["Accept-Language"] = language;

    for (const [key, value] of Object.entries(spec.headers ?? {})) {
      headers[key] = value;
    }

    return headers;
  }

  #serialiseBody(body: unknown, headers: Record<string, string>): string | undefined {
    if (body === undefined) return undefined;
    if (typeof body === "string") return body;
    headers["Content-Type"] = "application/json";
    return JSON.stringify(body);
  }
}
