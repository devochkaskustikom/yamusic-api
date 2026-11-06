import type { RequestOptions, ResourceContext } from "../client/context.js";
import { NotFoundError } from "../errors/index.js";
import type {
  LyricsResponse,
  SimilarTracksResponse,
  TracksResponse,
} from "../generated/dto.js";
import { mapLyrics, mapTrack } from "../mappers/index.js";
import type { Lyrics, Track } from "../models/index.js";
import { getTrackId, type Ref } from "../parsers/url-parser.js";

export interface SimilarTracks {
  readonly track: Track;
  readonly similar: readonly Track[];
}

export class TracksResource {
  readonly #ctx: ResourceContext;

  constructor(ctx: ResourceContext) {
    this.#ctx = ctx;
  }

  /**
   * Композиция по идентификатору или ссылке.
   *
   * @example
   * const track = await client.tracks.get("https://music.yandex.ru/album/123/track/456");
   * console.log(track.title, track.artists[0]?.name);
   */
  async get(ref: Ref, options?: RequestOptions): Promise<Track> {
    const trackId = getTrackId(ref);
    const data = await this.#ctx.request<TracksResponse>(
      "tracks.get",
      { path: { trackId } },
      options,
    );

    const dto = data.result?.[0];
    if (!dto) {
      throw new NotFoundError(`Композиция ${trackId} не найдена`);
    }

    return mapTrack(dto);
  }

  /**
   * Текст композиции. Возвращает `null`, если текста нет или он недоступен.
   *
   * @example
   * const lyrics = await client.tracks.getLyrics(456);
   * if (lyrics?.text) console.log(lyrics.text);
   */
  async getLyrics(ref: Ref, options?: RequestOptions): Promise<Lyrics | null> {
    const trackId = getTrackId(ref);
    const data = await this.#ctx.request<LyricsResponse>(
      "tracks.getLyrics",
      { path: { trackId } },
      options,
    );

    return mapLyrics(data.result);
  }

  /**
   * Похожие композиции вместе с исходным треком.
   *
   * @example
   * const { similar } = await client.tracks.getSimilar(456);
   * console.log(similar.map((track) => track.title));
   */
  async getSimilar(ref: Ref, options?: RequestOptions): Promise<SimilarTracks> {
    const trackId = getTrackId(ref);
    const data = await this.#ctx.request<SimilarTracksResponse>(
      "tracks.getSimilar",
      { path: { trackId } },
      options,
    );

    const result = data.result;
    if (!result?.track) {
      throw new NotFoundError(`Похожие композиции для трека ${trackId} не найдены`);
    }

    return {
      track: mapTrack(result.track),
      similar: (result.similarTracks ?? []).map(mapTrack),
    };
  }
}
