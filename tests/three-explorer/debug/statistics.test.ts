import { describe, it, expect } from "vitest";
import {
  FrameWindow,
  summarizeFrames,
  windowSeries,
  type FrameSample,
} from "../../../lib/three-explorer/debug/statistics";
function frames(ms: number, count: number, start = 0) {
  return Array.from({ length: count }, (_, i) => ({
    end: start + (i + 1) * ms,
    ms,
  }));
}
describe("frame-time performance statistics", () => {
  it("reports weighted 1s and 10s frame rates on a 60Hz timeline", () => {
    const window = new FrameWindow();
    for (let i = 0; i <= 1200; i++) window.push((i * 1000) / 60);
    const result = window.metrics(20000);
    expect(result.realtime.fps).toBeCloseTo(60, 5);
    expect(result.tenSeconds.fps).toBeCloseTo(60, 5);
    expect(result.tenSeconds.low1Fps).toBeCloseTo(60, 5);
    expect(result.tenSeconds.coverageMs).toBeCloseTo(10000, 3);
  });
  it("uses the slowest one percent mean frame time, rather than average instantaneous FPS", () => {
    const data = [...frames(10, 99), { end: 1990, ms: 1000 }];
    const result = summarizeFrames(data);
    expect(result.frames).toBe(100);
    expect(result.fps).toBeCloseTo(100000 / 1990);
    expect(result.low1Fps).toBe(1);
    expect(result.slow1MeanMs).toBe(1000);
  });
  it("rounds the slow tail up and handles fewer than 100 frames", () => {
    const data = [
      ...frames(10, 199),
      { end: 2040, ms: 50 },
      { end: 2140, ms: 100 },
    ];
    expect(summarizeFrames(data).slow1MeanMs).toBeCloseTo(160 / 3);
    expect(
      summarizeFrames([
        { end: 40, ms: 40 },
        { end: 50, ms: 10 },
      ]).low1Fps,
    ).toBe(25);
  });
  it("weights a partially overlapping long frame at the 10-second boundary", () => {
    const result = summarizeFrames([{ end: 11000, ms: 2000 }], 10000, 11000);
    expect(result.coverageMs).toBe(1000);
    expect(result.fps).toBe(0.5);
    expect(result.low1Fps).toBe(0.5);
  });
  it("does not turn an idle/reset state into zero FPS or accept invalid intervals", () => {
    const window = new FrameWindow();
    window.push(0);
    window.push(NaN);
    window.push(20);
    window.push(10);
    window.push(40);
    expect(window.metrics(40).realtime.fps).toBe(50);
    window.reset();
    expect(window.metrics(100000).realtime.fps).toBeNull();
    expect(
      summarizeFrames([
        { end: 1, ms: 0 },
        { end: 2, ms: NaN },
      ]).low1Fps,
    ).toBeNull();
  });
  it("keeps ten-second history and low-tail reporting separate from earlier smooth frames", () => {
    const window = new FrameWindow();
    for (let i = 0; i <= 600; i++) window.push((i * 1000) / 60);
    for (let i = 1; i <= 300; i++) window.push(10000 + (i * 1000) / 30);
    const result = window.metrics(20000);
    expect(result.tenSeconds.fps).toBeCloseTo(30, 5);
    expect(result.realtime.fps).toBeCloseTo(30, 5);
    expect(result.tenSeconds.low1Fps).toBeCloseTo(30, 5);
  });
  it("exports per-window performance degradation without diagnosing temperature", () => {
    const samples: FrameSample[] = [
      ...frames(1000 / 60, 600),
      ...frames(1000 / 30, 300, 10000),
    ];
    const windows = windowSeries(samples, 20000);
    expect(windows).toHaveLength(2);
    expect(windows[0].fps).toBeCloseTo(60);
    expect(windows[1].fps).toBeCloseTo(30);
  });
});
