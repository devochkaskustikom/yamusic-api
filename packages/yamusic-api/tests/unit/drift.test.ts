import { describe, expect, it } from "vitest";
import { detectSchemaChanges } from "../../src/schema/drift.js";

describe("detectSchemaChanges", () => {
  const accountResponse = {
    invocationInfo: { "req-id": "abc" },
    result: {
      account: { uid: 1, displayName: "Слушатель" },
      plus: { hasPlus: true, isTutorialCompleted: false },
    },
  };

  it("не находит расхождений в ожидаемом ответе", () => {
    expect(detectSchemaChanges(accountResponse, "AccountStatusResponse")).toEqual([]);
  });

  it("сообщает о неизвестном поле, но не падает", () => {
    const changes = detectSchemaChanges(
      {
        ...accountResponse,
        result: { ...accountResponse.result, newFeature: 42 },
      },
      "AccountStatusResponse",
    );

    expect(changes).toContainEqual(
      expect.objectContaining({ kind: "unknown-field", path: "$.result.newFeature" }),
    );
  });

  it("сообщает об отсутствии обязательного поля", () => {
    const changes = detectSchemaChanges(
      { result: { plus: { hasPlus: true } } },
      "AccountStatusResponse",
    );

    expect(changes).toContainEqual(
      expect.objectContaining({ kind: "missing-field", path: "$.result.account" }),
    );
  });

  it("сообщает о неверном типе", () => {
    const changes = detectSchemaChanges(
      { result: { account: { uid: "1" } } },
      "AccountStatusResponse",
    );

    expect(changes).toContainEqual(
      expect.objectContaining({ kind: "type-mismatch", path: "$.result.account.uid" }),
    );
  });

  it("разбирает union и не шумит при совпадении одного из вариантов", () => {
    const changes = detectSchemaChanges(
      { result: null },
      "LyricsResponse",
    );

    expect(changes).toEqual([]);
  });

  it("возвращает пустой список для неизвестной схемы", () => {
    expect(detectSchemaChanges({ anything: true }, "NoSuchSchema")).toEqual([]);
  });

  it("не уходит в бесконечность на глубоких данных", () => {
    const deep: Record<string, unknown> = {};
    let cursor = deep;
    for (let index = 0; index < 40; index += 1) {
      const next: Record<string, unknown> = {};
      cursor.child = next;
      cursor = next;
    }

    expect(() => detectSchemaChanges(deep, "SearchResponse")).not.toThrow();
  });
});
