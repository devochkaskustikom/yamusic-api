import { YandexMusicError } from "./base-error.js";

export class ConfigError extends YandexMusicError {
  override readonly name: string = "ConfigError";

  constructor(message: string) {
    super(message, { code: "invalid_config" });
  }
}
