import { describe, expect, it } from "vitest";
import { resolveConfig } from "../../src/client/config.js";
import { ConfigError } from "../../src/errors/index.js";

describe("resolveConfig", () => {
  it("подставляет значения по умолчанию", () => {
    const config = resolveConfig({ token: "t" });

    expect(config.transport.baseUrl).toBe("https://api.music.yandex.net");
    expect(config.transport.timeoutMs).toBe(10_000);
    expect(config.transport.retries).toBe(2);
    expect(config.language).toBe("ru");
    expect(config.transport.rateLimit).toEqual({ capacity: 20, intervalMs: 1_000 });
    expect(config.debug.detectUnknownFields).toBe(false);
  });

  it("даёт отключить rate limiting", () => {
    expect(resolveConfig({ token: "t", transport: { rateLimit: null } }).transport.rateLimit).toBeNull();
  });

  it("запрещает одновременно auth и token", () => {
    expect(() =>
      resolveConfig({ token: "t", auth: { token: "другой" } }),
    ).toThrow(ConfigError);
  });

  it("запрещает пустой токен", () => {
    expect(() => resolveConfig({ token: "   " })).toThrow(ConfigError);
  });

  it("проверяет таймаут", () => {
    expect(() => resolveConfig({ token: "t", transport: { timeoutMs: 0 } })).toThrow(ConfigError);
  });

  it("проверяет количество ретраев", () => {
    expect(() => resolveConfig({ token: "t", transport: { retries: -1 } })).toThrow(ConfigError);
  });

  it("проверяет границы задержек ретраев", () => {
    expect(() =>
      resolveConfig({
        token: "t",
        transport: { retry: { baseDelayMs: 1_000, maxDelayMs: 100 } },
      }),
    ).toThrow(ConfigError);
  });

  it("принимает функцию получения токена", () => {
    const config = resolveConfig({ auth: { getToken: () => "t" } });
    expect(config.auth).toEqual({ getToken: expect.any(Function) });
  });

  it("не передаёт clientName по умолчанию", () => {
    expect(resolveConfig({ token: "t" }).transport.clientName).toBeUndefined();
  });
});
