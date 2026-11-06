import type { RequestOptions, ResourceContext } from "../client/context.js";
import { InvalidArgumentError, InvalidReferenceError, NotFoundError } from "../errors/index.js";
import type { PlaylistDiff, PlaylistResponse, PlaylistsResponse } from "../generated/dto.js";
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

export interface PlaylistMutationOptions extends RequestOptions {
  /**
   * Текущая ревизия плейлиста. Если не указана, ресурс сам запрашивает
   * плейлист и берёт revision из ответа.
   */
  readonly revision?: number;
}

export interface PlaylistTrackInput {
  readonly id: number;
  /** Альбом, из которого трек добавляется. API ожидает его вместе с id. */
  readonly albumId?: number;
}

export interface PlaylistAddOptions extends PlaylistMutationOptions {
  /** Индекс вставки; 0 — начало плейлиста. */
  readonly at?: number;
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
   * Плейлисты пользователя. По умолчанию - плейлисты владельца токена.
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
   * Применяет diff к плейлисту. Если revision не передана, ресурс сначала
   * запрашивает плейлист и берёт её из ответа.
   *
   * Формат diff повторяет поведение community-клиентов и не подтверждён
   * живым прогоном: операции `insert` и `delete`.
   *
   * @example
   * const playlist = await client.playlists.get(3);
   * await client.playlists.change(3, { diff: [{ op: "delete", from: 0, to: 0 }] }, {
   *   revision: playlist.revision,
   * });
   */
  async change(
    input: number | string | PlaylistRefInput,
    diff: PlaylistDiff,
    options: PlaylistMutationOptions = {},
  ): Promise<Playlist> {
    const { userId, kind } = await this.resolveRef(input);
    const revision = await this.#resolveRevision(userId, kind, options.revision);

    const data = await this.#ctx.request<PlaylistResponse>(
      "playlists.change",
      { path: { userId, kind }, query: { revision }, body: diff },
      options,
    );

    if (!data.result) {
      throw new NotFoundError(`Плейлист ${kind} пользователя ${userId} не найден`);
    }

    return mapPlaylist(data.result);
  }

  /**
   * Добавляет треки в плейлист. API ожидает альбом вместе с id трека,
   * поэтому передавайте albumId, если он известен.
   *
   * @example
   * await client.playlists.addTracks(3, [{ id: 456, albumId: 2 }], { at: 0 });
   */
  async addTracks(
    input: number | string | PlaylistRefInput,
    tracks: readonly PlaylistTrackInput[],
    options: PlaylistAddOptions = {},
  ): Promise<Playlist> {
    if (tracks.length === 0) {
      throw new InvalidArgumentError("Список треков пуст");
    }

    const at = options.at ?? 0;
    if (!Number.isSafeInteger(at) || at < 0) {
      throw new InvalidArgumentError(
        `Индекс вставки должен быть неотрицательным целым, получено ${at}`,
      );
    }

    for (const track of tracks) {
      if (!Number.isSafeInteger(track.id) || track.id <= 0) {
        throw new InvalidArgumentError(
          `id трека должен быть положительным целым, получено ${track.id}`,
        );
      }
      if (
        track.albumId !== undefined &&
        (!Number.isSafeInteger(track.albumId) || track.albumId <= 0)
      ) {
        throw new InvalidArgumentError(
          `albumId должен быть положительным целым, получено ${track.albumId}`,
        );
      }
    }

    const diff: PlaylistDiff = {
      diff: [
        {
          op: "insert",
          at,
          tracks: tracks.map((track) => ({ id: track.id, albumId: track.albumId })),
        },
      ],
    };

    return this.change(input, diff, options);
  }

  /**
   * Удаляет треки из плейлиста по диапазону индексов, границы включительно.
   *
   * @example
   * await client.playlists.removeTracks(3, 0, 2);
   */
  async removeTracks(
    input: number | string | PlaylistRefInput,
    from: number,
    to: number,
    options: PlaylistMutationOptions = {},
  ): Promise<Playlist> {
    if (!Number.isSafeInteger(from) || from < 0) {
      throw new InvalidArgumentError(
        `Начальный индекс должен быть неотрицательным целым, получено ${from}`,
      );
    }
    if (!Number.isSafeInteger(to) || to < from) {
      throw new InvalidArgumentError(
        `Конечный индекс должен быть целым не меньше начального (${from}), получено ${to}`,
      );
    }

    const diff: PlaylistDiff = { diff: [{ op: "delete", from, to }] };

    return this.change(input, diff, options);
  }

  async #resolveRevision(
    userId: string,
    kind: number,
    revision: number | undefined,
  ): Promise<number> {
    if (revision !== undefined) {
      if (!Number.isSafeInteger(revision) || revision < 0) {
        throw new InvalidArgumentError(
          `revision должен быть неотрицательным целым, получено ${revision}`,
        );
      }
      return revision;
    }

    const current = await this.get({ userId, kind });
    if (current.revision === undefined) {
      throw new InvalidArgumentError(
        `В ответе playlists.get нет revision для плейлиста ${kind}; передайте revision явно`,
      );
    }

    return current.revision;
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
