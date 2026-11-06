import { describe, expect, it } from "vitest";
import { YandexMusicClient } from "../../src/client/client.js";
import type {
  NotFoundError,
  RequestAbortedError as RequestAbortedErrorType,
  TimeoutError as TimeoutErrorType,
  UnauthorizedError as UnauthorizedErrorType,
  SchemaChange,
} from "../../src/index.js";
import {
  NotFoundError as NotFoundErrorClass,
  RequestAbortedError as RequestAbortedErrorClass,
  TimeoutError as TimeoutErrorClass,
  UnauthorizedError as UnauthorizedErrorClass,
} from "../../src/errors/index.js";
import type { Track as TrackDto } from "../../src/generated/dto.js";
import { createMockFetch, jsonResponse } from "../helpers/mock-fetch.js";

const trackDto: TrackDto = {
  id: 456,
  title: "Группа крови",
  artists: [{ id: 1, name: "Кино" }],
  albums: [{ id: 2, title: "Группа крови", year: 1988, coverUri: "avatars.yandex.net/c/%%" }],
  durationMs: 300_000,
};

function statusResponse(uid = 100) {
  return { result: { account: { uid, displayName: "Слушатель" } } };
}

function createClient(
  handler: Parameters<typeof createMockFetch>[0],
  transport: {
    timeoutMs?: number;
    retries?: number;
    retry?: { baseDelayMs?: number; maxDelayMs?: number };
  } = {},
) {
  const mock = createMockFetch(handler);
  const client = new YandexMusicClient({
    token: "test-token",
    fetch: mock.fetchImpl,
    transport: { rateLimit: null, ...transport },
  });
  return { client, calls: mock.calls };
}

describe("YandexMusicClient: транспорт", () => {
  it("ставит OAuth-заголовок и язык", async () => {
    const { client, calls } = createClient(() =>
      jsonResponse({ result: [trackDto] }),
    );

    await client.tracks.get(456);

    expect(calls).toHaveLength(1);
    expect(calls[0]!.init.headers).toMatchObject({
      Authorization: "OAuth test-token",
      "Accept-Language": "ru",
      Accept: "application/json",
    });
    expect(calls[0]!.url).toBe("https://api.music.yandex.net/tracks/456");
  });

  it("нормализует трек", async () => {
    const { client } = createClient(() => jsonResponse({ result: [trackDto] }));

    const track = await client.tracks.get("https://music.yandex.ru/album/2/track/456");

    expect(track.title).toBe("Группа крови");
    expect(track.artists[0]?.name).toBe("Кино");
    expect(track.coverUrl).toBe("https://avatars.yandex.net/c/400x400");
  });

  it("бросает NotFoundError на пустой результат", async () => {
    const { client } = createClient(() => jsonResponse({ result: [] }));

    await expect(client.tracks.get(456)).rejects.toBeInstanceOf(NotFoundErrorClass);
  });

  it("превращает 404 в NotFoundError", async () => {
    const { client } = createClient(() =>
      jsonResponse({ error: { name: "not-found", message: "нет" } }, { status: 404 }),
    );

    const error = await client.tracks.get(456).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(NotFoundErrorClass);
    expect((error as NotFoundError).status).toBe(404);
  });

  it("превращает 401 в UnauthorizedError и сохраняет request id", async () => {
    const { client } = createClient(() =>
      jsonResponse(
        { error: { name: "unauthorized", message: "Токен недействителен" } },
        { status: 401, headers: { "x-request-id": "req-1" } },
      ),
    );

    const error = await client.tracks.get(456).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(UnauthorizedErrorClass);
    expect((error as UnauthorizedErrorType).requestId).toBe("req-1");
    expect((error as UnauthorizedErrorType).message).toBe("Токен недействителен");
  });

  it("повторяет GET после 503", async () => {
    let attempt = 0;
    const { client, calls } = createClient(
      () => {
        attempt += 1;
        return attempt === 1
          ? jsonResponse({ error: { name: "unavailable" } }, { status: 503 })
          : jsonResponse({ result: [trackDto] });
      },
      { retries: 1, retry: { baseDelayMs: 1, maxDelayMs: 1 } },
    );

    const track = await client.tracks.get(456);

    expect(track.id).toBe(456);
    expect(calls).toHaveLength(2);
  });

  it("не повторяет неидемпотентный POST", async () => {
    const { client, calls } = createClient(
      (url) =>
        url.includes("/account/status")
          ? jsonResponse(statusResponse(42))
          : jsonResponse({ error: { name: "unavailable" } }, { status: 503 }),
      { retries: 3, retry: { baseDelayMs: 1, maxDelayMs: 1 } },
    );

    await expect(client.likes.tracks.add(456)).rejects.toBeTruthy();

    const posts = calls.filter((call) => call.init.method === "POST");
    expect(posts).toHaveLength(1);
  });

  it("бросает TimeoutError, если сервер не отвечает", async () => {
    const { client } = createClient(
      (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError")),
          );
        }),
      { timeoutMs: 20, retries: 0 },
    );

    await expect(client.tracks.get(456)).rejects.toBeInstanceOf(TimeoutErrorClass);
  });

  it("бросает RequestAbortedError при отмене вызывающим кодом", async () => {
    const { client } = createClient(() => jsonResponse({ result: [trackDto] }));
    const controller = new AbortController();
    controller.abort();

    const error = await client.tracks
      .get(456, { signal: controller.signal })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(RequestAbortedErrorClass);
    expect((error as RequestAbortedErrorType).code).toBe("aborted");
    expect((error as TimeoutErrorType).name).toBe("AbortError");
  });
});

