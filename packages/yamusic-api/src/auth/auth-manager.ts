import { AuthenticationError } from "../errors/index.js";
import type { AuthConfig, AuthProvider } from "./types.js";

export class AuthManager implements AuthProvider {
  readonly #load: () => Promise<string>;
  readonly #invalidateSource: (() => void) | undefined;
  #cached: string | null = null;

  constructor(config: AuthConfig) {
    if ("token" in config) {
      const token = config.token;
      this.#load = async () => token;
      this.#invalidateSource = undefined;
    } else if ("provider" in config) {
      const provider = config.provider;
      this.#load = async () => provider.getToken();
      this.#invalidateSource = provider.invalidate ? () => provider.invalidate!() : undefined;
    } else {
      const getToken = config.getToken;
      this.#load = async () => getToken();
      this.#invalidateSource = undefined;
    }
  }

  async getToken(): Promise<string> {
    if (this.#cached !== null) return this.#cached;

    let token: string;
    try {
      token = await this.#load();
    } catch (cause) {
      throw new AuthenticationError("Провайдер токена выбросил ошибку", { cause });
    }

    if (typeof token !== "string" || token.trim().length === 0) {
      throw new AuthenticationError("Провайдер токена вернул пустое значение");
    }

    this.#cached = token;
    return token;
  }

  invalidate(): void {
    this.#cached = null;
    this.#invalidateSource?.();
  }
}
