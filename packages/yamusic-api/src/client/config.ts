import type { AuthConfig } from "../auth/types.js";
import { ConfigError } from "../errors/index.js";
import type { SchemaChange } from "../errors/index.js";
import { DEFAULT_RATE_LIMIT, type RateLimitOptions } from "../transport/rate-limiter.js";
import { DEFAULT_RETRY_STATUSES } from "../transport/retry.js";
import type { TransportConfig } from "../transport/types.js";
import { VERSION } from "../version.js";

export interface DebugOptions {
  readonly detectUnknownFields?: boolean;
  readonly onSchemaChange?: (change: SchemaChange) => void;
}

export interface TransportOptions {
  readonly baseUrl?: string;
  readonly timeoutMs?: number;
  readonly retries?: number;
  readonly retryOnStatus?: readonly number[];
  readonly retry?: {
    readonly baseDelayMs?: number;
    readonly maxDelayMs?: number;
  };
  readonly rateLimit?: RateLimitOptions | null;
  readonly userAgent?: string;
  readonly clientName?: string | null;
}

export interface YandexMusicClientOptions {
  readonly auth?: AuthConfig;
  readonly token?: string;
  readonly language?: string;
  readonly transport?: TransportOptions;
  readonly headers?: Readonly<Record<string, string>>;
  readonly fetch?: typeof fetch;
  readonly debug?: DebugOptions;
}

export interface ResolvedDebugOptions {
  readonly detectUnknownFields: boolean;
  readonly onSchemaChange: ((change: SchemaChange) => void) | undefined;
}

export interface ResolvedClientConfig {
  readonly auth: AuthConfig | null;
  readonly language: string | undefined;
  readonly transport: TransportConfig;
  readonly debug: ResolvedDebugOptions;
}

const DEFAULT_BASE_URL = "https://api.music.yandex.net";
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_LANGUAGE = "ru";

function resolveTokenSource(options: YandexMusicClientOptions): AuthConfig | null {
  if (options.auth && options.token) {
    throw new ConfigError("Передайте либо auth, либо token, но не оба сразу");
  }
  if (options.token !== undefined) {
    if (options.token.trim().length === 0) {
      throw new ConfigError("Пустой токен: передайте непустую строку");
    }
    return { token: options.token };
  }
  return options.auth ?? null;
}

function resolveTransportConfig(
  options: YandexMusicClientOptions,
  language: string | undefined,
): TransportConfig {
  const transport = options.transport ?? {};

  const timeoutMs = transport.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new ConfigError(`transport.timeoutMs должен быть положительным, получено ${timeoutMs}`);
  }

  const retries = transport.retries ?? 2;
  if (!Number.isInteger(retries) || retries < 0) {
    throw new ConfigError(`transport.retries должен быть неотрицательным целым, получено ${retries}`);
  }

  const baseDelayMs = transport.retry?.baseDelayMs ?? 300;
  const maxDelayMs = transport.retry?.maxDelayMs ?? 10_000;
  if (!Number.isFinite(baseDelayMs) || baseDelayMs < 0) {
    throw new ConfigError(`transport.retry.baseDelayMs должен быть неотрицательным, получено ${baseDelayMs}`);
  }
  if (!Number.isFinite(maxDelayMs) || maxDelayMs < baseDelayMs) {
    throw new ConfigError(
      `transport.retry.maxDelayMs должен быть не меньше baseDelayMs, получено ${maxDelayMs}`,
    );
  }

  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    throw new ConfigError(
      "В этом окружении нет глобального fetch. Передайте реализацию через опцию fetch.",
    );
  }

  const clientName = transport.clientName === null ? undefined : transport.clientName;

  return {
    baseUrl: transport.baseUrl ?? DEFAULT_BASE_URL,
    timeoutMs,
    retries,
    baseDelayMs,
    maxDelayMs,
    retryOnStatus: transport.retryOnStatus ?? DEFAULT_RETRY_STATUSES,
    rateLimit: transport.rateLimit === undefined ? DEFAULT_RATE_LIMIT : transport.rateLimit,
    userAgent: transport.userAgent ?? `@dvkskustikom/yamusic-api/${VERSION}`,
    language,
    clientName,
    headers: options.headers ?? {},
    fetch: fetchImpl,
  };
}

export function resolveConfig(options: YandexMusicClientOptions): ResolvedClientConfig {
  const language = options.language === null ? undefined : (options.language ?? DEFAULT_LANGUAGE);

  return {
    auth: resolveTokenSource(options),
    language,
    transport: resolveTransportConfig(options, language),
    debug: {
      detectUnknownFields: options.debug?.detectUnknownFields ?? false,
      onSchemaChange: options.debug?.onSchemaChange,
    },
  };
}
