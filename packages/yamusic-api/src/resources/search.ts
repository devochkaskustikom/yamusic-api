import type { RequestOptions, ResourceContext } from "../client/context.js";
import { InvalidArgumentError } from "../errors/index.js";
import type { SearchResponse, SuggestResponse } from "../generated/dto.js";
import { mapSearchResult } from "../mappers/index.js";
import type { SearchResult } from "../models/index.js";

export type SearchType = "all" | "track" | "artist" | "album" | "playlist" | "podcast" | "video";

export interface SearchQueryOptions extends RequestOptions {
  readonly type?: SearchType;
  readonly page?: number;
  readonly noCorrect?: boolean;
}

export class SearchResource {
  readonly #ctx: ResourceContext;

  constructor(ctx: ResourceContext) {
    this.#ctx = ctx;
  }

  /**
   * Универсальный поиск по каталогу.
   *
   * @example
   * const result = await client.search.query("Кино", { type: "track" });
   * console.log(result.tracks[0]?.title, result.totals.tracks);
   */
  async query(text: string, options: SearchQueryOptions = {}): Promise<SearchResult> {
    if (text.trim().length === 0) {
      throw new InvalidArgumentError("Поисковый запрос не может быть пустым");
    }

    const { type, page, noCorrect, ...requestOptions } = options;

    const data = await this.#ctx.request<SearchResponse>(
      "search.query",
      { query: { text, type, page, nocorrect: noCorrect } },
      requestOptions,
    );

    return mapSearchResult(data.result);
  }

  /**
   * Подсказки поиска. Возвращает только тексты подсказок.
   *
   * @example
   * const suggestions = await client.search.suggest("кино");
   */
  async suggest(part: string, options: RequestOptions = {}): Promise<readonly string[]> {
    if (part.trim().length === 0) return [];

    const data = await this.#ctx.request<SuggestResponse>(
      "search.suggest",
      { query: { part } },
      options,
    );

    return (data.result?.suggestions ?? [])
      .map((item) => item.title)
      .filter((title): title is string => typeof title === "string" && title.length > 0);
  }
}
