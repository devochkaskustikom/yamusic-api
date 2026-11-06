import { AuthManager } from "../auth/index.js";
import type { AccountStatusResponse } from "../generated/dto.js";
import { operations, type OperationId } from "../generated/operations.js";
import { detectSchemaChanges } from "../schema/drift.js";
import { HttpTransport } from "../transport/http-client.js";
import { AccountResource } from "../resources/account.js";
import { AlbumsResource } from "../resources/albums.js";
import { ArtistsResource } from "../resources/artists.js";
import { LikesResource } from "../resources/likes.js";
import { PlaylistsResource } from "../resources/playlists.js";
import { RawResource } from "../resources/raw.js";
import { SearchResource } from "../resources/search.js";
import { TracksResource } from "../resources/tracks.js";
import { resolveConfig, type ResolvedClientConfig, type YandexMusicClientOptions } from "./config.js";
import type { OperationParams, RawRequestOptions, RequestOptions, ResourceContext } from "./context.js";

export class YandexMusicClient implements ResourceContext {
  readonly config: ResolvedClientConfig;
  readonly account: AccountResource;
  readonly search: SearchResource;
  readonly tracks: TracksResource;
  readonly albums: AlbumsResource;
  readonly artists: ArtistsResource;
  readonly playlists: PlaylistsResource;
  readonly likes: LikesResource;
  readonly raw: RawResource;

  readonly #transport: HttpTransport;
  #statusPromise: Promise<AccountStatusResponse> | undefined;
  #uidPromise: Promise<number> | undefined;

  constructor(options: YandexMusicClientOptions = {}) {
    this.config = resolveConfig(options);

    const auth = this.config.auth ? new AuthManager(this.config.auth) : null;
    this.#transport = new HttpTransport(
      this.config.transport,
      async () => (auth ? auth.getToken() : null),
      { onUnauthorized: () => auth?.invalidate() },
    );

    this.account = new AccountResource(this);
    this.search = new SearchResource(this);
    this.tracks = new TracksResource(this);
    this.albums = new AlbumsResource(this);
    this.artists = new ArtistsResource(this);
    this.playlists = new PlaylistsResource(this);
    this.likes = new LikesResource(this);
    this.raw = new RawResource(this);
  }

  async request<T = unknown>(
    operationId: OperationId,
    params: OperationParams = {},
    options: RequestOptions = {},
  ): Promise<T> {
    const descriptor = operations[operationId];

    const data = await this.#transport.request<T>({
      operationId,
      method: descriptor.method,
      path: descriptor.path,
      pathParams: params.path,
      query: params.query,
      body: params.body,
      idempotent: descriptor.idempotent,
      signal: options.signal,
      timeoutMs: options.timeoutMs,
      retries: options.retries,
      language: options.language,
      headers: options.headers,
    });

    if (this.config.debug.detectUnknownFields && descriptor.responseSchema) {
      for (const change of detectSchemaChanges(data, descriptor.responseSchema)) {
        this.config.debug.onSchemaChange?.({ ...change, operationId });
      }
    }

    return data;
  }

  async rawRequest<T = unknown>(path: string, options: RawRequestOptions = {}): Promise<T> {
    const method = options.method ?? "GET";

    return this.#transport.request<T>({
      operationId: `raw:${method} ${path}`,
      method,
      path,
      query: options.query,
      body: options.body,
      idempotent: method === "GET",
      signal: options.signal,
      timeoutMs: options.timeoutMs,
      retries: options.retries,
      language: options.language,
      headers: options.headers,
    });
  }

  async getStatus(options: RequestOptions = {}): Promise<AccountStatusResponse> {
    if (!this.#statusPromise) {
      this.#statusPromise = this.request<AccountStatusResponse>("account.getStatus", {}, options).catch(
        (error: unknown) => {
          this.#statusPromise = undefined;
          throw error;
        },
      );
    }
    return this.#statusPromise;
  }

  async getUid(): Promise<number> {
    if (!this.#uidPromise) {
      this.#uidPromise = this.getStatus()
        .then((status) => status.result.account.uid)
        .catch((error: unknown) => {
          this.#uidPromise = undefined;
          throw error;
        });
    }
    return this.#uidPromise;
  }

  async resolveUserId(userId?: string | number): Promise<string> {
    if (userId !== undefined && String(userId).trim().length > 0) return String(userId);
    return String(await this.getUid());
  }
}
