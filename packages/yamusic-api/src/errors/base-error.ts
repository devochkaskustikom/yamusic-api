export interface YandexMusicErrorOptions {
  readonly code?: string;
  readonly cause?: unknown;
  readonly status?: number;
  readonly endpoint?: string;
  readonly requestId?: string;
  readonly retryAfterMs?: number;
  readonly details?: unknown;
}

export class YandexMusicError extends Error {
  override readonly name: string = "YandexMusicError";
  readonly code: string;
  readonly status: number | undefined;
  readonly endpoint: string | undefined;
  readonly requestId: string | undefined;
  readonly retryAfterMs: number | undefined;
  readonly details: unknown;

  constructor(message: string, options: YandexMusicErrorOptions = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.code = options.code ?? "yandex_music_error";
    this.status = options.status;
    this.endpoint = options.endpoint;
    this.requestId = options.requestId;
    this.retryAfterMs = options.retryAfterMs;
    this.details = options.details;
    Error.captureStackTrace?.(this, new.target);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      endpoint: this.endpoint,
      requestId: this.requestId,
      retryAfterMs: this.retryAfterMs,
    };
  }
}

export function isYandexMusicError(value: unknown): value is YandexMusicError {
  return value instanceof YandexMusicError;
}
