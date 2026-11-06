import { InvalidReferenceError } from "../errors/index.js";

export type Ref = number | string;

export type YandexReference =
  | { readonly type: "track"; readonly trackId: number; readonly albumId?: number }
  | { readonly type: "album"; readonly albumId: number }
  | { readonly type: "artist"; readonly artistId: number }
  | { readonly type: "playlist"; readonly userId: string; readonly kind: number }
  | { readonly type: "user"; readonly userId: string };

const ALLOWED_HOSTS = [
  "music.yandex.ru",
  "music.yandex.com",
  "music.yandex.by",
  "music.yandex.kz",
  "music.yandex.uz",
  "music.yandex.com.tr",
  "music.yandex.co.il",
] as const;

const FALLBACK_ORIGIN = "https://music.yandex.ru";

function fail(input: string, reason: string): never {
  throw new InvalidReferenceError(`Не удалось распознать ссылку «${input}»: ${reason}`, input);
}

function toPositiveInt(input: string, field: string, raw: string): number {
  if (!/^\d+$/.test(input)) {
    fail(raw, `${field} должен быть числом, получено «${input}»`);
  }
  const value = Number(input);
  if (!Number.isSafeInteger(value) || value <= 0) {
    fail(raw, `${field} должен быть положительным целым, получено «${input}»`);
  }
  return value;
}

function normalise(input: string): string {
  const value = input.trim();
  if (value.length === 0) fail(input, "пустая строка");
  return value;
}

export function parseYandexUrl(input: Ref): YandexReference {
  if (typeof input === "number") {
    if (!Number.isSafeInteger(input) || input <= 0) {
      fail(String(input), "ожидался положительный целый идентификатор");
    }
    return { type: "track", trackId: input };
  }

  const raw = normalise(input);

  if (/^\d+$/.test(raw)) {
    return { type: "track", trackId: toPositiveInt(raw, "trackId", raw) };
  }

  let url: URL;
  try {
    url = new URL(raw.startsWith("/") ? `${FALLBACK_ORIGIN}${raw}` : raw);
  } catch {
    fail(raw, "это не идентификатор и не URL");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    fail(raw, `неподдерживаемый протокол «${url.protocol}»`);
  }

  const host = url.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.includes(host as (typeof ALLOWED_HOSTS)[number])) {
    fail(raw, `неизвестный домен «${host}», ожидается music.yandex.ru и родственные`);
  }

  const segments = url.pathname.split("/").filter((segment) => segment.length > 0);

  const queryTrackId = url.searchParams.get("trackId");
  if (queryTrackId !== null) {
    return { type: "track", trackId: toPositiveInt(queryTrackId, "trackId", raw) };
  }

  const first = segments[0];
  const second = segments[1];

  if ((first === "album" || first === "albums") && second !== undefined) {
    const albumId = toPositiveInt(second, "albumId", raw);
    if ((segments[2] === "track" || segments[2] === "tracks") && segments[3] !== undefined) {
      return { type: "track", trackId: toPositiveInt(segments[3], "trackId", raw), albumId };
    }
    return { type: "album", albumId };
  }

  if ((first === "track" || first === "tracks") && second !== undefined) {
    return { type: "track", trackId: toPositiveInt(second, "trackId", raw) };
  }

  if ((first === "artist" || first === "artists") && second !== undefined) {
    return { type: "artist", artistId: toPositiveInt(second, "artistId", raw) };
  }

  if (first === "users" && second !== undefined) {
    const userId = decodeURIComponent(second);
    if (segments[2] === "playlists" && segments[3] !== undefined) {
      return { type: "playlist", userId, kind: toPositiveInt(segments[3], "kind", raw) };
    }
    return { type: "user", userId };
  }

  return fail(raw, "неизвестная структура пути");
}

function expect<T extends YandexReference["type"]>(
  input: Ref,
  expected: T,
): Extract<YandexReference, { type: T }> {
  const reference = parseYandexUrl(input);
  if (reference.type !== expected) {
    throw new InvalidReferenceError(
      `Ожидалась сущность «${expected}», но ссылка «${String(input)}» указывает на «${reference.type}»`,
      String(input),
    );
  }
  return reference as Extract<YandexReference, { type: T }>;
}

export function getTrackId(input: Ref): number {
  return expect(input, "track").trackId;
}

export function getAlbumId(input: Ref): number {
  return expect(input, "album").albumId;
}

export function getArtistId(input: Ref): number {
  return expect(input, "artist").artistId;
}

export function getPlaylistRef(input: Ref): { readonly userId: string; readonly kind: number } {
  const reference = expect(input, "playlist");
  return { userId: reference.userId, kind: reference.kind };
}

export function getUserId(input: Ref): string {
  return expect(input, "user").userId;
}
