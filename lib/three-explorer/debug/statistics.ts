export interface FrameSample {
  end: number;
  ms: number;
}
export interface FrameStats {
  frames: number;
  coverageMs: number;
  fps: number | null;
  low1Fps: number | null;
  slow1MeanMs: number | null;
  minMs: number | null;
  maxMs: number | null;
  p95Ms: number | null;
  p99Ms: number | null;
  below45Percent: number | null;
}
export function summarizeFrames(
  samples: readonly FrameSample[],
  start = -Infinity,
  end = Infinity,
): FrameStats {
  const selected = samples.filter(
    (s) => Number.isFinite(s.ms) && s.ms > 0 && s.end > start && s.end <= end,
  );
  const times = selected.map((s) => s.ms).sort((a, b) => a - b);
  let coverageMs = 0,
    weightedFrames = 0;
  for (const sample of selected) {
    const overlap = Math.max(
      0,
      Math.min(sample.end, end) - Math.max(sample.end - sample.ms, start),
    );
    coverageMs += overlap;
    weightedFrames += overlap / sample.ms;
  }
  const worst = Math.max(1, Math.ceil(times.length * 0.01)),
    slow = times.length
      ? times.slice(-worst).reduce((a, b) => a + b, 0) / worst
      : null;
  return {
    frames: times.length,
    coverageMs,
    fps: coverageMs > 0 ? (weightedFrames * 1000) / coverageMs : null,
    low1Fps: slow ? 1000 / slow : null,
    slow1MeanMs: slow,
    minMs: times[0] ?? null,
    maxMs: times[times.length - 1] ?? null,
    p95Ms: times.length
      ? times[Math.max(0, Math.ceil(times.length * 0.95) - 1)]
      : null,
    p99Ms: times.length
      ? times[Math.max(0, Math.ceil(times.length * 0.99) - 1)]
      : null,
    below45Percent: times.length
      ? (100 * times.filter((ms) => ms > 1000 / 45).length) / times.length
      : null,
  };
}
export class FrameWindow {
  private samples: FrameSample[] = [];
  private previous: number | null = null;
  reset() {
    this.samples = [];
    this.previous = null;
  }
  push(timestamp: number) {
    const previous = this.previous;
    if (
      !Number.isFinite(timestamp) ||
      (previous !== null && timestamp <= previous)
    )
      return null;
    this.previous = timestamp;
    if (previous === null) return null;
    const sample = { end: timestamp, ms: timestamp - previous };
    this.samples.push(sample);
    this.samples = this.samples.filter((s) => s.end > timestamp - 10000);
    return sample;
  }
  metrics(now: number) {
    return {
      realtime: summarizeFrames(this.samples, now - 1000, now),
      tenSeconds: summarizeFrames(this.samples, now - 10000, now),
    };
  }
}
export function windowSeries(
  samples: readonly FrameSample[],
  durationMs: number,
) {
  const result = [];
  for (let start = 0; start < durationMs; start += 10000)
    result.push({
      startMs: start,
      endMs: Math.min(start + 10000, durationMs),
      ...summarizeFrames(samples, start, Math.min(start + 10000, durationMs)),
    });
  return result;
}
