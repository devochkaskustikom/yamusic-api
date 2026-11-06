import { describe, expect, it } from "vitest";
import { RateLimitError } from "../../src/errors/index.js";
import {
  computeBackoff,
  isRetryableStatus,
  parseRetryAfter,
  retryDelayFor,
} from "../../src/transport/retry.js";

describe("computeBackoff", () => {
  it("растёт экспоненциально и упирается в потолок", () => {
    const fixed = () => 1;
    expect(computeBackoff(0, 100, 10_000, fixed)).toBe(100);
    expect(computeBackoff(1, 100, 10_000, fixed)).toBe(200);
    expect(computeBackoff(10, 100, 10_000, fixed)).toBe(10_000);
  });

  it("добавляет джиттер в пределах половины задержки", () => {
    const low = computeBackoff(1, 100, 10_000, () => 0);
    const high = computeBackoff(1, 100, 10_000, () => 1);
    expect(low).toBe(100);
    expect(high).toBe(200);
  });
});

describe("parseRetryAfter", () => {
  it("читает секунды", () => {
    expect(parseRetryAfter("3")).toBe(3_000);
  });

  it("читает HTTP-дату", () => {
    const now = Date.parse("2026-01-01T00:00:00Z");
    expect(parseRetryAfter("Thu, 01 Jan 2026 00:00:05 GMT", now)).toBe(5_000);
  });

  it("возвращает undefined для мусора и пустого значения", () => {
    expect(parseRetryAfter(null)).toBeUndefined();
    expect(parseRetryAfter("")).toBeUndefined();
    expect(parseRetryAfter("soon")).toBeUndefined();
  });

  it("не уходит в минус для прошедшей даты", () => {
    const now = Date.parse("2026-01-01T00:01:00Z");
    expect(parseRetryAfter("Thu, 01 Jan 2026 00:00:00 GMT", now)).toBe(0);
  });
});

describe("isRetryableStatus", () => {
  it("считает 429 и 5xx повторяемыми", () => {
    expect(isRetryableStatus(429, [408, 429, 500, 502, 503, 504])).toBe(true);
    expect(isRetryableStatus(503, [408, 429, 500, 502, 503, 504])).toBe(true);
    expect(isRetryableStatus(404, [408, 429, 500, 502, 503, 504])).toBe(false);
  });
});

describe("retryDelayFor", () => {
  it("предпочитает Retry-After из ошибки", () => {
    const error = new RateLimitError("too many", { retryAfterMs: 7_000 });
    expect(retryDelayFor(error, 0, { baseDelayMs: 100, maxDelayMs: 10_000 })).toBe(7_000);
  });

  it("иначе считает экспоненциальную задержку", () => {
    const delay = retryDelayFor(new Error("boom"), 2, { baseDelayMs: 100, maxDelayMs: 10_000 });
    expect(delay).toBeGreaterThanOrEqual(200);
    expect(delay).toBeLessThanOrEqual(400);
  });
});
