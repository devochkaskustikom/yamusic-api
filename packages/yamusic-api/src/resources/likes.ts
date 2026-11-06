import type { RequestOptions, ResourceContext } from "../client/context.js";
import type { LikesTracksResponse, MutationResponse } from "../generated/dto.js";
import { mapTrack } from "../mappers/index.js";
import type { Track } from "../models/index.js";
import { getTrackId, type Ref } from "../parsers/url-parser.js";

const CHUNK_SIZE = 100;

export interface LikesListOptions extends RequestOptions {
  readonly userId?: string | number;
}

export class LikesTracksResource {
  readonly #ctx: ResourceContext;

  constructor(ctx: ResourceContext) {
    this.#ctx = ctx;
  }

  /**
   * Любимые композиции пользователя. По умолчанию — владельца токена.
   *
   * @example
   * const liked = await client.likes.tracks.list();
   */
  async list(options: LikesListOptions = {}): Promise<readonly Track[]> {
    const { userId, ...requestOptions } = options;
    const resolved = await this.#ctx.resolveUserId(userId);

    const data = await this.#ctx.request<LikesTracksResponse>(
      "likes.tracks.list",
      { path: { userId: resolved } },
      requestOptions,
    );

    return (data.result?.library?.tracks ?? []).map(mapTrack);
  }

  /**
   * Добавляет композиции в любимые. Принимает один трек или массив.
   * Большие списки отправляются порциями по 100 штук последовательно.
   *
   * @example
   * await client.likes.tracks.add(456);
   * await client.likes.tracks.add([456, 457, "https://music.yandex.ru/track/458"]);
   */
  async add(refs: Ref | readonly Ref[], options: RequestOptions = {}): Promise<boolean> {
    return this.#mutate("likes.tracks.add", refs, options);
  }

  /**
   * Убирает композиции из любимых.
   *
   * @example
   * await client.likes.tracks.remove([456, 457]);
   */
  async remove(refs: Ref | readonly Ref[], options: RequestOptions = {}): Promise<boolean> {
    return this.#mutate("likes.tracks.remove", refs, options);
  }

  async #mutate(
    operation: "likes.tracks.add" | "likes.tracks.remove",
    refs: Ref | readonly Ref[],
    options: RequestOptions,
  ): Promise<boolean> {
    const list = typeof refs === "number" || typeof refs === "string" ? [refs] : refs;
    if (list.length === 0) return true;

    const trackIds = list.map(getTrackId);
    const userId = await this.#ctx.resolveUserId();

    let success = true;

    for (let index = 0; index < trackIds.length; index += CHUNK_SIZE) {
      const chunk = trackIds.slice(index, index + CHUNK_SIZE).join(",");
      const data = await this.#ctx.request<MutationResponse>(
        operation,
        { path: { userId }, query: { "track-ids": chunk } },
        options,
      );
      success = success && (data.result ?? false);
    }

    return success;
  }
}

export class LikesResource {
  readonly tracks: LikesTracksResource;

  constructor(ctx: ResourceContext) {
    this.tracks = new LikesTracksResource(ctx);
  }
}
