import { YandexMusicError, type YandexMusicErrorOptions } from "./base-error.js";

export class AuthenticationError extends YandexMusicError {
  override readonly name: string = "AuthenticationError";

  constructor(message: string, options: YandexMusicErrorOptions = {}) {
    super(message, { code: "authentication_error", ...options });
  }
}

export class UnauthorizedError extends AuthenticationError {
  override readonly name: string = "UnauthorizedError";

  constructor(message: string, options: YandexMusicErrorOptions = {}) {
    super(message, { code: "unauthorized", status: 401, ...options });
  }
}

export class ForbiddenError extends YandexMusicError {
  override readonly name: string = "ForbiddenError";

  constructor(message: string, options: YandexMusicErrorOptions = {}) {
    super(message, { code: "forbidden", status: 403, ...options });
  }
}

export class NotFoundError extends YandexMusicError {
  override readonly name: string = "NotFoundError";

  constructor(message: string, options: YandexMusicErrorOptions = {}) {
    super(message, { code: "not_found", status: 404, ...options });
  }
}

export class RateLimitError extends YandexMusicError {
  override readonly name: string = "RateLimitError";

  constructor(message: string, options: YandexMusicErrorOptions = {}) {
    super(message, { code: "rate_limited", status: 429, ...options });
  }
}

export class ApiError extends YandexMusicError {
  override readonly name: string = "ApiError";
  readonly apiCode: string | undefined;

  constructor(message: string, apiCode?: string, options: YandexMusicErrorOptions = {}) {
    super(message, { code: "api_error", ...options });
    this.apiCode = apiCode;
  }
}
