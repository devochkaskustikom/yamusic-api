import type { RequestOptions, ResourceContext } from "../client/context.js";
import { NotFoundError } from "../errors/index.js";
import type {
  ArtistResponse,
  ArtistTracksResponse,
} from "../generated/dto.js";
import { mapArtist, mapTrack } from "../mappers/index.js";
import type { Artist, Track } from "../models/index.js";
import { getArtistId, type Ref } from "../parsers/url-parser.js";

export interface ArtistTracksOptions extends RequestOptions {
  readonly page?: number;
  readonly pageSize?: number;
}

export class ArtistsResource {
  readonly #ctx: ResourceContext;

  constructor(ctx: ResourceContext) {
    this.#ctx = ctx;
  }

  /**
   * Исполнитель по идентификатору или ссылке.
   *
   * @example
   * const artist = await client.artists.get(789);
   * console.log(artist.name, artist.genres);
   */
  async get(ref: Ref, options?: RequestOptions): Promise<Artist> {
    const artistId = getArtistId(ref);
    const data = await this.#ctx.request<ArtistResponse>(
      "artists.get",
      { path: { artistId } },
      options,
    );

    if (!data.result) {
      throw new NotFoundError(`Исполнитель ${artistId} не найден`);
    }

    return mapArtist(data.result);
  }

  /**
   * Композиции исполнителя с постраничной выдачей.
   *
   * @example
   * const tracks = await client.artists.getTracks(789, { page: 0, pageSize: 50 });
   */
  async getTracks(ref: Ref, options: ArtistTracksOptions = {}): Promise<readonly Track[]> {
    const artistId = getArtistId(ref);
    const { page, pageSize, ...requestOptions } = options;

    const data = await this.#ctx.request<ArtistTracksResponse>(
      "artists.getTracks",
      { path: { artistId }, query: { page, "page-size": pageSize } },
      requestOptions,
    );

    return (data.result?.tracks ?? []).map(mapTrack);
  }
}
