import { RequestAbortedError } from "../errors/index.js";

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) {
    return signal?.aborted ? Promise.reject(new RequestAbortedError()) : Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new RequestAbortedError());
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    function onAbort(): void {
      clearTimeout(timer);
      reject(new RequestAbortedError());
    }

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
