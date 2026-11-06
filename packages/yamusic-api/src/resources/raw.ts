import type { RawRequestOptions, ResourceContext } from "../client/context.js";

export class RawResource {
  readonly #ctx: ResourceContext;

  constructor(ctx: ResourceContext) {
    this.#ctx = ctx;
  }

  /**
   * Прямой запрос к API без типизации и нормализации.
   * Нужен, когда нужный эндпоинт ещё не покрыт SDK.
   *
   * @example
   * const data = await client.raw.request("/account/status");
   */
  request<T = unknown>(path: string, options: RawRequestOptions = {}): Promise<T> {
    return this.#ctx.rawRequest<T>(path, options);
  }
}
