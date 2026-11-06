import type { RequestOptions, ResourceContext } from "../client/context.js";
import { NotFoundError } from "../errors/index.js";
import type { AlbumResponse } from "../generated/dto.js";
import { mapAlbum } from "../mappers/index.js";
import type { Album } from "../models/index.js";
import { getAlbumId, type Ref } from "../parsers/url-parser.js";

export interface AlbumGetOptions extends RequestOptions {
  readonly withTracks?: boolean;
}

export class AlbumsResource {
  readonly #ctx: ResourceContext;

  constructor(ctx: ResourceContext) {
    this.#ctx = ctx;
  }

  /**
   * Альбом по идентификатору или ссылке.
   *
   * @example
   * const album = await client.albums.get("https://music.yandex.ru/album/123", {
   *   withTracks: true,
   * });
   * console.log(album.title, album.tracks?.length);
   */
  async get(ref: Ref, options: AlbumGetOptions = {}): Promise<Album> {
    const albumId = getAlbumId(ref);
    const { withTracks = false, ...requestOptions } = options;
    const operation = withTracks ? "albums.getWithTracks" : "albums.get";

    const data = await this.#ctx.request<AlbumResponse>(
      operation,
      { path: { albumId } },
      requestOptions,
    );

    if (!data.result) {
      throw new NotFoundError(`Альбом ${albumId} не найден`);
    }

    return mapAlbum(data.result);
  }
}
