import { YandexMusicError } from "./base-error.js";

export class InvalidReferenceError extends YandexMusicError {
  override readonly name: string = "InvalidReferenceError";
  readonly input: string;

  constructor(message: string, input: string) {
    super(message, { code: "invalid_reference" });
    this.input = input;
  }
}
