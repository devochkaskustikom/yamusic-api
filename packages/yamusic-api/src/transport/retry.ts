import { RateLimitError, type YandexMusicError } from "../errors/index.js";

export const DEFAULT_RETRY_STATUSES: readonly number[] = [408, 429, 500, 502, 503, 504];

export interface RetryPolicy {
  readonly retries: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
  readonly retryOnStatus: readonly number[];
}

export const DEFAULT_RETRY_POLICY: Omit<RetryPolicy, "retryOnStatus"> = {
  retries: 2,
  baseDelayMs: 300,
  maxDelayMs: 10_000,
};

export function computeBackoff(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
  random: () => number = Math.random,
): number {
  const exponential = baseDelayMs * 2 ** attempt;
  const capped = Math.min(exponential, maxDelayMs);
  const jitter = 0.5 + random() / 2;
  return Math.round(capped * jitter);
}

export function isRetryableStatus(status: number, retryOnStatus: readonly number[]): boolean {
  return retryOnStatus.includes(status);
}

export function parseRetryAfter(value: string | null, now: number = Date.now()): number | undefined {
  if (value === null) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;

  if (/^\d+$/.test(trimmed)) {
    const seconds = Number(trimmed);
    return Number.isSafeInteger(seconds) ? seconds * 1_000 : undefined;
  }

  const timestamp = Date.parse(trimmed);
  if (Number.isNaN(timestamp)) return undefined;
  return Math.max(0, timestamp - now);
}

export function retryDelayFor(
  error: unknown,
  attempt: number,
  policy: Pick<RetryPolicy, "baseDelayMs" | "maxDelayMs">,
): number {
  if (error instanceof RateLimitError && error.retryAfterMs !== undefined) {
    return error.retryAfterMs;
  }
  return computeBackoff(attempt, policy.baseDelayMs, policy.maxDelayMs);
}

export function hasStatus(error: unknown): error is YandexMusicError & { status: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  );
}
