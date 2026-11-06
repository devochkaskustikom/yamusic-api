import { describe, expect, it } from "vitest";
import {
  mapAlbum,
  mapAlbumRef,
  mapLyrics,
  mapPlaylist,
  mapPlaylistEntry,
  mapSearchResult,
  mapTrack,
} from "../../src/mappers/index.js";
import type {
  AlbumShort,
  Album as AlbumDto,
  Playlist as PlaylistDto,
  SearchResult as SearchResultDto,
  Track as TrackDto,
} from "../../src/generated/dto.js";

const trackDto: TrackDto = {
  id: 1,
  title: "Песня",
  artists: [{ id: 2, name: "Артист" }],
  albums: [{ id: 3, title: "Альбом", year: 2001, coverUri: "avatars.yandex.net/album/%%" }],
  durationMs: 200_000,
  explicit: false,
  available: true,
};

describe("mapTrack", () => {
  it("нормализует трек и вычисляет обложку", () => {
    const track = mapTrack(trackDto);

    expect(track.id).toBe(1);
    expect(track.artists[0]?.name).toBe("Артист");
    expect(track.coverUri).toBe("avatars.yandex.net/album/%%");
    expect(track.coverUrl).toBe("https://avatars.yandex.net/album/400x400");
    expect(track.durationMs).toBe(200_000);
  });

  it("не падает на отсутствующих полях", () => {
    const track = mapTrack({ id: 5 });

    expect(track.title).toBe("");
    expect(track.artists).toEqual([]);
    expect(track.albums).toEqual([]);
    expect(track.coverUrl).toBeUndefined();
    expect(track.durationMs).toBeUndefined();
  });
});

describe("mapAlbumRef", () => {
  it("оставляет только нужные поля", () => {
    const ref = mapAlbumRef(trackDto.albums![0] as AlbumShort);
    expect(ref).toEqual({
      id: 3,
      title: "Альбом",
      year: 2001,
      coverUri: "avatars.yandex.net/album/%%",
    });
  });
});

describe("mapAlbum", () => {
  it("разворачивает треки и названия лейблов", () => {
    const dto: AlbumDto = {
      id: 10,
      title: "Сборник",
      artists: [{ id: 2, name: "Артист" }],
      labels: [{ name: "Лейбл" }, {}],
      coverUri: "avatars.yandex.net/a/%%",
      tracks: [trackDto],
    };

    const album = mapAlbum(dto);

    expect(album.labels).toEqual(["Лейбл"]);
    expect(album.tracks).toHaveLength(1);
    expect(album.coverUrl).toBe("https://avatars.yandex.net/a/400x400");
  });
});

describe("mapPlaylist", () => {
  it("отбрасывает недоступные треки (null) и сохраняет порядок", () => {
    const dto: PlaylistDto = {
      kind: 3,
      title: "Мне нравится",
      owner: { uid: 1, login: "user" },
      tracks: [trackDto, null, { id: 7, title: "Второй" }],
      tags: ["tag"],
    };

    const playlist = mapPlaylist(dto);

    expect(playlist.title).toBe("Мне нравится");
    expect(playlist.tracks?.map((track) => track.id)).toEqual([1, 7]);
    expect(playlist.owner?.login).toBe("user");
  });

  it("выводит владельца из uid, если owner не пришёл", () => {
    expect(mapPlaylist({ kind: 1, uid: 42 }).owner).toEqual({ uid: 42 });
  });
});

describe("mapPlaylistEntry", () => {
  it("понимает плоский ответ", () => {
    expect(mapPlaylistEntry({ kind: 5, title: "Плоский" })?.title).toBe("Плоский");
  });

  it("понимает обёртку { owner, playlist }", () => {
    const playlist = mapPlaylistEntry({
      owner: { uid: 9, login: "someone" },
      playlist: { kind: 5, title: "Вложенный" },
    });

    expect(playlist?.title).toBe("Вложенный");
    expect(playlist?.owner?.uid).toBe(9);
  });

  it("возвращает null для мусора", () => {
    expect(mapPlaylistEntry("строка")).toBeNull();
  });
});

describe("mapLyrics", () => {
  it("возвращает null, если текста нет", () => {
    expect(mapLyrics(null)).toBeNull();
    expect(mapLyrics(undefined)).toBeNull();
  });

  it("переносит текст и права", () => {
    expect(mapLyrics({ id: 1, lyrics: "строка", hasRights: true })).toEqual({
      id: 1,
      text: "строка",
      hasRights: true,
    });
  });
});

describe("mapSearchResult", () => {
  it("собирает блоки и итоги", () => {
    const dto: SearchResultDto = {
      tracks: { total: 2, results: [trackDto] },
      artists: { total: 1, results: [{ id: 2, name: "Артист" }] },
      albums: { total: 0, results: [] },
      playlists: { total: 0, results: [] },
    };

    const result = mapSearchResult(dto);

    expect(result.tracks).toHaveLength(1);
    expect(result.artists[0]?.name).toBe("Артист");
    expect(result.totals).toEqual({ tracks: 2, artists: 1, albums: 0, playlists: 0 });
  });

  it("не падает на пустом ответе", () => {
    expect(mapSearchResult({}).totals.tracks).toBeUndefined();
  });
});
