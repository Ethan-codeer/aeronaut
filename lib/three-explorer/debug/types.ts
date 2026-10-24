import type { FrameStats } from "./statistics";
export type DebugDpr = 1 | 1.25 | 1.5 | 2;
export type Scenario = "rotate" | "static" | "switch";
export const scenarios: Record<Scenario, string> = {
  rotate: "持续旋转",
  static: "静止观察（持续绘制）",
  switch: "频繁视角切换（每秒）",
};
export interface Variant {
  id: string;
  label?: string;
  cameraProfile?: string;
  targetTriangles: number;
  triangles: number;
  bytes: number;
  sha256: string;
  url: string;
  airframes: number;
  meshes: number;
  materials: number;
  textures: number;
}
export interface DeviceNotes {
  model: string;
  baselineA12X: boolean;
  heat: "未记录" | "正常" | "温热" | "明显发热";
  notes: string;
}
export interface DebugSnapshot {
  realtime: FrameStats;
  tenSeconds: FrameStats;
  triangles: number;
  drawCalls: number;
  textures: number;
  geometries: number;
  cssWidth: number;
  cssHeight: number;
  pixelWidth: number;
  pixelHeight: number;
  deviceDpr: number;
  requestedDpr: DebugDpr;
  actualDprX: number;
  actualDprY: number;
  profile: string;
  hardwareCapped: boolean;
  running: boolean;
  paused: boolean;
  phase: string;
  elapsedMs: number;
  remainingMs: number;
}
export interface TestResult {
  schemaVersion: 1;
  id: string;
  startedAt: string;
  status:
    "completed" | "cancelled" | "interrupted" | "context-lost" | "load-error";
  reason: string;
  scenario: Scenario;
  requestedSeconds: number;
  measuredMs: number;
  warmupMs: number;
  variant: Variant;
  device: DeviceNotes;
  environment: {
    userAgent: string;
    platform: string;
    language: string;
    cssWidth: number;
    cssHeight: number;
    pixelWidth: number;
    pixelHeight: number;
    deviceDpr: number;
    requestedDpr: DebugDpr;
    actualDprX: number;
    actualDprY: number;
    profile: string;
    antialias: false;
    shadows: false;
    texturesEnabled: boolean;
    rendererRevision?: string;
    powerPreference?: "high-performance";
  };
  stats: FrameStats;
  early10: FrameStats;
  late10: FrameStats;
  windows: ({ startMs: number; endMs: number } & FrameStats)[];
  slowestOnePercentMs: number[];
  rendererInfo: {
    triangles: number;
    drawCalls: number;
    textures: number;
    geometries: number;
  };
  fpsChangePercent: number | null;
  target45Met: boolean;
  target55Met?: boolean;
  thermalConclusion: string;
  downloadMs: number;
  parseMs: number;
  artifactRevision: string;
  postRunHeat?: DeviceNotes["heat"];
}
export interface DebugHandle {
  load: (variant: Variant) => Promise<void>;
  setDpr: (dpr: DebugDpr) => void;
  setScenario: (scenario: Scenario) => void;
  setPaused: (value: boolean) => void;
  view: (name: "overview" | "nose" | "wing" | "engine" | "top") => void;
  run: (
    scenario: Scenario,
    seconds: number,
    device: DeviceNotes,
  ) => Promise<TestResult>;
  cancel: (reason?: string) => void;
  dispose: () => void;
}
