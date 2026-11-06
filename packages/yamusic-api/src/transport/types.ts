import type { HttpMethod } from "../generated/operations.js";
import type { RateLimitOptions } from "./rate-limiter.js";

export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly (string | number)[];

export interface RequestSpec {
  readonly operationId: string;
  readonly method: HttpMethod;
  readonly path: string;
  readonly pathParams?: Readonly<Record<string, string | number>> | undefined;
  readonly query?: Readonly<Record<string, QueryValue>> | undefined;
  readonly body?: unknown;
  readonly idempotent: boolean;
  readonly signal?: AbortSignal | undefined;
  readonly timeoutMs?: number | undefined;
  readonly retries?: number | undefined;
  readonly language?: string | undefined;
  readonly headers?: Readonly<Record<string, string>> | undefined;
}

export interface TransportConfig {
  readonly baseUrl: string;
  readonly timeoutMs: number;
  readonly retries: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
  readonly retryOnStatus: readonly number[];
  readonly rateLimit: RateLimitOptions | null;
  readonly userAgent: string;
  readonly language: string | undefined;
  readonly clientName: string | undefined;
  readonly headers: Readonly<Record<string, string>>;
  readonly fetch: typeof fetch;
}

export interface TransportHooks {
  readonly onUnauthorized?: (() => void) | undefined;
}
