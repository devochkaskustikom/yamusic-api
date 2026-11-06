import { describe, expect, it } from "vitest";
import { YandexMusicClient } from "../../src/client/client.js";
import { InvalidArgumentError } from "../../src/errors/index.js";
import type { Track as TrackDto } from "../../src/generated/dto.js";
import { createMockFetch, jsonResponse } from "../helpers/mock-fetch.js";

const trackDto: TrackDto = {
  id: 456,
  title: "Группа крови",
  artists: [{ id: 1, name: "Кино" }],
  albums: [{ id: 2, title: "Группа крови", year: 1988 }],
  durationMs: 300_000,
};

function statusResponse(uid = 42) {
  return jsonResponse({ result: { account: { uid, displayName: "Слушатель" } } });
}

function createClient(handler: Parameters<typeof createMockFetch>[0]) {
  const mock = createMockFetch(handler);
  const client = new YandexMusicClient({
    token: "test-token",
    fetch: mock.fetchImpl,
    transport: { rateLimit: null },
  });
  return { client, calls: mock.calls };
}

describe("YandexMusicClient: скрытые композиции", () => {
  it("читает список скрытых с явным пользователем", async () => {
    const { client, calls } = createClient(() =>
      jsonResponse({
        result: { library: { tracks: [{ id: "456", albumId: "2", timestamp: "2024-01-01T00:00:00Z" }] } },
      }),
    );

    const tracks = await client.likes.dislikes.list({ userId: "someone" });

    expect(tracks).toEqual([{ id: 456, albumId: 2, timestamp: "2024-01-01T00:00:00Z" }]);
    expect(calls[0]!.url).toBe("https://api.music.yandex.net/users/someone/dislikes/tracks");
  });

  it("скрывает композиции от uid владельца токена", async () => {
    const { client, calls } = createClient((url) =>
      url.includes("/account/status") ? statusResponse() : jsonResponse({ result: true }),
    );

    const result = await client.likes.dislikes.add([456, 457]);

    expect(result).toBe(true);
    const post = calls.find((call) => call.init.method === "POST");
    expect(post).toBeDefined();
    const url = new URL(post!.url);
    expect(url.pathname).toBe("/users/42/dislikes/tracks/add");
    expect(url.searchParams.get("track-ids")).toBe("456,457");
  });

  it("возвращает скрытые композиции обратно", async () => {
    const { client, calls } = createClient((url) =>
      url.includes("/account/status") ? statusResponse() : jsonResponse({ result: true }),
    );

    await client.likes.dislikes.remove(456);

    const post = calls.find((call) => call.init.method === "POST");
    expect(new URL(post!.url).pathname).toBe("/users/42/dislikes/tracks/remove");
  });
});

describe("YandexMusicClient: мутации плейлиста", () => {
  it("берёт revision из плейлиста, если она не передана", async () => {
    const { client, calls } = createClient((url, init) => {
      if (url.includes("/account/status")) return statusResponse();
      if (init.method === "POST") {
        return jsonResponse({ result: { kind: 3, title: "Обновлён", revision: 8 } });
      }
      return jsonResponse({ result: { kind: 3, title: "Мой", revision: 7 } });
    });

    const diff = [{ op: "delete", from: 0, to: 0 }];
    const playlist = await client.playlists.change(3, diff);

    expect(playlist.title).toBe("Обновлён");
    expect(playlist.revision).toBe(8);

    const post = calls.find((call) => call.init.method === "POST");
    expect(post).toBeDefined();
    const url = new URL(post!.url);
    expect(url.pathname).toBe("/users/42/playlists/3/change");
    expect(url.searchParams.get("revision")).toBe("7");
    expect(JSON.parse(url.searchParams.get("diff") ?? "null")).toEqual(diff);
  });

  it("строит insert-diff при добавлении треков", async () => {
    const { client, calls } = createClient((url, init) =>
      url.includes("/account/status")
        ? statusResponse()
        : init.method === "POST"
          ? jsonResponse({ result: { kind: 3, title: "Мой" } })
          : jsonResponse({}),
    );

    await client.playlists.addTracks(3, [{ id: 456, albumId: 2 }], { at: 1, revision: 5 });

    const post = calls.find((call) => call.init.method === "POST");
    const url = new URL(post!.url);
    expect(url.searchParams.get("revision")).toBe("5");
    expect(JSON.parse(url.searchParams.get("diff") ?? "null")).toEqual([
      { op: "insert", at: 1, tracks: [{ id: 456, albumId: 2 }] },
    ]);
  });

  it("строит delete-diff по диапазону индексов", async () => {
    const { client, calls } = createClient((url, init) =>
      url.includes("/account/status")
        ? statusResponse()
        : init.method === "POST"
          ? jsonResponse({ result: { kind: 3, title: "Мой" } })
          : jsonResponse({}),
    );

    await client.playlists.removeTracks(3, 2, 4, { revision: 5 });

    const post = calls.find((call) => call.init.method === "POST");
    expect(JSON.parse(new URL(post!.url).searchParams.get("diff") ?? "null")).toEqual([
      { op: "delete", from: 2, to: 4 },
    ]);
  });

  it("не отправляет запрос при некорректном диапазоне", async () => {
    const { client, calls } = createClient(() => jsonResponse({}));

    await expect(client.playlists.removeTracks(3, 4, 2)).rejects.toBeInstanceOf(
      InvalidArgumentError,
    );
    expect(calls).toHaveLength(0);
  });

  it("не отправляет запрос при пустом списке треков", async () => {
    const { client, calls } = createClient(() => jsonResponse({}));

    await expect(client.playlists.addTracks(3, [])).rejects.toBeInstanceOf(InvalidArgumentError);
    expect(calls).toHaveLength(0);
  });
});
