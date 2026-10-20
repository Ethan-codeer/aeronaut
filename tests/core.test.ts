import { describe, expect, it } from "vitest";
import { calculateLift, scoreAnswers } from "../lib/science";
import { aircraft } from "../data/aircraft";
import { questions, spotterQuestions } from "../data/questions";
import { emptyProgress, parseProgress } from "../lib/progress";
describe("simplified lift equation", () => {
  it("calculates force in newtons and responds quadratically to speed", () => {
    expect(calculateLift(70, 122, 1)).toBeCloseTo(366152.5);
    expect(calculateLift(140, 122, 1)).toBeCloseTo(
      calculateLift(70, 122, 1) * 4,
    );
  });
  it("returns zero with no airspeed or coefficient", () => {
    expect(calculateLift(0, 100, 1)).toBe(0);
    expect(calculateLift(100, 100, 0)).toBe(0);
  });
  it("scales linearly with reference area and coefficient", () => {
    expect(calculateLift(50, 120, 1.2)).toBeCloseTo(
      calculateLift(50, 100, 1) * 1.44,
    );
  });
  it("rejects invalid physical inputs", () => {
    expect(() => calculateLift(NaN, 100, 1)).toThrow();
    expect(() => calculateLift(-1, 100, 1)).toThrow();
    expect(() => calculateLift(10, 0, 1)).toThrow();
    expect(() => calculateLift(10, 100, 1, 0)).toThrow();
  });
});
describe("quiz integrity", () => {
  it("has 30 distinct meaningful questions with three balanced levels", () => {
    expect(questions.length).toBeGreaterThanOrEqual(30);
    expect(new Set(questions.map((q) => q.question)).size).toBe(
      questions.length,
    );
    for (const level of ["入门", "进阶", "专家"])
      expect(questions.filter((q) => q.difficulty === level)).toHaveLength(10);
    for (const q of questions) {
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      expect(new Set(q.options).size).toBe(4);
      expect(q.explanation.length).toBeGreaterThan(10);
      expect(q.explanation).not.toContain("占位");
      expect(q.source).toMatch(/^https:/);
    }
  });
  it("maps every image challenge to a real model and a valid answer", () => {
    expect(spotterQuestions.length).toBeGreaterThanOrEqual(10);
    for (const q of spotterQuestions) {
      const a = aircraft.find((a) => a.slug === q.aircraftSlug);
      expect(a).toBeDefined();
      expect(q.options).toContain(a!.model);
      expect(new Set(q.options).size).toBe(4);
    }
  });
  it("scores a completed round and an empty round correctly", () => {
    expect(
      scoreAnswers([{ correct: true }, { correct: false }, { correct: true }]),
    ).toEqual({ correct: 2, total: 3, accuracy: 67 });
    expect(scoreAnswers([]).accuracy).toBe(0);
  });
});
describe("portable local progress", () => {
  it("roundtrips valid backup and removes duplicate favorites", () => {
    const p = { ...emptyProgress, favorites: ["a350-900", "a350-900"] };
    expect(parseProgress(JSON.stringify(p)).favorites).toEqual(["a350-900"]);
  });
  it("rejects corrupted or incompatible backups", () => {
    expect(() => parseProgress("no JSON")).toThrow();
    expect(() => parseProgress('{"version":2}')).toThrow();
    expect(() =>
      parseProgress(
        JSON.stringify({
          ...emptyProgress,
          results: [
            { id: "bad", kind: "quiz", date: "bad", correct: 9, total: 5 },
          ],
        }),
      ),
    ).toThrow();
  });
});
describe("aircraft data", () => {
  it("contains 12 unique variants, sources for every key metric and no invented missing speed", () => {
    expect(aircraft).toHaveLength(12);
    expect(new Set(aircraft.map((a) => a.slug)).size).toBe(12);
    for (const a of aircraft) {
      for (const url of Object.values(a.sources))
        expect(url).toMatch(/^https:/);
      expect(a.recognition.length).toBeGreaterThanOrEqual(3);
    }
    expect(aircraft.find((a) => a.model === "C919")?.specs.cruise).toBeNull();
  });
});