describe("YandexMusicClient: аккаунт и uid", () => {
  it("кеширует uid между вызовами", async () => {
    const { client, calls } = createClient(() => jsonResponse(statusResponse(777)));

    expect(await client.getUid()).toBe(777);
    expect(await client.getUid()).toBe(777);
    expect(await client.account.uid()).toBe(777);
    expect(calls).toHaveLength(1);
  });

  it("возвращает профиль с подпиской", async () => {
    const { client } = createClient(() =>
      jsonResponse({
        result: {
          account: { uid: 5, displayName: "Имя", login: "login" },
          plus: { hasPlus: true, isTutorialCompleted: false },
        },
      }),
    );

    const account = await client.account.me();

    expect(account.uid).toBe(5);
    expect(account.plus).toEqual({ hasPlus: true, isTutorialCompleted: false });
  });
});

describe("YandexMusicClient: плейлисты и лайки", () => {
  it("строит путь плейлиста из ссылки", async () => {
    const { client, calls } = createClient(() =>
      jsonResponse({ result: { kind: 3, title: "Мне нравится" } }),
    );

    const playlist = await client.playlists.get(
      "https://music.yandex.ru/users/login.name/playlists/3",
    );

    expect(playlist.title).toBe("Мне нравится");
    expect(calls[0]!.url).toBe(
      "https://api.music.yandex.net/users/login.name/playlists/3",
    );
  });

  it("подставляет uid владельца токена для номера плейлиста", async () => {
    const { client, calls } = createClient((url) =>
      url.includes("/account/status")
        ? jsonResponse(statusResponse(42))
        : jsonResponse({ result: { kind: 3, title: "Мой" } }),
    );

    await client.playlists.get(3);

    expect(calls.map((call) => call.url)).toEqual([
      "https://api.music.yandex.net/account/status",
      "https://api.music.yandex.net/users/42/playlists/3",
    ]);
  });

  it("дробит добавление лайков на порции по 100", async () => {
    const { client, calls } = createClient((url, init) => {
      if (url.includes("/account/status")) return jsonResponse(statusResponse(42));
      if (init.method === "POST") return jsonResponse({ result: true });
      return jsonResponse({});
    });

    const ids = Array.from({ length: 150 }, (_value, index) => index + 1);
    const result = await client.likes.tracks.add(ids);

    expect(result).toBe(true);
    const posts = calls.filter((call) => call.init.method === "POST");
    expect(posts).toHaveLength(2);
    expect(new URL(posts[0]!.url).searchParams.get("track-ids")?.split(",")).toHaveLength(100);
    expect(new URL(posts[1]!.url).searchParams.get("track-ids")?.split(",")).toHaveLength(50);
  });

  it("читает любимые треки", async () => {
    const { client } = createClient(() =>
      jsonResponse({ result: { library: { tracks: [{ id: "456", albumId: "2" }] } } }),
    );

    const tracks = await client.likes.tracks.list({ userId: "someone" });

    expect(tracks.map((track) => track.id)).toEqual([456]);
  });
});

describe("YandexMusicClient: диагностика", () => {
  it("сообщает о неизвестных полях через onSchemaChange", async () => {
    const changes: SchemaChange[] = [];
    const mock = createMockFetch(() =>
      jsonResponse({ result: [{ ...trackDto, brandNewField: true }] }),
    );
    const client = new YandexMusicClient({
      token: "test-token",
      fetch: mock.fetchImpl,
      transport: { rateLimit: null },
      debug: {
        detectUnknownFields: true,
        onSchemaChange: (change) => changes.push(change),
      },
    });

    await client.tracks.get(456);

    expect(changes).toContainEqual(
      expect.objectContaining({
        kind: "unknown-field",
        path: "$.result[0].brandNewField",
        operationId: "tracks.get",
      }),
    );
  });

  it("не шумит, если диагностика выключена", async () => {
    const mock = createMockFetch(() => jsonResponse({ result: [{ ...trackDto, extra: 1 }] }));
    const client = new YandexMusicClient({
      token: "test-token",
      fetch: mock.fetchImpl,
      transport: { rateLimit: null },
    });

    await expect(client.tracks.get(456)).resolves.toBeTruthy();
  });
});

describe("YandexMusicClient: raw", () => {
  it("ходит в произвольный эндпоинт", async () => {
    const { client, calls } = createClient(() => jsonResponse({ result: { ok: true } }));

    const data = await client.raw.request<{ result: { ok: boolean } }>("/account/settings");

    expect(data.result.ok).toBe(true);
    expect(calls[0]!.url).toBe("https://api.music.yandex.net/account/settings");
  });
});
