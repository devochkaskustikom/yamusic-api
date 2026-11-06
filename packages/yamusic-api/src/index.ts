export { YandexMusicClient } from "./client/client.js";
export { resolveConfig } from "./client/config.js";
export type {
  DebugOptions,
  ResolvedClientConfig,
  ResolvedDebugOptions,
  TransportOptions,
  YandexMusicClientOptions,
} from "./client/config.js";
export type {
  OperationParams,
  RawRequestOptions,
  RequestOptions,
  ResourceContext,
} from "./client/context.js";

export { AuthManager, DeviceFlowAuth } from "./auth/index.js";
export type {
  AuthConfig,
  AuthProvider,
  DeviceCodeInfo,
  DeviceFlowOptions,
  DeviceToken,
  WaitForTokenOptions,
} from "./auth/index.js";

export {
  ConfigError,
  InvalidArgumentError,
  InvalidReferenceError,
  isYandexMusicError,
  SchemaMismatchError,
  YandexMusicError,
} from "./errors/index.js";
export {
  ApiError,
  AuthenticationError,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  RequestAbortedError,
  TimeoutError,
  UnauthorizedError,
} from "./errors/index.js";
export type { SchemaChange, SchemaChangeKind, YandexMusicErrorOptions } from "./errors/index.js";

export type {
  Account,
  AccountPlus,
  Album,
  AlbumRef,
  Artist,
  ArtistCounts,
  ArtistLink,
  ArtistRef,
  Lyrics,
  Playlist,
  PlaylistOwner,
  PlaylistVisibility,
  SearchResult,
  SearchTotals,
  Track,
} from "./models/index.js";

export {
  getAlbumId,
  getArtistId,
  getPlaylistRef,
  getTrackId,
  getUserId,
  parseYandexUrl,
} from "./parsers/url-parser.js";
export type { Ref, YandexReference } from "./parsers/url-parser.js";
export { getCoverUrl, getTrackCoverUrl } from "./parsers/cover-url.js";
export type { CoverSize } from "./parsers/cover-url.js";

export { operations } from "./generated/operations.js";
export type {
  EndpointStatus,
  HttpMethod,
  OperationId,
  OperationResponse,
  OperationResponseMap,
} from "./generated/operations.js";

export { detectSchemaChanges } from "./schema/drift.js";
export type { ShapeNode } from "./schema/types.js";

export type { RateLimitOptions } from "./transport/rate-limiter.js";
export { DEFAULT_RETRY_STATUSES } from "./transport/retry.js";
export { VERSION } from "./version.js";
