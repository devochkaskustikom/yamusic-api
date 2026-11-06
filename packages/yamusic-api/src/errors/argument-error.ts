import { YandexMusicError } from "./base-error.js";

export class InvalidArgumentError extends YandexMusicError {
  override readonly name: string = "InvalidArgumentError";

  constructor(message: string) {
    super(message, { code: "invalid_argument" });
  }
}
