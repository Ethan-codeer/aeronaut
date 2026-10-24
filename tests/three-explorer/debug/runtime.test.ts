// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { Mesh } from "three";
import { createPerformanceExplorer } from "../../../lib/three-explorer/debug/runtime";
import manifest from "../../../public/models/three-explorer/debug/manifest.json";
import type {
  DebugSnapshot,
  TestResult,
} from "../../../lib/three-explorer/debug/types";
const fake = vi.hoisted(() => ({
  now: 0,
  nextRaf: 1,
  raf: new Map<number, FrameRequestCallback>(),
  ctx: {
    drawingBufferWidth: 800,
    drawingBufferHeight: 400,
    MAX_RENDERBUFFER_SIZE: 34024,
    getParameter: () => 4096,
    getExtension: () => null,
  },
  dispose: vi.fn(),
  lose: vi.fn(),
  controlsDispose: vi.fn(),
  download: vi.fn(),
  meshes: [] as unknown[],
  triangles: 20644,
  resize: null as null | (() => void),
}));
vi.mock("three", async (importOriginal) => {
  const real = await importOriginal<typeof import("three")>();
  return {
    ...real,
    WebGLRenderer: class {
      ratio = 1;
      capabilities = { maxTextureSize: 4096 };
      shadowMap = { enabled: false };
      info = {
        render: { calls: 25, triangles: 20644 },
        memory: { textures: 0, geometries: 25 },
      };
      setPixelRatio(n: number) {
        this.ratio = n;
      }
      setSize(w: number, h: number) {
        fake.ctx.drawingBufferWidth = Math.floor(w * this.ratio);
        fake.ctx.drawingBufferHeight = Math.floor(h * this.ratio);
      }
      getDrawingBufferSize(v: import("three").Vector2) {
        return v.set(fake.ctx.drawingBufferWidth, fake.ctx.drawingBufferHeight);
      }
      render() {
        this.info.render.triangles = fake.triangles;
      }
      dispose = fake.dispose;
      forceContextLoss = fake.lose;
    },
  };
});
vi.mock("three/addons/controls/OrbitControls.js", async () => {
  const { Vector3 } = await import("three");
  return {
    OrbitControls: class {
      target = new Vector3();
      enabled = true;
      update() {}
      dispose = fake.controlsDispose;
    },
  };
});
vi.mock("three/addons/loaders/GLTFLoader.js", async () => {
  const { Group, Mesh, BoxGeometry, MeshStandardMaterial } =
    await import("three");
  return {
    GLTFLoader: class {
      setMeshoptDecoder() {
        return this;
      }
      async parseAsync() {
        const scene = new Group();
        const mesh = new Mesh(
          new BoxGeometry(35.6, 10.6, 38.6),
          new MeshStandardMaterial(),
        );
        scene.add(mesh);
        fake.meshes.push(mesh);
        return { scene };
      }
    },
  };
});
vi.mock("meshoptimizer", () => ({
  MeshoptDecoder: { ready: Promise.resolve() },
}));
vi.mock("../../../lib/three-explorer/download", () => ({
  downloadModel: fake.download,
}));
beforeEach(() => {
  fake.now = 0;
  fake.nextRaf = 1;
  fake.raf.clear();
  fake.meshes = [];
  Object.defineProperty(document, "hidden", {
    value: false,
    configurable: true,
  });
  vi.spyOn(performance, "now").mockImplementation(() => fake.now);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    fake.ctx as never,
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        fake.resize = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    const id = fake.nextRaf++;
    fake.raf.set(id, cb);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    fake.raf.delete(id);
  });
  fake.download.mockImplementation(async (url: string) => {
    const v = manifest.variants.find((v) => v.url === url)!;
    const b = readFileSync("public" + url);
    fake.triangles = v.triangles;
    return {
      data: b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength),
      bytes: b.length,
      mime: "model/gltf-binary",
    };
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
function setup() {
  const canvas = document.createElement("canvas"),
    container = document.createElement("div");
  let width = 800;
  vi.spyOn(container, "getBoundingClientRect").mockImplementation(
    () => ({ width, height: 400 }) as DOMRect,
  );
  const snapshots: DebugSnapshot[] = [],
    results: TestResult[] = [];
  const error = vi.fn();
  const handle = createPerformanceExplorer({
    canvas,
    container,
    onSnapshot: (s) => snapshots.push(s),
    onResult: (r) => results.push(r),
    onError: error,
  });
  return {
    handle,
    canvas,
    snapshots,
    results,
    error,
    setWidth: (w: number) => {
      width = w;
    },
  };
}
function tick(time: number) {
  fake.now = time;
  const callbacks = [...fake.raf.values()];
  fake.raf.clear();
  for (const cb of callbacks) cb(time);
}
const notes = {
  model: "Synthetic WebGL fixture",
  baselineA12X: false,
  heat: "未记录" as const,
  notes: "Not real-device evidence",
};
describe("performance run lifecycle with a simulated renderer clock", () => {
  it("excludes the 2-second warmup and saves a complete frame-time based trial", async () => {
    const { handle, results, snapshots } = setup();
    await handle.load(manifest.variants[0]);
    handle.setDpr(1.25);
    const completed = handle.run("rotate", 20, notes);
    for (let i = 1; i <= 1320; i++) tick((i * 1000) / 60);
    const result = await completed;
    expect(results).toHaveLength(1);
    expect(result.measuredMs).toBeCloseTo(20000);
    expect(result.stats.frames).toBe(1200);
    expect(result.stats.fps).toBeCloseTo(60);
    expect(result.stats.low1Fps).toBeCloseTo(60);
    expect(result.target45Met).toBe(true);
    expect(result.environment.pixelWidth).toBe(1000);
    expect(result.environment.pixelHeight).toBe(500);
    expect(result.environment.actualDprX).toBe(1.25);
    expect(result.rendererInfo.triangles).toBe(manifest.variants[0].triangles);
    expect(snapshots.at(-1)!.paused).toBe(true);
    expect(snapshots.at(-1)!.realtime.fps).toBeNull();
    expect(fake.raf.size).toBe(0);
    handle.dispose();
  });
  it("does not count idle intervals or background time as valid benchmark frames", async () => {
    const { handle, results } = setup();
    await handle.load(manifest.variants[0]);
    const pending = handle.run("static", 20, notes);
    for (let i = 1; i <= 180; i++) tick((i * 1000) / 60);
    Object.defineProperty(document, "hidden", {
      value: true,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
    const r = await pending;
    expect(r.status).toBe("interrupted");
    expect(r.reason).toContain("后台");
    expect(r.target45Met).toBe(false);
    expect(r.measuredMs).toBeCloseTo(1000);
    expect(fake.raf.size).toBe(0);
    expect(results).toHaveLength(1);
    handle.dispose();
  });
  it("marks orientation/resolution changes as interruptions rather than mixing settings", async () => {
    const { handle, setWidth } = setup();
    await handle.load(manifest.variants[0]);
    const pending = handle.run("switch", 20, notes);
    tick(2000);
    tick(2020);
    setWidth(900);
    fake.resize!();
    const result = await pending;
    expect(result.status).toBe("interrupted");
    expect(result.reason).toContain("尺寸");
    expect(result.environment.cssWidth).toBe(800);
    expect(result.stats.frames).toBe(1);
    handle.dispose();
  });
  it("replaces a single loaded model and frees GPU resources on replacement and exit", async () => {
    const { handle } = setup();
    await handle.load(manifest.variants[0]);
    const first = fake.meshes[0] as Mesh;
    const geometry = vi.spyOn(first.geometry, "dispose");
    await handle.load(manifest.variants[1]);
    expect(geometry).toHaveBeenCalledTimes(1);
    handle.dispose();
    handle.dispose();
    expect(fake.dispose).toHaveBeenCalledTimes(1);
    expect(fake.lose).toHaveBeenCalledTimes(1);
    expect(fake.raf.size).toBe(0);
  });
  it("stores cancelled and context-lost partial runs and prevents mixed DPR changes", async () => {
    const { handle, canvas, results, error } = setup();
    await handle.load(manifest.variants[0]);
    const a = handle.run("rotate", 20, notes);
    expect(() => handle.setDpr(2)).toThrow();
    tick(2100);
    tick(2150);
    handle.cancel();
    expect((await a).status).toBe("cancelled");
    const b = handle.run("static", 20, notes);
    canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
    expect((await b).status).toBe("context-lost");
    expect(results).toHaveLength(2);
    expect(error).toHaveBeenCalled();
    handle.dispose();
  });
  it("supports all four debug DPR levels and rejects unsupported requests", async () => {
    const { handle, snapshots } = setup();
    await handle.load(manifest.variants[0]);
    for (const dpr of [1, 1.25, 1.5, 2] as const) {
      handle.setDpr(dpr);
      const s = snapshots.at(-1)!;
      expect(s.requestedDpr).toBe(dpr);
      expect(s.pixelWidth).toBe(800 * dpr);
      expect(s.actualDprX).toBe(dpr);
    }
    expect(() => handle.setDpr(1.75 as 1)).toThrow();
    handle.dispose();
  });
});
