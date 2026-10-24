import { describe, it, expect } from "vitest";
import {
  readResults,
  persistResults,
  DEBUG_STORAGE_KEY,
  briefReport,
  candidateCombinations,
} from "../../../lib/three-explorer/debug/results";
import { fakeResult } from "./fixtures";
describe("debug result persistence and reporting", () => {
  it("roundtrips only the dedicated debug key and leaves personal progress untouched", () => {
    const values = new Map([["aeronaut-progress-v1", "personal-data"]]);
    const storage = {
      getItem: (k: string) => values.get(k) || null,
      setItem: (k: string, v: string) => {
        values.set(k, v);
      },
      removeItem: (k: string) => {
        values.delete(k);
      },
    };
    persistResults(storage, [fakeResult()]);
    expect(readResults(storage)).toHaveLength(1);
    expect(values.get("aeronaut-progress-v1")).toBe("personal-data");
    expect(values.has(DEBUG_STORAGE_KEY)).toBe(true);
  });
  it("fails visibly for full/private storage without silently deleting earlier results", () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw Error("quota");
      },
      removeItem: () => {
        throw Error("must not delete");
      },
    };
    expect(() => persistResults(storage, [fakeResult()])).toThrow("quota");
    expect(() =>
      persistResults(
        storage,
        Array.from({ length: 201 }, (_, i) => fakeResult("rotate", String(i))),
      ),
    ).toThrow("200");
    expect(readResults(storage)).toEqual([]);
  });
  it("rejects corrupted history and emits a reproducible frame-time definition in the brief report", () => {
    expect(() =>
      readResults({
        getItem: () => "{bad",
        setItem: () => {},
        removeItem: () => {},
      }),
    ).toThrow();
    const result = fakeResult();
    result.postRunHeat = "温热";
    const report = briefReport(result);
    expect(report).toContain("ceil(N×1%)");
    expect(report).toContain("Synthetic test fixture");
    expect(report).toContain("温热");
    expect(report).toContain("短测达标");
  });
  it("makes no A12X claim or recommendation until all three scenarios pass for an identical environment", () => {
    const a = fakeResult("rotate", "a"),
      b = fakeResult("static", "b"),
      c = fakeResult("switch", "c");
    expect(candidateCombinations([a, b])).toEqual([]);
    const candidates = candidateCombinations([a, b, c]);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].userMarkedA12X).toBe(false);
    expect(candidates[0].longRun).toBe(false);
    c.environment.pixelWidth = 1200;
    expect(candidateCombinations([a, b, c])).toEqual([]);
    c.environment.pixelWidth = 800;
    c.target45Met = false;
    expect(candidateCombinations([a, b, c])).toEqual([]);
  });
  it("does not recommend interrupted or partial tests as complete scenario coverage", () => {
    const a = fakeResult("rotate", "a"),
      b = fakeResult("static", "b"),
      c = fakeResult("switch", "c");
    c.status = "interrupted";
    expect(candidateCombinations([a, b, c])).toEqual([]);
  });
});
