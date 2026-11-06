import { ConfigError, RequestAbortedError } from "../errors/index.js";
import { sleep } from "../internal/timers.js";

export interface RateLimitOptions {
  readonly capacity: number;
  readonly intervalMs: number;
}

export const DEFAULT_RATE_LIMIT: RateLimitOptions = {
  capacity: 20,
  intervalMs: 1_000,
};

export class RateLimiter {
  readonly #capacity: number;
  readonly #intervalMs: number;
  readonly #timestamps: number[] = [];

  constructor(options: RateLimitOptions) {
    if (!Number.isFinite(options.capacity) || options.capacity <= 0) {
      throw new ConfigError(`rateLimit.capacity должен быть положительным, получено ${options.capacity}`);
    }
    if (!Number.isFinite(options.intervalMs) || options.intervalMs <= 0) {
      throw new ConfigError(`rateLimit.intervalMs должен быть положительным, получено ${options.intervalMs}`);
    }
    this.#capacity = options.capacity;
    this.#intervalMs = options.intervalMs;
  }

  async acquire(signal?: AbortSignal): Promise<void> {
    for (;;) {
      if (signal?.aborted) throw new RequestAbortedError();

      const now = Date.now();
      while (this.#timestamps.length > 0 && now - this.#timestamps[0]! >= this.#intervalMs) {
        this.#timestamps.shift();
      }

      if (this.#timestamps.length < this.#capacity) {
        this.#timestamps.push(now);
        return;
      }

      const oldest = this.#timestamps[0]!;
      await sleep(this.#intervalMs - (now - oldest), signal);
    }
  }
}
