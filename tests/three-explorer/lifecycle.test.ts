// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { Mesh } from "three";
import { createExplorer } from "../../lib/three-explorer/runtime";
import manifest from "../../public/models/three-explorer/manifest.json";
const fake = vi.hoisted(() => ({
  disposeRenderer: vi.fn(),
  forceLoss: vi.fn(),
  disposeControls: vi.fn(),
  download: vi.fn(),
  meshes: [] as unknown[],
  lastRatio: 0,
  failRender: false,
  abortOnParse: null as null | (() => void),
  closeImage: vi.fn(),
}));
vi.mock("three", async (importOriginal) => {
  const real = await importOriginal<typeof import("three")>();
  return {
    ...real,
    WebGLRenderer: class {
      shadowMap = { enabled: false };
      info = {
        render: { calls: 25, triangles: 13300 },
        memory: { geometries: 25, textures: 0 },
      };
      setPixelRatio(n: number) {
        fake.lastRatio = n;
      }
      setSize() {}
      render() {
        if (fake.failRender) throw Error("render failure");
      }
      dispose = fake.disposeRenderer;
      forceContextLoss = fake.forceLoss;
    },
  };
});
vi.mock("three/addons/controls/OrbitControls.js", async () => {
  const { Vector3 } = await import("three");
  return {
    OrbitControls: class {
      target = new Vector3();
      touches = { ONE: 0, TWO: 0 };
      enabled = true;
      events = new Map();
      addEventListener(name: string, cb: () => void) {
        this.events.set(name, cb);
      }
      removeEventListener(name: string) {
        this.events.delete(name);
      }
      update() {
        this.events.get("change")?.();
      }
      dispose = fake.disposeControls;
    },
  };
});
vi.mock("three/addons/loaders/GLTFLoader.js", async () => {
  const { Group, Mesh, BoxGeometry, MeshStandardMaterial, Texture } =
    await import("three");
  return {
    GLTFLoader: class {
      setMeshoptDecoder() {
        return this;
      }
      async parseAsync() {
        const scene = new Group();
        const mesh = new Mesh(
          new BoxGeometry(35, 10, 39),
          new MeshStandardMaterial({
            map: new Texture({
              width: 2048,
              height: 2048,
              close: fake.closeImage,
            } as never),
          }),
        );
        fake.meshes.push(mesh);
        fake.abortOnParse?.();
        scene.add(mesh);
        return { scene };
      }
    },
  };
});
vi.mock("../../lib/three-explorer/download", () => ({
  downloadModel: fake.download,
}));
beforeEach(() => {
  Object.defineProperty(document, "hidden", {
    value: false,
    configurable: true,
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
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
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn(() => 1),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    {} as never,
  );
  const file = readFileSync("public/models/three-explorer/generic-twinjet.glb");
  fake.download.mockResolvedValue({
    data: file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength),
    bytes: file.byteLength,
    mime: "application/octet-stream",
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  fake.meshes.length = 0;
  fake.failRender = false;
  fake.abortOnParse = null;
});
function options() {
  const canvas = document.createElement("canvas"),
    container = document.createElement("div");
  return {
    canvas,
    container,
    url: manifest.modelUrl,
    expectedBytes: manifest.bytes,
    expectedSha256: manifest.sha256,
    signal: new AbortController().signal,
    onProgress: vi.fn(),
    onPhase: vi.fn(),
    onMetrics: vi.fn(),
    onFatal: vi.fn(),
  };
}
describe("renderer lifetime with a simulated WebGL renderer", () => {
  it("cleans up when the first frame throws", async () => {
    fake.failRender = true;
    await expect(createExplorer(options())).rejects.toThrow("render failure");
    expect(fake.disposeRenderer).toHaveBeenCalledTimes(1);
    expect(fake.forceLoss).toHaveBeenCalledTimes(1);
  });
  it("falls back on a later animation-frame render error", async () => {
    const o = options(),
      handle = await createExplorer(o);
    const callback = vi.mocked(requestAnimationFrame).mock.calls[0][0];
    fake.failRender = true;
    callback(performance.now());
    expect(o.onFatal).toHaveBeenCalledWith(expect.stringContaining("2D"));
    expect(fake.disposeRenderer).toHaveBeenCalledTimes(1);
    handle.dispose();
  });

  it("disposes geometry, materials, controls and context on exit, idempotently", async () => {
    const o = options(),
      handle = await createExplorer(o);
    expect(fake.download.mock.calls[0][0]).toBe(
      `${manifest.modelUrl}?v=${manifest.sha256.slice(0, 16)}`,
    );
    const mesh = fake.meshes[0] as Mesh;
    const geometry = vi.spyOn(mesh.geometry, "dispose");
    const material = vi.spyOn(
      mesh.material as import("three").Material,
      "dispose",
    );
    handle.dispose();
    handle.dispose();
    expect(geometry).toHaveBeenCalledTimes(1);
    expect(material).toHaveBeenCalledTimes(1);
    expect(fake.disposeControls).toHaveBeenCalledTimes(1);
    expect(fake.disposeRenderer).toHaveBeenCalledTimes(1);
    expect(fake.forceLoss).toHaveBeenCalledTimes(1);
    expect(o.onMetrics).toHaveBeenCalled();
  });
  it("closes decoded textures after cancellation during parsing and releases the partial context", async () => {
    const controller = new AbortController();
    fake.abortOnParse = () => controller.abort();
    await expect(
      createExplorer({ ...options(), signal: controller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(fake.closeImage).toHaveBeenCalledTimes(1);
    expect(fake.disposeRenderer).toHaveBeenCalledTimes(1);
  });
  it("rejects missing texture maps and releases the partial scene instead of silently showing an untextured 747", async () => {
    await expect(
      createExplorer({ ...options(), expectedTextures: 2 }),
    ).rejects.toThrow("纹理未完整加载");
    expect(fake.closeImage).toHaveBeenCalledTimes(1);
    expect(fake.disposeRenderer).toHaveBeenCalledTimes(1);
  });
  it("does not download the model when WebGL2 is unavailable", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    await expect(createExplorer(options())).rejects.toThrow("WebGL 2");
    expect(fake.download).not.toHaveBeenCalled();
  });
  it("cleans up an allocated context when model transport fails", async () => {
    fake.download.mockRejectedValueOnce(Error("network unavailable"));
    await expect(createExplorer(options())).rejects.toThrow(
      "network unavailable",
    );
    expect(fake.disposeControls).toHaveBeenCalledTimes(1);
    expect(fake.disposeRenderer).toHaveBeenCalledTimes(1);
    expect(fake.forceLoss).toHaveBeenCalledTimes(1);
  });
  it("releases resources on context loss and reports a 2D recovery path", async () => {
    const o = options(),
      handle = await createExplorer(o);
    o.canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
    expect(o.onFatal).toHaveBeenCalledWith(expect.stringContaining("2D"));
    expect(fake.disposeRenderer).toHaveBeenCalledTimes(1);
    handle.dispose();
    expect(fake.disposeRenderer).toHaveBeenCalledTimes(1);
  });
  it("caps quality and schedules no persistent animation loop while idle", async () => {
    const o = options(),
      handle = await createExplorer(o);
    const calls = vi.mocked(requestAnimationFrame).mock.calls.length;
    expect(calls).toBeLessThanOrEqual(1);
    handle.quality("balanced");
    expect(fake.lastRatio).toBeLessThanOrEqual(1.5);
    expect(
      vi.mocked(requestAnimationFrame).mock.calls.length,
    ).toBeLessThanOrEqual(1);
    handle.dispose();
  });
});
