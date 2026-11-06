import type { RequestOptions, ResourceContext } from "../client/context.js";
import type { AccountStatusResponse } from "../generated/dto.js";
import { mapAccount } from "../mappers/index.js";
import type { Account } from "../models/index.js";

export class AccountResource {
  readonly #ctx: ResourceContext;

  constructor(ctx: ResourceContext) {
    this.#ctx = ctx;
  }

  /**
   * Профиль аккаунта, которому принадлежит токен.
   *
   * @example
   * const account = await client.account.me();
   * console.log(account.displayName, account.plus?.hasPlus);
   */
  async me(options?: RequestOptions): Promise<Account> {
    const status = await this.#ctx.request<AccountStatusResponse>("account.getStatus", {}, options);
    return mapAccount(status.result);
  }

  /**
   * Числовой uid текущего аккаунта. Значение запрашивается один раз и кешируется.
   */
  async uid(): Promise<number> {
    return this.#ctx.getUid();
  }

  /**
   * Пользовательские настройки в том виде, в котором их отдаёт сервер.
   * Структура настроек не документирована, поэтому тип ответа — словарь.
   */
  async getSettings(options?: RequestOptions): Promise<Record<string, unknown>> {
    return this.#ctx.request<Record<string, unknown>>("account.getSettings", {}, options);
  }
}
