import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emptyProgress, STORAGE_KEY } from "../lib/progress";
const fakeWindow = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal("window", fakeWindow);
});
afterEach(() => {
  vi.unstubAllGlobals();
});
describe("browser storage resilience", () => {
  it("loads and persists real user progress", async () => {
    const values = new Map([
      [
        STORAGE_KEY,
        JSON.stringify({ ...emptyProgress, favorites: ["a350-900"] }),
      ],
    ]);
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });
    const store = await import("../lib/progress-store");
    const notify = vi.fn();
    const unsubscribe = store.subscribeProgress(notify);
    expect(store.getProgressSnapshot().progress.favorites).toEqual([
      "a350-900",
    ]);
    store.updateProgress((p) => ({ ...p, labUsed: true }));
    expect(JSON.parse(values.get(STORAGE_KEY)!).labUsed).toBe(true);
    expect(notify).toHaveBeenCalled();
    unsubscribe();
  });
  it("retains session progress and reports failed writes when storage is blocked", async () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw Error("denied");
      },
      setItem: () => {
        throw Error("quota");
      },
    });
    const store = await import("../lib/progress-store");
    const unsubscribe = store.subscribeProgress(() => {});
    expect(store.getProgressSnapshot().ready).toBe(true);
    expect(store.getProgressSnapshot().error).not.toBe("");
    store.updateProgress((p) => ({ ...p, favorites: ["c919"] }));
    expect(store.getProgressSnapshot().progress.favorites).toEqual(["c919"]);
    expect(store.getProgressSnapshot().error).toContain("导出");
    unsubscribe();
  });
  it("does not replace current progress with a malformed import", async () => {
    vi.stubGlobal("localStorage", { getItem: () => null, setItem: vi.fn() });
    const store = await import("../lib/progress-store");
    const unsubscribe = store.subscribeProgress(() => {});
    store.updateProgress((p) => ({ ...p, labUsed: true }));
    expect(() => store.importProgress('{"version":7}')).toThrow();
    expect(store.getProgressSnapshot().progress.labUsed).toBe(true);
    unsubscribe();
  });
});

describe("V1 migration storage scope", () => {
  it("only rewrites its own record and does not bring back the retired list", async () => {
    const old = {
      ...emptyProgress,
      version: 1,
      wrong: ["q-2"],
      favorites: ["c919"],
      visited: ["c919"],
      labUsed: true,
    };
    const values = new Map([
      [STORAGE_KEY, JSON.stringify(old)],
      ["unrelated", "retain me"],
    ]);
    const writes = vi.fn((key: string, value: string) =>
      values.set(key, value),
    );
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: writes,
    });
    const store = await import("../lib/progress-store");
    const stop = store.subscribeProgress(() => {});
    expect(writes).toHaveBeenCalledTimes(1);
    expect(writes.mock.calls[0][0]).toBe(STORAGE_KEY);
    expect(values.get("unrelated")).toBe("retain me");
    expect(JSON.parse(values.get(STORAGE_KEY)!)).not.toHaveProperty("wrong");
    expect(store.getProgressSnapshot().progress.favorites).toEqual(["c919"]);
    expect(store.getProgressSnapshot().progress.labUsed).toBe(true);
    stop();
  });
});
