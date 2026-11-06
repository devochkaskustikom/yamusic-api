import { describe, expect, it } from "vitest";
import { getCoverUrl, getTrackCoverUrl } from "../../src/parsers/cover-url.js";

describe("getCoverUrl", () => {
  it("подставляет размер вместо %%", () => {
    expect(getCoverUrl("avatars.yandex.net/get-music-content/123/abc/%%", "1000x1000")).toBe(
      "https://avatars.yandex.net/get-music-content/123/abc/1000x1000",
    );
  });

  it("использует 400x400 по умолчанию", () => {
    expect(getCoverUrl("avatars.yandex.net/get-music-content/123/abc/%%")).toBe(
      "https://avatars.yandex.net/get-music-content/123/abc/400x400",
    );
  });

  it("не трогает абсолютный URL без шаблона", () => {
    expect(getCoverUrl("https://avatars.yandex.net/a/b/400x400")).toBe(
      "https://avatars.yandex.net/a/b/400x400",
    );
  });

  it("восстанавливает протокол для protocol-relative ссылки", () => {
    expect(getCoverUrl("//avatars.yandex.net/a/b/%%", "200x200")).toBe(
      "https://avatars.yandex.net/a/b/200x200",
    );
  });

  it("возвращает undefined для пустого значения", () => {
    expect(getCoverUrl(undefined)).toBeUndefined();
    expect(getCoverUrl("")).toBeUndefined();
    expect(getCoverUrl(null)).toBeUndefined();
  });
});

describe("getTrackCoverUrl", () => {
  it("берёт обложку альбома, если у трека её нет", () => {
    expect(
      getTrackCoverUrl({ albums: [{ coverUri: "avatars.yandex.net/x/%%" }] }, "300x300"),
    ).toBe("https://avatars.yandex.net/x/300x300");
  });

  it("предпочитает обложку трека", () => {
    expect(
      getTrackCoverUrl(
        { coverUri: "avatars.yandex.net/track/%%", albums: [{ coverUri: "avatars.yandex.net/album/%%" }] },
        "50x50",
      ),
    ).toBe("https://avatars.yandex.net/track/50x50");
  });
});
