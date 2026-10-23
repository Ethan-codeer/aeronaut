import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { terms, getTerm, filterTerms } from "../data/dictionary";
import { anatomyParts } from "../data/anatomy";
import { cockpitQuestions } from "../data/cockpit";
import { airports, filterAirports, regions } from "../data/airports";
import { airlines } from "../data/airlines";
import { liveries } from "../data/liveries";
import { aircraft } from "../data/aircraft";
import { prepareRound } from "../lib/challenge";
import {
  altimeterAngles,
  airspeedAngle,
  vsiAngle,
  normalizeHeading,
} from "../lib/instruments";
import { clusterPoints } from "../lib/airport-map";
const airlineSlugs = new Set(airlines.map((a) => a.slug));
describe("V1.2 linked educational data", () => {
  it("has 60+ bilingual entries in all nine categories with complete links and sources", () => {
    expect(terms.length).toBeGreaterThanOrEqual(60);
    expect(new Set(terms.map((t) => t.slug)).size).toBe(terms.length);
    expect(new Set(terms.map((t) => t.category)).size).toBe(9);
    for (const t of terms) {
      for (const k of [
        "nameEn",
        "nameZh",
        "definition",
        "explanation",
        "scenario",
        "misconception",
      ] as const)
        expect(t[k].length).toBeGreaterThan(0);
      for (const r of t.related)
        expect(getTerm(r), `${t.slug}->${r}`).toBeTruthy();
      for (const s of t.sources) expect(s.url).toMatch(/^https:/);
      expect(t.knowledgeLinks.length).toBeGreaterThan(0);
    }
    expect(getTerm("etops")!.explanation).toContain("运营人");
    expect(getTerm("pitch")!.misconception).toContain("不等于");
  });
  it("searches Chinese, English, abbreviations, category and initial together", () => {
    expect(filterTerms("升力").some((t) => t.slug === "lift")).toBe(true);
    expect(filterTerms("  etops  ")[0].slug).toBe("etops");
    expect(filterTerms("flap", "飞机结构", "F")[0].slug).toBe("flaps");
    expect(filterTerms("zzzx")).toEqual([]);
    expect(filterTerms("flap", "航空气象")).toEqual([]);
  });
  it("has eight anatomy parts linked to actual terms", () => {
    expect(anatomyParts).toHaveLength(8);
    for (const p of anatomyParts) expect(getTerm(p.term)).toBeTruthy();
  });
  it("has 20+ valid graded cockpit problems; shuffle retains the correct answer", () => {
    expect(cockpitQuestions.length).toBeGreaterThanOrEqual(20);
    expect(new Set(cockpitQuestions.map((q) => q.id)).size).toBe(
      cockpitQuestions.length,
    );
    for (const level of ["入门", "进阶", "专家"])
      expect(
        cockpitQuestions.filter((q) => q.difficulty === level).length,
      ).toBeGreaterThanOrEqual(5);
    for (const q of cockpitQuestions) {
      expect(new Set(q.options).size).toBe(4);
      expect(q.options[q.answer]).toBeTruthy();
      expect(q.explanation.length).toBeGreaterThan(10);
      expect(getTerm(q.link.split("/").pop()!)).toBeTruthy();
      expect(q.kinds.length).toBeGreaterThan(0);
    }
    const shuffled = prepareRound(cockpitQuestions, 25);
    for (const q of shuffled)
      expect(q.options[q.answer]).toBe(
        cockpitQuestions.find((o) => o.id === q.id)!.options[
          cockpitQuestions.find((o) => o.id === q.id)!.answer
        ],
      );
  });
  it("uses explicit, testable gauge scales at boundaries and wraparound", () => {
    expect(airspeedAngle(0)).toBe(-150);
    expect(airspeedAngle(200)).toBe(0);
    expect(airspeedAngle(400)).toBe(150);
    expect(airspeedAngle(900)).toBe(150);
    expect(vsiAngle(-2000)).toBe(-120);
    expect(vsiAngle(1000)).toBe(60);
    expect(altimeterAngles(12500)).toEqual({ hundreds: 180, thousands: 90 });
    expect(normalizeHeading(360)).toBe(0);
    expect(normalizeHeading(-45)).toBe(315);
  });
  it("has 50 source-backed airports in seven regions and valid relationships", () => {
    expect(airports).toHaveLength(50);
    expect(new Set(airports.map((a) => a.iata)).size).toBe(50);
    expect(new Set(airports.map((a) => a.icao)).size).toBe(50);
    for (const r of regions)
      expect(airports.some((a) => a.region === r)).toBe(true);
    for (const a of airports) {
      expect(a.iata).toMatch(/^[A-Z]{3}$/);
      expect(a.icao).toMatch(/^[A-Z]{4}$/);
      expect(Math.abs(a.latitude)).toBeLessThanOrEqual(90);
      expect(Math.abs(a.longitude)).toBeLessThanOrEqual(180);
      expect(Number.isFinite(a.elevationFt)).toBe(true);
      expect(a.sources.length).toBeGreaterThanOrEqual(2);
      expect(a.verifiedAt).toBe("2026-10-23");
      for (const s of a.hubAirlineSlugs) expect(airlineSlugs.has(s)).toBe(true);
    }
    // Sentinel coordinates detect lat/lon swaps and city-centre substitutions.
    const jfk = airports.find((a) => a.iata === "JFK")!;
    expect(jfk.latitude).toBeCloseTo(40.64, 1);
    expect(jfk.longitude).toBeCloseTo(-73.78, 1);
    const hkg = airports.find((a) => a.iata === "HKG")!;
    expect(hkg.longitude).toBeCloseTo(113.91, 1);
    expect(airports.find((a) => a.iata === "AMS")!.elevationFt).toBeLessThan(0);
  });
  it("filters airports by Chinese, ICAO, IATA, region and missing results", () => {
    expect(filterAirports("hkg")[0].iata).toBe("HKG");
    expect(filterAirports("ZBAA")[0].iata).toBe("PEK");
    expect(filterAirports("北京")).toHaveLength(2);
    expect(filterAirports("HKG", "欧洲")).toEqual([]);
    expect(filterAirports("unknown")).toEqual([]);
  });
  it("clusters nearby projected points without losing any marker", () => {
    const points = [
      { x: 5, y: 5 },
      { x: 10, y: 20 },
      { x: 100, y: 5 },
    ];
    const groups = clusterPoints(points, (p) => p, 64);
    expect(groups.map((g) => g.length)).toEqual([2, 1]);
    expect(groups.flat()).toEqual(points);
    expect(clusterPoints([], (p) => p)).toEqual([]);
  });
  it("has 20 unique livery records using the existing airline identity and licensed files", () => {
    expect(liveries).toHaveLength(20);
    expect(new Set(liveries.map((l) => l.slug)).size).toBe(20);
    for (const l of liveries) {
      expect(airlineSlugs.has(l.airlineSlug)).toBe(true);
      if (l.aircraftSlug)
        expect(aircraft.some((a) => a.slug === l.aircraftSlug)).toBe(true);
      expect(l.period).toBeNull();
      expect(l.registration).toBeNull();
      expect(l.story.length).toBeGreaterThan(20);
      if (l.media) {
        expect(existsSync(`public${l.media.file}`)).toBe(true);
        expect(l.media.license).toMatch(/^(CC BY|CC0$)/);
        expect(l.media.attribution).toBeTruthy();
        expect(l.media.source).toMatch(/^https:/);
      } else expect(l.mediaStatus).toBe("download-rate-limited");
    }
  });
});
