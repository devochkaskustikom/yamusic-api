import type { HttpMethod, OperationId } from "../generated/operations.js";
import type { QueryValue } from "../transport/types.js";

export interface RequestOptions {
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
  readonly retries?: number;
  readonly language?: string;
  readonly headers?: Readonly<Record<string, string>>;
}

export interface RawRequestOptions extends RequestOptions {
  readonly method?: HttpMethod;
  readonly query?: Readonly<Record<string, QueryValue>>;
  readonly body?: unknown;
}

export interface OperationParams {
  readonly path?: Readonly<Record<string, string | number>>;
  readonly query?: Readonly<Record<string, QueryValue>>;
  readonly body?: unknown;
}

export interface ResourceContext {
  request<T = unknown>(
    operationId: OperationId,
    params?: OperationParams,
    options?: RequestOptions,
  ): Promise<T>;

  rawRequest<T = unknown>(path: string, options?: RawRequestOptions): Promise<T>;

  getUid(): Promise<number>;

  resolveUserId(userId?: string | number): Promise<string>;
}
