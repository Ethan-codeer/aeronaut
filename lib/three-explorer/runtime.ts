import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { downloadModel } from "./download";
import { frameAirframe } from "./camera";
import { MeshoptDecoder } from "meshoptimizer";
import {
  releaseObject,
  textureMemoryEstimate,
  assertModelTextures,
} from "./resources";
import {
  renderingSize,
  viewPresets,
  type ViewName,
  type Quality,
} from "./policy";
export interface ViewerMetrics {
  downloadMs: number;
  parseMs: number;
  firstFrameMs: number;
  bytes: number;
  mime: string;
  triangles: number;
  drawCalls: number;
  geometries: number;
  textures: number;
  geometryBytes: number;
  textureBytes: number;
  framebufferBytes: number;
  pixelWidth: number;
  pixelHeight: number;
  dpr: number;
  benchmarkFps: number | null;
  benchmarkOnePercentLow?: number | null;
  benchmarkFrames: number;
  benchmarkMs: number;
  renderSubmissionMs: number;
  state: "ready" | "benchmark" | "paused";
}
export interface ExplorerHandle {
  view: (view: ViewName) => void;
  zoom: (factor: number) => void;
  rotate: (angle: number) => void;
  quality: (quality: Quality) => void;
  benchmark: () => void;
  autoRotate: (enabled: boolean) => void;
  selectPart: (part: string | null) => void;
  setPalette: (colors: Record<string, string>) => boolean;
  dispose: () => void;
}
interface Options {
  onPart?: (part: string | null) => void;
  startedAt?: number;
  initialQuality?: Quality;
  views?: typeof viewPresets;
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  url: string;
  expectedBytes: number;
  expectedSha256: string;
  expectedTextures?: number;
  signal: AbortSignal;
  onProgress: (bytes: number, total: number) => void;
  onPhase: (phase: string) => void;
  onMetrics: (metrics: ViewerMetrics) => void;
  onFatal: (message: string) => void;
}
export async function createExplorer(o: Options): Promise<ExplorerHandle> {
  const started = o.startedAt ?? performance.now();
  let disposed = false;
  let raf = 0;
  let visible = true;
  let ready = false;
  let quality: Quality = o.initialQuality ?? "efficient";
  let autoRotate = false;
  let previousFrame: number | null = null;
  let size = 39;
  let airframeBounds: THREE.Box3 | null = null;
  let airframe: THREE.Object3D | null = null;
  const baseMaterials = new Map<
    THREE.Mesh,
    THREE.Material | THREE.Material[]
  >();
  const highlights: THREE.Material[] = [];
  let transition: {
    start: number;
    from: THREE.Vector3;
    targetFrom: THREE.Vector3;
    to: THREE.Vector3;
    target: THREE.Vector3;
  } | null = null;
  const partId = (obj: THREE.Object3D): string | null => {
    for (
      let n: THREE.Object3D | null = obj;
      n && n !== airframe;
      n = n.parent
    ) {
      const name = n.name.toLowerCase();
      if (name.includes("gear")) return "gear";
      if (name.includes("engine")) return "engine";
      if (name.includes("horizontal")) return "horizontal";
      if (name.includes("vertical")) return "vertical";
      if (name.includes("wing")) return "wing";
      if (
        name.includes("fuselage") ||
        name.includes("cockpit") ||
        name.includes("cabin")
      )
        return "body";
    }
    return null;
  };
  function clearHighlight() {
    for (const [mesh, material] of baseMaterials) mesh.material = material;
    baseMaterials.clear();
    highlights.splice(0).forEach((m) => m.dispose());
  }
  function selectPart(part: string | null) {
    if (!airframe || disposed) return;
    clearHighlight();
    const box = new THREE.Box3();
    airframe.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh) || !part || partId(obj) !== part) return;
      baseMaterials.set(obj, obj.material);
      const clone = (m: THREE.Material) => {
        const h = m.clone();
        if (h instanceof THREE.MeshStandardMaterial) {
          h.emissive.set("#00a9d6");
          h.emissiveIntensity = 0.55;
        }
        highlights.push(h);
        return h;
      };
      obj.material = Array.isArray(obj.material)
        ? obj.material.map(clone)
        : clone(obj.material);
      box.expandByObject(obj);
    });
    if (!part) {
      transition = null;
      view("overview");
    } else if (!box.isEmpty()) {
      const target = box.getCenter(new THREE.Vector3());
      const distance = Math.max(
        size * 0.3,
        box.getSize(new THREE.Vector3()).length() * 1.25,
      );
      const direction = camera.position
        .clone()
        .sub(controls.target)
        .normalize();
      transition = {
        start: performance.now(),
        from: camera.position.clone(),
        targetFrom: controls.target.clone(),
        to: target.clone().addScaledVector(direction, distance),
        target,
      };
    }
    o.onPart?.(part);
    schedule();
  }
  let pointerStart: { x: number; y: number } | null = null;
  const pointerDown = (e: PointerEvent) => {
    transition = null;
    pointerStart = { x: e.clientX, y: e.clientY };
  };
  const pointerUp = (e: PointerEvent) => {
    if (
      !o.onPart ||
      !pointerStart ||
      !airframe ||
      Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) > 6
    )
      return;
    pointerStart = null;
    const r = o.canvas.getBoundingClientRect();
    const ray = new THREE.Raycaster();
    ray.setFromCamera(
      new THREE.Vector2(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        (-(e.clientY - r.top) / r.height) * 2 + 1,
      ),
      camera,
    );
    const hit = ray.intersectObject(airframe, true)[0];
    if (hit) selectPart(partId(hit.object));
  };
  if (o.onPart) {
    o.canvas.addEventListener("pointerdown", pointerDown);
    o.canvas.addEventListener("pointerup", pointerUp);
  }
  let lastEmit = 0;
  const benchmarkFrameTimes: number[] = [];
  let benchmarkPrevious = 0;
  let benchmarkStart = 0;
  let benchmarkCount = 0;
  let benchmarkFirst = 0;
  let benchmarkLast = 0;
  let benchmarkCamera: THREE.Vector3 | null = null;
  let benchmarkTarget: THREE.Vector3 | null = null;
  const candidateContext = o.canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    powerPreference: quality === "high" ? "high-performance" : "low-power",
    preserveDrawingBuffer: false,
  });
  if (!candidateContext)
    throw Error("此设备或浏览器未提供 WebGL 2，已保留2D展示。");
  const context: WebGL2RenderingContext = candidateContext;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: o.canvas,
      context,
      alpha: false,
      antialias: false,
      powerPreference: quality === "high" ? "high-performance" : "low-power",
    });
  } catch (error) {
    context.getExtension("WEBGL_lose_context")?.loseContext();
    throw error;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = false;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0c2030");
  scene.add(new THREE.HemisphereLight(0xe8f5ff, 0x617280, 2.6));
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(20, 40, 35);
  scene.add(light);
  const fill = new THREE.DirectionalLight(0x8dbedb, 1.5);
  fill.position.set(-30, 15, -20);
  scene.add(fill);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 400);
  const controls = new OrbitControls(camera, o.canvas);
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.minDistance = 7;
  controls.maxDistance = 150;
  controls.maxPolarAngle = Math.PI * 0.94;
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
  const metrics: ViewerMetrics = {
    downloadMs: 0,
    parseMs: 0,
    firstFrameMs: 0,
    bytes: 0,
    mime: "",
    triangles: 0,
    drawCalls: 0,
    geometries: 0,
    textures: 0,
    geometryBytes: 0,
    textureBytes: 0,
    framebufferBytes: 0,
    pixelWidth: 1,
    pixelHeight: 1,
    dpr: 1,
    benchmarkFps: null,
    benchmarkFrames: 0,
    benchmarkMs: 0,
    renderSubmissionMs: 0,
    state: "ready",
  };
  function emit(force = false) {
    const now = performance.now();
    if (force || now - lastEmit > 250) {
      lastEmit = now;
      o.onMetrics({ ...metrics });
    }
  }
  function schedule() {
    if (disposed || !ready || document.hidden || !visible || raf) return;
    raf = requestAnimationFrame(render);
  }
  function restoreBenchmark() {
    benchmarkStart = 0;
    controls.enabled = true;
    if (benchmarkCamera && benchmarkTarget) {
      camera.position.copy(benchmarkCamera);
      controls.target.copy(benchmarkTarget);
      controls.update();
    }
    benchmarkCamera = null;
    benchmarkTarget = null;
    metrics.state = "ready";
  }
  function render(now: number) {
    raf = 0;
    if (disposed || !ready || document.hidden || !visible) return;
    if (benchmarkStart) {
      const elapsed = now - benchmarkStart;
      if (elapsed < 5000) {
        camera.position
          .sub(controls.target)
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.004)
          .add(controls.target);
        camera.lookAt(controls.target);
        if (elapsed >= 500) {
          if (benchmarkPrevious)
            benchmarkFrameTimes.push(now - benchmarkPrevious);
          benchmarkPrevious = now;
          benchmarkCount++;
          if (!benchmarkFirst) benchmarkFirst = now;
          benchmarkLast = now;
        }
        metrics.state = "benchmark";
      } else {
        metrics.benchmarkFrames = benchmarkCount;
        metrics.benchmarkMs = benchmarkLast - benchmarkFirst;
        metrics.benchmarkFps =
          benchmarkCount >= 2
            ? ((benchmarkCount - 1) * 1000) / metrics.benchmarkMs
            : null;
        const slowest = [...benchmarkFrameTimes]
          .sort((a, b) => b - a)
          .slice(0, Math.max(1, Math.ceil(benchmarkFrameTimes.length * 0.01)));
        metrics.benchmarkOnePercentLow = slowest.length
          ? 1000 / (slowest.reduce((a, b) => a + b, 0) / slowest.length)
          : null;
        if (
          quality === "high" &&
          metrics.benchmarkFps !== null &&
          metrics.benchmarkFps < 50
        ) {
          quality = "balanced";
          resize();
        }
        restoreBenchmark();
      }
    }
    if (autoRotate && !benchmarkStart) {
      const delta =
        previousFrame === null
          ? 0
          : Math.min(0.1, Math.max(0, now - previousFrame) / 1000);
      camera.position
        .sub(controls.target)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), delta * 0.22)
        .add(controls.target);
      camera.lookAt(controls.target);
    }
    if (transition) {
      const t = Math.min(1, Math.max(0, (now - transition.start) / 550));
      const ease = t * t * (3 - 2 * t);
      camera.position.lerpVectors(transition.from, transition.to, ease);
      controls.target.lerpVectors(
        transition.targetFrom,
        transition.target,
        ease,
      );
      controls.update();
      if (t === 1) transition = null;
    }
    previousFrame = now;
    const t = performance.now();
    try {
      renderer.render(scene, camera);
    } catch {
      dispose();
      o.onFatal("图形渲染失败，已切换至2D；可降低画质后重试。");
      return;
    }
    metrics.renderSubmissionMs = performance.now() - t;
    metrics.drawCalls = renderer.info.render.calls;
    metrics.triangles = renderer.info.render.triangles;
    metrics.geometries = renderer.info.memory.geometries;
    metrics.textures = renderer.info.memory.textures;
    emit(!benchmarkStart && !autoRotate);
    if (benchmarkStart || autoRotate || transition) schedule();
  }
  function resize() {
    if (disposed) return;
    const rect = o.container.getBoundingClientRect();
    const r = renderingSize(
      rect.width || 640,
      rect.height || 460,
      window.devicePixelRatio,
      quality,
    );
    const hardware =
      typeof context.getParameter === "function"
        ? context.getParameter(context.MAX_RENDERBUFFER_SIZE) || 4096
        : 4096;
    r.dpr = Math.min(r.dpr, hardware / r.width, hardware / r.height);
    r.pixelWidth = Math.max(1, Math.floor(r.width * r.dpr));
    r.pixelHeight = Math.max(1, Math.floor(r.height * r.dpr));
    renderer.setPixelRatio(r.dpr);
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    previousFrame = null;
    metrics.dpr = r.dpr;
    metrics.pixelWidth = context.drawingBufferWidth || r.pixelWidth;
    metrics.pixelHeight = context.drawingBufferHeight || r.pixelHeight;
    metrics.framebufferBytes = r.pixelWidth * r.pixelHeight * 8;
    schedule();
  }
  function view(name: ViewName) {
    if (disposed) return;
    if (benchmarkStart) restoreBenchmark();
    const preset = (o.views ?? viewPresets)[name];
    camera.up.set(0, 1, 0);
    const fit =
      name === "overview" || name === "top"
        ? Math.max(1, 1 / camera.aspect)
        : 1;
    camera.position.fromArray(preset.position).multiplyScalar(size * fit);
    controls.target.fromArray(preset.target).multiplyScalar(size);
    if (o.views && airframeBounds && (name === "overview" || name === "top"))
      frameAirframe(camera, airframeBounds, controls.target);
    camera.lookAt(controls.target);
    controls.update();
    schedule();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(o.container);
  const observer =
    typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(
          (entries) => {
            visible = entries[0]?.isIntersecting ?? true;
            if (visible) {
              metrics.state = "ready";
              schedule();
            } else {
              if (benchmarkStart) restoreBenchmark();
              metrics.state = "paused";
              emit(true);
            }
          },
          { threshold: 0.01 },
        )
      : null;
  observer?.observe(o.container);
  function visibility() {
    if (document.hidden) {
      if (benchmarkStart) restoreBenchmark();
      metrics.state = "paused";
      emit(true);
    } else {
      metrics.state = "ready";
      schedule();
    }
  }
  function lost(e: Event) {
    e.preventDefault();
    if (!disposed) {
      dispose();
      o.onFatal("3D图形上下文已丢失，已切换至2D。可重试或降低浏览器资源占用。");
    }
  }
  o.canvas.addEventListener("webglcontextlost", lost);
  document.addEventListener("visibilitychange", visibility);
  controls.addEventListener("change", schedule);
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    controls.removeEventListener("change", schedule);
    controls.dispose();
    ro.disconnect();
    observer?.disconnect();
    document.removeEventListener("visibilitychange", visibility);
    o.canvas.removeEventListener("webglcontextlost", lost);
    clearHighlight();
    o.canvas.removeEventListener("pointerdown", pointerDown);
    o.canvas.removeEventListener("pointerup", pointerUp);
    releaseObject(scene);
    scene.clear();
    renderer.dispose();
    renderer.forceContextLoss();
  }
  try {
    o.onPhase("下载 GLB 模型");
    const downloadStart = performance.now();
    const result = await downloadModel(
      `${o.url}?v=${o.expectedSha256.slice(0, 16)}`,
      o.expectedBytes,
      o.signal,
      o.onProgress,
    );
    metrics.downloadMs = performance.now() - downloadStart;
    metrics.bytes = result.bytes;
    metrics.mime = result.mime;
    if (o.signal.aborted || disposed)
      throw new DOMException("Aborted", "AbortError");
    if (crypto.subtle) {
      const digest = await crypto.subtle.digest("SHA-256", result.data);
      const sha = [...new Uint8Array(digest)]
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("");
      if (sha !== o.expectedSha256)
        throw Error("模型完整性校验失败，已停止3D加载。");
    }
    o.onPhase("解析模型与准备图形");
    const parseStart = performance.now();
    await MeshoptDecoder.ready;
    const gltf = await new GLTFLoader()
      .setMeshoptDecoder(MeshoptDecoder)
      .parseAsync(result.data, "");
    metrics.parseMs = performance.now() - parseStart;
    if (o.signal.aborted || disposed) {
      releaseObject(gltf.scene);
      throw new DOMException("Aborted", "AbortError");
    }
    scene.add(gltf.scene);
    airframe = gltf.scene;
    if (o.expectedTextures !== undefined)
      assertModelTextures(gltf.scene, o.expectedTextures);
    const bounds = new THREE.Box3().setFromObject(gltf.scene),
      center = bounds.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(center);
    airframeBounds = new THREE.Box3().setFromObject(gltf.scene);
    const extents = bounds.getSize(new THREE.Vector3());
    size = Math.max(extents.x, extents.y, extents.z);
    controls.minDistance = size * 0.08;
    controls.maxDistance = size * 7;
    camera.far = size * 12;
    metrics.textureBytes = textureMemoryEstimate(gltf.scene);
    const seen = new Set<THREE.BufferGeometry>();
    const buffers = new Set<object>();
    gltf.scene.traverse((object) => {
      if (object instanceof THREE.Mesh && !seen.has(object.geometry)) {
        seen.add(object.geometry);
        for (const attr of Object.values(object.geometry.attributes) as (
          THREE.BufferAttribute | THREE.InterleavedBufferAttribute
        )[]) {
          const buffer =
            attr instanceof THREE.InterleavedBufferAttribute ? attr.data : attr;
          if (!buffers.has(buffer)) {
            buffers.add(buffer);
            metrics.geometryBytes += buffer.array.byteLength;
          }
        }
        metrics.geometryBytes += object.geometry.index?.array.byteLength || 0;
      }
    });
    const grid = new THREE.GridHelper(size * 1.6, 16, 0x315268, 0x203e52);
    grid.position.y = bounds.min.y - center.y - 0.08;
    scene.add(grid);
    resize();
    ready = true;
    view("overview");
    o.onPhase("提交首帧");
    renderer.render(scene, camera);
    metrics.firstFrameMs = performance.now() - started;
    metrics.drawCalls = renderer.info.render.calls;
    metrics.triangles = renderer.info.render.triangles;
    metrics.geometries = renderer.info.memory.geometries;
    metrics.textures = renderer.info.memory.textures;
    emit(true);
    o.onPhase("模型已就绪");
    return {
      view,
      selectPart,
      setPalette(colors) {
        if (!airframe || disposed) return false;
        // Validate the whole material transaction before changing any color.
        const changes: { m: THREE.MeshStandardMaterial; color: string }[] = [];
        const materials = new Set<THREE.Material>();
        airframe.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            const m = baseMaterials.get(obj) ?? obj.material;
            (Array.isArray(m) ? m : [m]).forEach((v) => materials.add(v));
          }
        });
        for (const [name, color] of Object.entries(colors)) {
          if (!/^#[0-9a-f]{6}$/i.test(color)) return false;
          const found = [...materials].filter(
            (m) => m.name === name && m instanceof THREE.MeshStandardMaterial,
          ) as THREE.MeshStandardMaterial[];
          if (!found.length) return false;
          found.forEach((m) => changes.push({ m, color }));
        }
        clearHighlight();
        changes.forEach(({ m, color }) => m.color.set(color));
        o.onPart?.(null);
        schedule();
        return true;
      },
      zoom(factor) {
        if (disposed) return;
        if (benchmarkStart) restoreBenchmark();
        const offset = camera.position.clone().sub(controls.target);
        offset.setLength(
          THREE.MathUtils.clamp(
            offset.length() * factor,
            controls.minDistance,
            controls.maxDistance,
          ),
        );
        camera.position.copy(controls.target).add(offset);
        controls.update();
        schedule();
      },
      rotate(angle) {
        if (disposed) return;
        if (benchmarkStart) restoreBenchmark();
        camera.position
          .sub(controls.target)
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), angle)
          .add(controls.target);
        controls.update();
        schedule();
      },
      quality(value) {
        if (disposed) return;
        quality = value;
        resize();
      },
      autoRotate(enabled) {
        if (disposed) return;
        if (benchmarkStart) restoreBenchmark();
        autoRotate = enabled;
        previousFrame = null;
        schedule();
      },
      benchmark() {
        autoRotate = false;
        if (disposed || benchmarkStart || !visible || document.hidden) return;
        benchmarkCamera = camera.position.clone();
        benchmarkTarget = controls.target.clone();
        benchmarkStart = performance.now();
        benchmarkCount = 0;
        benchmarkPrevious = 0;
        benchmarkFrameTimes.length = 0;
        metrics.benchmarkOnePercentLow = null;
        benchmarkFirst = 0;
        benchmarkLast = 0;
        metrics.benchmarkFps = null;
        controls.enabled = false;
        schedule();
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
