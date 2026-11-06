import type { RequestOptions, ResourceContext } from "../client/context.js";
import { InvalidArgumentError, InvalidReferenceError, NotFoundError } from "../errors/index.js";
import type { PlaylistResponse, PlaylistsResponse } from "../generated/dto.js";
import { mapPlaylist, mapPlaylistEntry } from "../mappers/index.js";
import type { Playlist } from "../models/index.js";
import { parseYandexUrl } from "../parsers/url-parser.js";

export interface PlaylistsListOptions extends RequestOptions {
  readonly userId?: string | number;
}

export interface PlaylistRefInput {
  readonly userId?: string | number;
  readonly kind: number;
}

export interface PlaylistLocation {
  readonly userId: string;
  readonly kind: number;
}

function assertKind(kind: number): number {
  if (!Number.isSafeInteger(kind) || kind <= 0) {
    throw new InvalidArgumentError(`kind плейлиста должен быть положительным целым, получено ${kind}`);
  }
  return kind;
}

export class PlaylistsResource {
  readonly #ctx: ResourceContext;

  constructor(ctx: ResourceContext) {
    this.#ctx = ctx;
  }

  /**
   * Плейлисты пользователя. По умолчанию — плейлисты владельца токена.
   *
   * @example
   * const playlists = await client.playlists.list();
   * console.log(playlists.map((playlist) => playlist.title));
   */
  async list(options: PlaylistsListOptions = {}): Promise<readonly Playlist[]> {
    const { userId, ...requestOptions } = options;
    const resolved = await this.#ctx.resolveUserId(userId);

    const data = await this.#ctx.request<PlaylistsResponse>(
      "playlists.list",
      { path: { userId: resolved } },
      requestOptions,
    );

    return (data.result ?? [])
      .map(mapPlaylistEntry)
      .filter((playlist): playlist is Playlist => playlist !== null);
  }

  /**
   * Плейлист по номеру (kind), ссылке или паре «пользователь + kind».
   *
   * @example
   * const playlist = await client.playlists.get(3);
   * const same = await client.playlists.get({
   *   userId: "login",
   *   kind: 3,
   * });
   * const byUrl = await client.playlists.get("https://music.yandex.ru/users/login/playlists/3");
   */
  async get(
    input: number | string | PlaylistRefInput,
    options: RequestOptions = {},
  ): Promise<Playlist> {
    const { userId, kind } = await this.resolveRef(input);

    const data = await this.#ctx.request<PlaylistResponse>(
      "playlists.get",
      { path: { userId, kind } },
      options,
    );

    if (!data.result) {
      throw new NotFoundError(`Плейлист ${kind} пользователя ${userId} не найден`);
    }

    return mapPlaylist(data.result);
  }

  /**
   * Приводит любой поддерживаемый вид ссылки на плейлист к паре «пользователь + kind»,
   * подставляя uid владельца токена, если пользователь не указан.
   */
  async resolveRef(input: number | string | PlaylistRefInput): Promise<PlaylistLocation> {
    if (typeof input === "number") {
      return { userId: await this.#ctx.resolveUserId(), kind: assertKind(input) };
    }

    if (typeof input === "string") {
      const looksLikeUrl = input.startsWith("/") || input.includes("//");
      if (looksLikeUrl) {
        const parsed = parseYandexUrl(input);
        if (parsed.type !== "playlist") {
          throw new InvalidReferenceError(
            `Ссылка «${input}» указывает на «${parsed.type}», а не на плейлист`,
            input,
          );
        }
        return { userId: parsed.userId, kind: parsed.kind };
      }

      const kind = Number(input);
      if (!Number.isSafeInteger(kind)) {
        throw new InvalidReferenceError(`Не удалось разобрать ссылку на плейлист «${input}»`, input);
      }
      return { userId: await this.#ctx.resolveUserId(), kind: assertKind(kind) };
    }

    return {
      userId: await this.#ctx.resolveUserId(input.userId),
      kind: assertKind(input.kind),
    };
  }
}
