import {
  summarizeFrames,
  windowSeries,
} from "../../../lib/three-explorer/debug/statistics";
import manifest from "../../../public/models/three-explorer/debug/manifest.json";
import type {
  TestResult,
  Scenario,
} from "../../../lib/three-explorer/debug/types";
export function fakeResult(
  scenario: Scenario = "rotate",
  id = "synthetic",
): TestResult {
  const samples = Array.from({ length: 1200 }, (_, i) => ({
    end: ((i + 1) * 1000) / 60,
    ms: 1000 / 60,
  }));
  const stats = summarizeFrames(samples, 0, 20000);
  return {
    schemaVersion: 1,
    id,
    startedAt: "2026-10-24T00:00:00.000Z",
    status: "completed",
    reason: "",
    scenario,
    requestedSeconds: 20,
    measuredMs: 20000,
    warmupMs: 2000,
    variant: manifest.variants[0],
    device: {
      model: "Synthetic test fixture",
      baselineA12X: false,
      heat: "未记录",
      notes: "Not device evidence",
    },
    environment: {
      userAgent: "synthetic",
      platform: "synthetic",
      language: "zh",
      cssWidth: 800,
      cssHeight: 400,
      pixelWidth: 800,
      pixelHeight: 400,
      deviceDpr: 2,
      requestedDpr: 1,
      actualDprX: 1,
      actualDprY: 1,
      profile: "debug",
      antialias: false,
      shadows: false,
      texturesEnabled: false,
    },
    stats,
    early10: stats,
    late10: stats,
    windows: windowSeries(samples, 20000),
    slowestOnePercentMs: Array(12).fill(1000 / 60),
    rendererInfo: {
      triangles: manifest.variants[0].triangles,
      drawCalls: 25,
      textures: 0,
      geometries: 25,
    },
    fpsChangePercent: 0,
    target45Met: true,
    thermalConclusion: "Synthetic fixture",
    downloadMs: 0,
    parseMs: 0,
    artifactRevision: manifest.variants[0].sha256,
  };
}
