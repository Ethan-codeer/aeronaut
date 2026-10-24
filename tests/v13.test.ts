import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import models from "@/data/atlas-models.json";
import { aircraft } from "@/data/aircraft";
import { airports } from "@/data/airports";
import { anatomyParts } from "@/data/anatomy";
import dictionary from "@/data/dictionary.json";

describe("V1.3 production relationships and model budgets", () => {
  it("maps seven distinct original GLBs to exact Atlas subtypes, leaving the licensed 747 intact", () => {
    expect(models.map((m) => m.aircraftSlug).sort()).toEqual(
      [
        "a320neo",
        "a350-900",
        "a380-800",
        "737-max-8",
        "787-9",
        "c919",
        "e195-e2",
      ].sort(),
    );
    expect(new Set(models.map((m) => m.sha256)).size).toBe(7);
    for (const m of models) {
      expect(aircraft.some((a) => a.slug === m.aircraftSlug)).toBe(true);
      const bytes = readFileSync(`public${m.modelUrl}`);
      expect(bytes.byteLength).toBe(m.bytes);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(m.sha256);
      expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
      const json = JSON.parse(
        bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString(),
      );
      expect(json.animations ?? []).toHaveLength(0);
      expect(m.drawCalls).toBeLessThanOrEqual(50);
      expect(m.triangles).toBeLessThanOrEqual(200000);
      expect(m.bytes).toBeLessThan(2 * 1024 * 1024);
      expect(
        json.materials.some(
          (v: { name: string }) => v.name === "AeronautPaint",
        ),
      ).toBe(true);
      for (const prefix of [
        "Wing",
        "Fuselage",
        "Engine",
        "HorizontalTail",
        "VerticalTail",
        "NoseGear",
      ])
        expect(
          json.nodes.some((n: { name: string }) => n.name?.startsWith(prefix)),
        ).toBe(true);
      expect(
        m.liveries.every((l) => l.concept && l.name.includes("Concept Livery")),
      ).toBe(true);
      expect(existsSync(`public${m.source}`)).toBe(true);
      expect(existsSync(`public${m.posterUrl}`)).toBe(true);
    }
  });
  it("keeps all selectable structures linked to stable dictionary IDs", () => {
    for (const p of anatomyParts)
      expect(dictionary.some((d) => d.slug === p.term)).toBe(true);
  });
  it("retains valid IANA timezones and unique airport identities", () => {
    expect(airports.length).toBeGreaterThanOrEqual(100);
    expect(new Set(airports.map((a) => a.slug)).size).toBe(airports.length);
    for (const a of airports) {
      expect(
        () => new Intl.DateTimeFormat("en", { timeZone: a.timezone }),
      ).not.toThrow();
      expect(a.sources.every((s) => /^https?:/.test(s.url))).toBe(true);
    }
  });
});
