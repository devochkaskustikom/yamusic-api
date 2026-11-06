import type { RequestOptions, ResourceContext } from "../client/context.js";
import type { LikesTracksResponse, MutationResponse } from "../generated/dto.js";
import { mapTrack } from "../mappers/index.js";
import type { Track } from "../models/index.js";
import { getTrackId, type Ref } from "../parsers/url-parser.js";

const CHUNK_SIZE = 100;

export interface LikesListOptions extends RequestOptions {
  readonly userId?: string | number;
}

type LikeListOperation = "likes.tracks.list" | "likes.dislikes.list";
type LikeMutateOperation =
  | "likes.tracks.add"
  | "likes.tracks.remove"
  | "likes.dislikes.add"
  | "likes.dislikes.remove";

abstract class LikeCollectionResource {
  readonly #ctx: ResourceContext;
  readonly #listOperation: LikeListOperation;
  readonly #addOperation: LikeMutateOperation;
  readonly #removeOperation: LikeMutateOperation;

  constructor(
    ctx: ResourceContext,
    listOperation: LikeListOperation,
    addOperation: LikeMutateOperation,
    removeOperation: LikeMutateOperation,
  ) {
    this.#ctx = ctx;
    this.#listOperation = listOperation;
    this.#addOperation = addOperation;
    this.#removeOperation = removeOperation;
  }

  /**
   * Список композиций. По умолчанию — владельца токена.
   *
   * @example
   * const liked = await client.likes.tracks.list();
   */
  async list(options: LikesListOptions = {}): Promise<readonly Track[]> {
    const { userId, ...requestOptions } = options;
    const resolved = await this.#ctx.resolveUserId(userId);

    const data = await this.#ctx.request<LikesTracksResponse>(
      this.#listOperation,
      { path: { userId: resolved } },
      requestOptions,
    );

    return (data.result?.library?.tracks ?? []).map(mapTrack);
  }

  /**
   * Добавляет композиции. Принимает один трек или массив.
   * Большие списки отправляются порциями по 100 штук последовательно.
   *
   * @example
   * await client.likes.tracks.add(456);
   * await client.likes.tracks.add([456, 457, "https://music.yandex.ru/track/458"]);
   */
  async add(refs: Ref | readonly Ref[], options: RequestOptions = {}): Promise<boolean> {
    return this.#mutate(this.#addOperation, refs, options);
  }

  /**
   * Убирает композиции из списка.
   *
   * @example
   * await client.likes.tracks.remove([456, 457]);
   */
  async remove(refs: Ref | readonly Ref[], options: RequestOptions = {}): Promise<boolean> {
    return this.#mutate(this.#removeOperation, refs, options);
  }

  async #mutate(
    operation: LikeMutateOperation,
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

export class LikesTracksResource extends LikeCollectionResource {
  constructor(ctx: ResourceContext) {
    super(ctx, "likes.tracks.list", "likes.tracks.add", "likes.tracks.remove");
  }
}

export class LikesDislikesResource extends LikeCollectionResource {
  constructor(ctx: ResourceContext) {
    super(ctx, "likes.dislikes.list", "likes.dislikes.add", "likes.dislikes.remove");
  }

  /**
   * Скрытые композиции: то, что пользователь убрал из рекомендаций.
   *
   * @example
   * const hidden = await client.likes.dislikes.list();
   * await client.likes.dislikes.add(456);
   */
  declare list: (options?: LikesListOptions) => Promise<readonly Track[]>;
}

export class LikesResource {
  readonly tracks: LikesTracksResource;
  readonly dislikes: LikesDislikesResource;

  constructor(ctx: ResourceContext) {
    this.tracks = new LikesTracksResource(ctx);
    this.dislikes = new LikesDislikesResource(ctx);
  }
}
