export { YandexMusicError, isYandexMusicError } from "./base-error.js";
export type { YandexMusicErrorOptions } from "./base-error.js";
export {
  ApiError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  UnauthorizedError,
} from "./http-errors.js";
export { NetworkError, RequestAbortedError, TimeoutError } from "./network-errors.js";
export { SchemaMismatchError } from "./schema-error.js";
export type { SchemaChange, SchemaChangeKind } from "./schema-error.js";
export { InvalidReferenceError } from "./reference-error.js";
export { InvalidArgumentError } from "./argument-error.js";
export { ConfigError } from "./config-error.js";
