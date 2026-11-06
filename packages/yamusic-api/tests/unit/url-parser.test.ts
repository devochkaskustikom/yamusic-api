import { describe, expect, it } from "vitest";
import { InvalidReferenceError } from "../../src/errors/index.js";
import {
  getAlbumId,
  getPlaylistRef,
  getTrackId,
  parseYandexUrl,
} from "../../src/parsers/url-parser.js";

describe("parseYandexUrl", () => {
  it("принимает числовой идентификатор как трек", () => {
    expect(parseYandexUrl(456)).toEqual({ type: "track", trackId: 456 });
  });

  it("принимает строку из цифр как трек", () => {
    expect(parseYandexUrl("456")).toEqual({ type: "track", trackId: 456 });
  });

  it("разбирает ссылку на трек внутри альбома", () => {
    expect(parseYandexUrl("https://music.yandex.ru/album/123/track/456")).toEqual({
      type: "track",
      trackId: 456,
      albumId: 123,
    });
  });

  it("разбирает ссылку на альбом", () => {
    expect(parseYandexUrl("https://music.yandex.ru/album/123")).toEqual({
      type: "album",
      albumId: 123,
    });
  });

  it("разбирает ссылку на исполнителя", () => {
    expect(parseYandexUrl("https://music.yandex.com/artist/789")).toEqual({
      type: "artist",
      artistId: 789,
    });
  });

  it("разбирает ссылку на плейлист", () => {
    expect(parseYandexUrl("https://music.yandex.ru/users/login.name/playlists/3")).toEqual({
      type: "playlist",
      userId: "login.name",
      kind: 3,
    });
  });

  it("разбирает параметр trackId из query", () => {
    expect(parseYandexUrl("https://music.yandex.ru/album/1?trackId=42")).toEqual({
      type: "track",
      trackId: 42,
    });
  });

  it("принимает относительный путь", () => {
    expect(parseYandexUrl("/album/123/track/456")).toEqual({
      type: "track",
      trackId: 456,
      albumId: 123,
    });
  });

  it("отклоняет посторонний домен", () => {
    expect(() => parseYandexUrl("https://example.com/album/123")).toThrow(InvalidReferenceError);
  });

  it("отклоняет домен-двойник в пути", () => {
    expect(() => parseYandexUrl("https://evil.example/music.yandex.ru/album/123")).toThrow(
      InvalidReferenceError,
    );
  });

  it("отклоняет мусор", () => {
    expect(() => parseYandexUrl("не ссылка")).toThrow(InvalidReferenceError);
  });

  it("отклоняет нулевой идентификатор", () => {
    expect(() => parseYandexUrl("https://music.yandex.ru/album/0")).toThrow(InvalidReferenceError);
  });
});

describe("getTrackId", () => {
  it("достаёт идентификатор из ссылки", () => {
    expect(getTrackId("https://music.yandex.ru/album/1/track/99")).toBe(99);
  });

  it("сообщает, если ссылка указывает на другой тип", () => {
    expect(() => getTrackId("https://music.yandex.ru/album/1")).toThrow(InvalidReferenceError);
  });
});

describe("getAlbumId / getPlaylistRef", () => {
  it("достаёт идентификатор альбома", () => {
    expect(getAlbumId("https://music.yandex.ru/album/321")).toBe(321);
  });

  it("достаёт пользователя и kind плейлиста", () => {
    expect(getPlaylistRef("https://music.yandex.ru/users/someone/playlists/7")).toEqual({
      userId: "someone",
      kind: 7,
    });
  });
});
