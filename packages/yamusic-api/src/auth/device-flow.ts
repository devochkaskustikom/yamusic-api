import { AuthenticationError, ConfigError } from "../errors/index.js";
import { sleep } from "../internal/timers.js";

const DEFAULT_OAUTH_BASE_URL = "https://oauth.yandex.ru";
const DEVICE_GRANT_TYPE = "urn:ietf:params:oauth:grant-type:device_code";

export interface DeviceFlowOptions {
  readonly clientId: string;
  readonly deviceId?: string;
  readonly scope?: string;
  readonly baseUrl?: string;
  readonly fetch?: typeof fetch;
}

export interface DeviceCodeInfo {
  readonly deviceCode: string;
  readonly userCode: string;
  readonly verificationUrl: string;
  readonly expiresIn: number;
  readonly interval: number;
}

export interface DeviceToken {
  readonly accessToken: string;
  readonly refreshToken: string | undefined;
  readonly expiresIn: number | undefined;
  readonly tokenType: string | undefined;
}

export interface WaitForTokenOptions {
  readonly signal?: AbortSignal;
  readonly intervalMs?: number;
  readonly timeoutMs?: number;
}

type TokenResult =
  | { readonly ok: true; readonly token: DeviceToken }
  | { readonly ok: false; readonly error: string; readonly description: string | undefined };

interface TokenPayload {
  readonly access_token?: string;
  readonly refresh_token?: string;
  readonly expires_in?: number;
  readonly token_type?: string;
  readonly error?: string;
  readonly error_description?: string;
}

export class DeviceFlowAuth {
  readonly #clientId: string;
  readonly #deviceId: string;
  readonly #scope: string | undefined;
  readonly #baseUrl: string;
  readonly #fetch: typeof fetch;

  constructor(options: DeviceFlowOptions) {
    if (!options.clientId || options.clientId.trim().length === 0) {
      throw new ConfigError("deviceFlow.clientId обязателен: свой OAuth-клиент нужно зарегистрировать самостоятельно");
    }
    const fetchImpl = options.fetch ?? globalThis.fetch;
    if (typeof fetchImpl !== "function") {
      throw new ConfigError("Для device flow нужен fetch. Передайте его в опции deviceFlow.fetch");
    }

    this.#clientId = options.clientId;
    this.#deviceId = options.deviceId ?? crypto.randomUUID();
    this.#scope = options.scope;
    this.#baseUrl = options.baseUrl ?? DEFAULT_OAUTH_BASE_URL;
    this.#fetch = fetchImpl;
  }

  async startDeviceFlow(signal?: AbortSignal): Promise<DeviceCodeInfo> {
    const body = new URLSearchParams({
      client_id: this.#clientId,
      device_id: this.#deviceId,
    });
    if (this.#scope) body.set("scope", this.#scope);

    const response = await this.#post("/device/code", body, signal);
    const payload = (await response.json()) as {
      device_code?: string;
      user_code?: string;
      verification_url?: string;
      expires_in?: number;
      interval?: number;
    };

    if (!response.ok || !payload.device_code || !payload.user_code) {
      throw new AuthenticationError(
        "Яндекс OAuth не выдал код устройства",
        { status: response.status, details: payload },
      );
    }

    return {
      deviceCode: payload.device_code,
      userCode: payload.user_code,
      verificationUrl: payload.verification_url ?? `${this.#baseUrl}/device`,
      expiresIn: payload.expires_in ?? 300,
      interval: payload.interval ?? 5,
    };
  }

  async waitForToken(deviceCode: string, options: WaitForTokenOptions = {}): Promise<DeviceToken> {
    let intervalMs = options.intervalMs ?? 5_000;
    const deadline = Date.now() + (options.timeoutMs ?? 600_000);

    for (;;) {
      if (Date.now() > deadline) {
        throw new AuthenticationError("Истекло время ожидания подтверждения устройства");
      }

      await sleep(intervalMs, options.signal);

      const result = await this.#requestToken({
        grant_type: DEVICE_GRANT_TYPE,
        code: deviceCode,
        client_id: this.#clientId,
      }, options.signal);

      if (result.ok) return result.token;
      if (result.error === "authorization_pending") continue;
      if (result.error === "slow_down") {
        intervalMs += 5_000;
        continue;
      }

      throw new AuthenticationError(
        `Авторизация устройства не удалась: ${result.description ?? result.error}`,
        { details: { error: result.error } },
      );
    }
  }

  async refresh(refreshToken: string, signal?: AbortSignal): Promise<DeviceToken> {
    const result = await this.#requestToken({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: this.#clientId,
    }, signal);

    if (!result.ok) {
      throw new AuthenticationError(
        `Не удалось обновить токен: ${result.description ?? result.error}`,
        { details: { error: result.error } },
      );
    }
    return result.token;
  }

  async #requestToken(params: Record<string, string>, signal?: AbortSignal): Promise<TokenResult> {
    const response = await this.#post("/token", new URLSearchParams(params), signal);
    const payload = (await response.json()) as TokenPayload;

    if (payload.access_token) {
      return {
        ok: true,
        token: {
          accessToken: payload.access_token,
          refreshToken: payload.refresh_token,
          expiresIn: payload.expires_in,
          tokenType: payload.token_type,
        },
      };
    }

    return {
      ok: false,
      error: payload.error ?? "unknown_error",
      description: payload.error_description,
    };
  }

  #post(path: string, body: URLSearchParams, signal?: AbortSignal): Promise<Response> {
    return this.#fetch(`${this.#baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: body.toString(),
      signal: signal ?? null,
    });
  }
}
