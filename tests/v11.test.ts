import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { airlines } from "../data/airlines";
import { airlineQuestions } from "../data/airline-questions";
import { spotterQuestions } from "../data/spotter";
import { aircraft } from "../data/aircraft";
import { parseProgress, emptyProgress } from "../lib/progress";
import { prepareRound, shuffled } from "../lib/challenge";

describe("V1.1 data and migration", () => {
  it("migrates V1 without losing favorites, achievements inputs or aggregate scores", () => {
    const old = {
      version: 1,
      favorites: ["a350-900"],
      visited: ["c919"],
      wrong: ["q-4"],
      labUsed: true,
      results: [
        { id: "r1", kind: "quiz", date: "2026-10-20", correct: 7, total: 10 },
      ],
    };
    const p = parseProgress(JSON.stringify(old));
    expect(p.version).toBe(2);
    expect(p.favorites).toEqual(old.favorites);
    expect(p.visited).toEqual(old.visited);
    expect(p.labUsed).toBe(true);
    expect(p.results).toEqual(old.results);
    expect(p).not.toHaveProperty("wrong");
    expect(parseProgress(JSON.stringify({ ...p, wrong: "obsolete" }))).toEqual(
      p,
    );
    expect(parseProgress(JSON.stringify(emptyProgress))).toEqual(emptyProgress);
  });
  it("has 15 unique sourced airlines and only existing exact fleet links", () => {
    expect(airlines).toHaveLength(15);
    for (const key of ["slug", "iata", "icao"] as const)
      expect(new Set(airlines.map((a) => a[key])).size).toBe(15);
    for (const a of airlines) {
      expect(a.iata).toMatch(/^[A-Z0-9]{2}$/);
      expect(a.icao).toMatch(/^[A-Z]{3}$/);
      expect(a.sources.length).toBeGreaterThanOrEqual(3);
      expect(a.verifiedAt).toBe("2026-10-22");
      expect(a.fleet.length).toBeGreaterThan(0);
      for (const f of a.fleet) {
        expect(aircraft.some((plane) => plane.slug === f.aircraftSlug)).toBe(
          true,
        );
        expect(f.source).toMatch(/^https:/);
      }
      for (const media of [a.logo, a.livery].filter(Boolean))
        expect(existsSync(`public${media!.file}`)).toBe(true);
    }
  });
  it("has unique, valid, sourced questions and four playable airline modes", () => {
    expect(airlineQuestions.length).toBeGreaterThanOrEqual(20);
    expect(new Set(airlineQuestions.map((q) => q.id)).size).toBe(
      airlineQuestions.length,
    );
    for (const mode of ["code", "geography", "livery", "logo"])
      expect(airlineQuestions.some((q) => q.type === mode)).toBe(true);
    for (const q of airlineQuestions) {
      expect(new Set(q.options).size).toBe(4);
      expect(q.options[q.answer]).toBeTruthy();
      expect(q.explanation.length).toBeGreaterThan(20);
      expect(q.link).toBe(`/world/airlines/${q.airlineSlug}`);
      expect(airlines.some((a) => a.slug === q.airlineSlug)).toBe(true);
      if (q.image) {
        expect(q.imageReviewed).toBe(true);
        expect(q.imageAnswerLeakRisk).toBe("low");
        expect(q.imageLicense).toBeTruthy();
        expect(q.imageSource).toMatch(/^https:/);
      } else expect(q.source).toMatch(/^https:/);
    }
  });
  it("keeps answer mapping correct when shuffling, without mutating the bank", () => {
    const bank = airlineQuestions.filter((q) => q.type === "code");
    const before = JSON.stringify(bank);
    const round = prepareRound(bank);
    expect(round).toHaveLength(10);
    expect(new Set(round.map((q) => q.id)).size).toBe(10);
    for (const q of round) {
      const original = bank.find((o) => o.id === q.id)!;
      expect(q.options[q.answer]).toBe(original.options[original.answer]);
    }
    expect(JSON.stringify(bank)).toBe(before);
    expect(shuffled([1, 2, 3], () => 0)).toEqual([2, 3, 1]);
  });
  it("uses existing assets with neutral challenge paths and strips JPEG descriptive metadata", () => {
    for (const q of [...spotterQuestions, ...airlineQuestions].filter(
      (q) => q.image,
    )) {
      expect(existsSync(`public${q.image}`)).toBe(true);
      expect(q.image).toMatch(
        /^\/images\/challenges\/[ap]-[a-f0-9]+\.(jpg|svg|webp)$/,
      );
      if (q.image!.endsWith(".jpg")) {
        const bytes = readFileSync(`public${q.image}`);
        expect(bytes.includes(Buffer.from("Exif\0\0"))).toBe(false);
        expect(bytes.includes(Buffer.from("http://ns.adobe.com/xap"))).toBe(
          false,
        );
      }
    }
  });
});
