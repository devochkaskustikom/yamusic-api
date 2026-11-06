import { vi } from "vitest";

export interface RecordedCall {
  readonly url: string;
  readonly init: RequestInit;
}

export interface MockFetch {
  readonly fetchImpl: typeof fetch;
  readonly calls: RecordedCall[];
}

export function jsonResponse(
  body: unknown,
  init: { readonly status?: number; readonly headers?: Record<string, string> } = {},
): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json", ...init.headers },
  });
}

export function createMockFetch(
  handler: (url: string, init: RequestInit) => Response | Promise<Response>,
): MockFetch {
  const calls: RecordedCall[] = [];

  const impl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const requestInit = init ?? {};
    calls.push({ url, init: requestInit });
    return handler(url, requestInit);
  });

  return { fetchImpl: impl as unknown as typeof fetch, calls };
}
