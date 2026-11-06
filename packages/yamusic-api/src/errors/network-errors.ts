import { YandexMusicError, type YandexMusicErrorOptions } from "./base-error.js";

export class NetworkError extends YandexMusicError {
  override readonly name: string = "NetworkError";

  constructor(message: string, options: YandexMusicErrorOptions = {}) {
    super(message, { code: "network_error", ...options });
  }
}

export class TimeoutError extends NetworkError {
  override readonly name: string = "TimeoutError";

  constructor(message: string, options: YandexMusicErrorOptions = {}) {
    super(message, { code: "timeout", ...options });
  }
}

export class RequestAbortedError extends NetworkError {
  override readonly name: string = "AbortError";

  constructor(message = "Request aborted by the caller", options: YandexMusicErrorOptions = {}) {
    super(message, { code: "aborted", ...options });
  }
}
