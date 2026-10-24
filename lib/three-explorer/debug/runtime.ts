import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "meshoptimizer";
import { downloadModel } from "../download";
import { viewPresets, type ViewName } from "../policy";
import {
  FrameWindow,
  summarizeFrames,
  windowSeries,
  type FrameSample,
} from "./statistics";
import type {
  Variant,
  DebugDpr,
  Scenario,
  DeviceNotes,
  DebugSnapshot,
  TestResult,
  DebugHandle,
} from "./types";
interface Options {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  onSnapshot: (snapshot: DebugSnapshot) => void;
  onResult: (result: TestResult) => void;
  onError: (message: string) => void;
}
interface Run {
  startedAt: string;
  scenario: Scenario;
  seconds: number;
  device: DeviceNotes;
  variant: Variant;
  environment: TestResult["environment"];
  start: number;
  measureStart: number | null;
  previous: number | null;
  samples: FrameSample[];
  resolve: (result: TestResult) => void;
}
export function createPerformanceExplorer(o: Options): DebugHandle {
  let disposed = false,
    paused = false,
    visible = true,
    loading = false,
    raf = 0,
    lastFrame: number | null = null,
    lastEmit = 0,
    currentVariant: Variant | null = null,
    currentModel: THREE.Group | null = null,
    requestedDpr: DebugDpr = 1,
    scenario: Scenario = "static",
    size = 39,
    run: Run | null = null,
    loadGeneration = 0,
    loadAbort: AbortController | null = null,
    downloadMs = 0,
    parseMs = 0,
    switchIndex = -1;
  const live = new FrameWindow();
  const candidateContext = o.canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false,
  });
  if (!candidateContext)
    throw Error("调试模式需要WebGL 2。普通2D展示仍可使用。");
  const context: WebGL2RenderingContext = candidateContext;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: o.canvas,
      context,
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
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
  for (const [position, color, intensity] of [
    [[20, 40, 35], 0xffffff, 3],
    [[-30, 15, -20], 0x8dbedb, 1.5],
  ] as const) {
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(position[0], position[1], position[2]);
    scene.add(light);
  }
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 400);
  const controls = new OrbitControls(camera, o.canvas);
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.minDistance = 7;
  controls.maxDistance = 150;
  controls.maxPolarAngle = Math.PI * 0.94;
  const grid = new THREE.GridHelper(62.4, 16, 0x315268, 0x203e52);
  scene.add(grid);
  let cssWidth = 1,
    cssHeight = 1,
    pixelWidth = 1,
    pixelHeight = 1,
    hardwareCapped = false,
    deviceDpr = 1;
  function dimensions() {
    const rect = o.container.getBoundingClientRect();
    cssWidth = Math.max(1, Math.floor(rect.width || 640));
    cssHeight = Math.max(1, Math.floor(rect.height || 420));
    deviceDpr = window.devicePixelRatio || 1;
    const hardware = Math.min(
      context.getParameter(context.MAX_RENDERBUFFER_SIZE) || 4096,
      renderer.capabilities.maxTextureSize || 4096,
    );
    const actual = Math.min(
      requestedDpr,
      hardware / cssWidth,
      hardware / cssHeight,
      Math.sqrt(8000000 / (cssWidth * cssHeight)),
    );
    hardwareCapped = actual < requestedDpr - 0.001;
    renderer.setPixelRatio(actual);
    renderer.setSize(cssWidth, cssHeight, false);
    camera.aspect = cssWidth / cssHeight;
    camera.updateProjectionMatrix();
    readDimensions();
  }
  function readDimensions() {
    const draw = renderer.getDrawingBufferSize(new THREE.Vector2());
    pixelWidth = context.drawingBufferWidth || draw.x;
    pixelHeight = context.drawingBufferHeight || draw.y;
  }
  function env(): TestResult["environment"] {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cssWidth,
      cssHeight,
      pixelWidth,
      pixelHeight,
      deviceDpr,
      requestedDpr,
      actualDprX: pixelWidth / cssWidth,
      actualDprY: pixelHeight / cssHeight,
      profile: `调试手动 DPR ${requestedDpr.toFixed(2)}${hardwareCapped ? "（硬件/像素上限已限幅）" : ""}`,
      antialias: false,
      shadows: false,
      texturesEnabled: false,
      rendererRevision: THREE.REVISION,
      powerPreference: "high-performance",
    };
  }
  function snapshot(now = performance.now()): DebugSnapshot {
    const frame =
      paused || loading || !currentVariant
        ? { realtime: summarizeFrames([]), tenSeconds: summarizeFrames([]) }
        : live.metrics(now);
    const elapsed =
      run && run.measureStart !== null
        ? Math.max(0, now - run.measureStart)
        : 0;
    readDimensions();
    return {
      ...frame,
      triangles: renderer.info.render.triangles,
      drawCalls: renderer.info.render.calls,
      textures: renderer.info.memory.textures,
      geometries: renderer.info.memory.geometries,
      cssWidth,
      cssHeight,
      pixelWidth,
      pixelHeight,
      deviceDpr,
      requestedDpr,
      actualDprX: pixelWidth / cssWidth,
      actualDprY: pixelHeight / cssHeight,
      profile: env().profile,
      hardwareCapped,
      running: !!run,
      paused,
      phase: loading
        ? "加载测试模型（不计帧时）"
        : paused
          ? "已暂停，FPS不计"
          : run
            ? run.measureStart === null
              ? "预热2秒（不计帧时）"
              : "测量中"
            : "连续监测 · 非正式测试结果",
      elapsedMs: elapsed,
      remainingMs: run
        ? Math.max(0, run.seconds * 1000 - elapsed) +
          (run.measureStart === null
            ? Math.max(0, 2000 - (now - run.start))
            : 0)
        : 0,
    };
  }
  function emit(force = false, now = performance.now()) {
    if (disposed) return;
    if (force || now - lastEmit >= 250) {
      lastEmit = now;
      o.onSnapshot(snapshot(now));
    }
  }
  function schedule() {
    if (disposed || paused || !visible || document.hidden || raf) return;
    raf = requestAnimationFrame(frame);
  }
  function applyView(name: ViewName) {
    const p = viewPresets[name];
    camera.up.set(0, 1, 0);
    camera.position.fromArray(p.position).multiplyScalar(size);
    controls.target.fromArray(p.target).multiplyScalar(size);
    camera.lookAt(controls.target);
    controls.update();
  }
  function release(root: THREE.Object3D) {
    const gs = new Set<THREE.BufferGeometry>(),
      ms = new Set<THREE.Material>();
    root.traverse((node) => {
      if (node instanceof THREE.Mesh || node instanceof THREE.LineSegments) {
        gs.add(node.geometry);
        for (const m of Array.isArray(node.material)
          ? node.material
          : [node.material])
          ms.add(m);
      }
    });
    for (const g of gs) g.dispose();
    for (const m of ms) m.dispose();
  }
  function finish(status: TestResult["status"], reason = "") {
    if (!run) return null;
    const active = run;
    run = null;
    const duration = active.samples.length
      ? active.samples[active.samples.length - 1].end
      : 0;
    const stats = summarizeFrames(active.samples, 0, duration);
    const early10 = summarizeFrames(
      active.samples,
      0,
      Math.min(10000, duration),
    );
    const late10 = summarizeFrames(
      active.samples,
      Math.max(0, duration - 10000),
      duration,
    );
    const change =
      early10.fps && late10.fps ? (late10.fps / early10.fps - 1) * 100 : null;
    const sorted = active.samples.map((s) => s.ms).sort((a, b) => b - a);
    const slow = sorted.slice(0, Math.max(1, Math.ceil(sorted.length * 0.01)));
    const result: TestResult = {
      schemaVersion: 1,
      id:
        globalThis.crypto?.randomUUID?.() ||
        `perf-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      startedAt: active.startedAt,
      status,
      reason,
      scenario: active.scenario,
      requestedSeconds: active.seconds,
      measuredMs: duration,
      warmupMs: 2000,
      variant: active.variant,
      device: active.device,
      environment: active.environment,
      stats,
      early10,
      late10,
      windows: windowSeries(active.samples, duration),
      slowestOnePercentMs: slow,
      rendererInfo: {
        triangles: renderer.info.render.triangles,
        drawCalls: renderer.info.render.calls,
        textures: renderer.info.memory.textures,
        geometries: renderer.info.memory.geometries,
      },
      fpsChangePercent: change,
      target45Met:
        status === "completed" &&
        duration >= active.seconds * 1000 &&
        stats.frames >= 100 &&
        (stats.fps ?? 0) >= 45 &&
        (stats.low1Fps ?? 0) >= 45 &&
        (late10.fps ?? 0) >= 45,
      thermalConclusion:
        duration < 60000
          ? "短时测试；不足以判断热机稳定性"
          : change !== null && change <= -10
            ? "末段FPS下降至少10%；可能有负载/系统/温度等影响，不能据此认定热降频"
            : "本次首末窗口已记录；浏览器无法读取芯片温度，仍需重复热机测试",
      downloadMs,
      parseMs,
      artifactRevision: active.variant.sha256,
    };
    paused = true;
    controls.enabled = false;
    cancelAnimationFrame(raf);
    raf = 0;
    lastFrame = null;
    live.reset();
    o.onResult(result);
    active.resolve(result);
    emit(true);
    return result;
  }
  function frame(now: number) {
    raf = 0;
    if (disposed || paused || !visible || document.hidden) return;
    const delta = lastFrame === null ? 0 : Math.max(0, now - lastFrame) / 1000;
    lastFrame = now;
    if (currentVariant && !loading) {
      const activeScenario = run?.scenario || scenario;
      if (activeScenario === "rotate") {
        camera.position
          .sub(controls.target)
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), delta * 0.28)
          .add(controls.target);
        camera.lookAt(controls.target);
      } else if (activeScenario === "switch") {
        const clock = run ? now - run.start : now;
        const index = Math.floor(clock / 1000) % 5;
        if (index !== switchIndex) {
          switchIndex = index;
          applyView(
            (["overview", "nose", "wing", "engine", "top"] as ViewName[])[
              index
            ],
          );
        }
      }
    }
    try {
      renderer.render(scene, camera);
    } catch {
      finish("context-lost", "渲染提交失败");
      setPaused(true);
      o.onError("图形渲染失败，结果已记录；请退出调试或降低DPR后重试。");
      return;
    }
    if (currentVariant && !loading) {
      live.push(now);
      if (run) {
        if (now - run.start >= 2000) {
          if (run.measureStart === null) {
            run.measureStart = now;
            run.previous = now;
            live.reset();
          } else if (run.previous !== null) {
            run.samples.push({
              end: now - run.measureStart,
              ms: now - run.previous,
            });
            run.previous = now;
            if (now - run.measureStart >= run.seconds * 1000) {
              finish("completed");
              return;
            }
          }
        }
      }
    }
    emit(false, now);
    schedule();
  }
  function setPaused(value: boolean) {
    if (value && run) finish("cancelled", "用户暂停测试");
    paused = value;
    controls.enabled = !value && !run;
    lastFrame = null;
    live.reset();
    if (value) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else schedule();
    emit(true);
  }
  function changedSize() {
    if (disposed) return;
    const rect = o.container.getBoundingClientRect();
    const w = Math.floor(rect.width || 640),
      h = Math.floor(rect.height || 420);
    if (run && (w !== cssWidth || h !== cssHeight))
      finish("interrupted", "测试中画布尺寸/方向发生变化");
    dimensions();
    live.reset();
    lastFrame = null;
    emit(true);
  }
  const resize = new ResizeObserver(changedSize);
  resize.observe(o.container);
  const observer =
    typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(
          (entries) => {
            visible = entries[0]?.isIntersecting ?? true;
            if (!visible) {
              finish("interrupted", "画布离开可视区域");
              setPaused(true);
            }
          },
          { threshold: 0.01 },
        )
      : null;
  observer?.observe(o.container);
  function visibility() {
    if (document.hidden) {
      finish("interrupted", "页面切入后台");
      setPaused(true);
    }
  }
  function contextLost(e: Event) {
    e.preventDefault();
    if (disposed) return;
    loadGeneration++;
    loadAbort?.abort();
    finish("context-lost", "WebGL上下文丢失");
    setPaused(true);
    o.onError("WebGL上下文已丢失。已保存本次结果，请退出调试后重新进入。");
  }
  document.addEventListener("visibilitychange", visibility);
  o.canvas.addEventListener("webglcontextlost", contextLost);
  dimensions();
  applyView("overview");
  schedule();
  async function load(variant: Variant) {
    if (disposed) throw Error("查看器已关闭");
    if (run) throw Error("测试进行中不能更换模型");
    const generation = ++loadGeneration;
    loadAbort?.abort();
    const controller = new AbortController();
    loadAbort = controller;
    loading = true;
    paused = false;
    live.reset();
    lastFrame = null;
    emit(true);
    schedule();
    let model: THREE.Group | null = null;
    try {
      const t = performance.now();
      const result = await downloadModel(
        variant.url,
        variant.bytes,
        controller.signal,
        () => {},
      );
      downloadMs = performance.now() - t;
      if (globalThis.crypto?.subtle) {
        const digest = await crypto.subtle.digest("SHA-256", result.data);
        const actual = [...new Uint8Array(digest)]
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        if (actual !== variant.sha256) throw Error("测试模型完整性校验失败");
      }
      const parseStart = performance.now();
      await MeshoptDecoder.ready;
      const gltf = await new GLTFLoader()
        .setMeshoptDecoder(MeshoptDecoder)
        .parseAsync(result.data, "");
      parseMs = performance.now() - parseStart;
      model = gltf.scene;
      if (
        disposed ||
        controller.signal.aborted ||
        generation !== loadGeneration
      ) {
        release(model);
        model = null;
        throw new DOMException("Aborted", "AbortError");
      }
      if (currentModel) {
        scene.remove(currentModel);
        release(currentModel);
      }
      currentModel = model;
      model = null;
      currentVariant = { ...variant };
      const bounds = new THREE.Box3().setFromObject(currentModel),
        center = bounds.getCenter(new THREE.Vector3());
      currentModel.position.sub(center);
      size = Math.max(...bounds.getSize(new THREE.Vector3()).toArray());
      grid.position.y = bounds.min.y - center.y - 0.08;
      scene.add(currentModel);
      loading = false;
      controls.enabled = true;
      applyView("overview");
      renderer.render(scene, camera);
      live.reset();
      lastFrame = null;
      emit(true);
      schedule();
    } catch (error) {
      if (model) release(model);
      if (generation === loadGeneration && !disposed) {
        loading = false;
        paused = true;
        cancelAnimationFrame(raf);
        raf = 0;
        live.reset();
        emit(true);
      }
      throw error;
    }
  }
  return {
    load,
    setDpr(value) {
      if (run) throw Error("测试中不能改变DPR");
      if (![1, 1.25, 1.5, 2].includes(value)) throw Error("不支持的调试DPR");
      requestedDpr = value;
      dimensions();
      live.reset();
      lastFrame = null;
      emit(true);
    },
    setScenario(value) {
      if (run) throw Error("测试中不能改变场景");
      scenario = value;
      switchIndex = -1;
      applyView("overview");
      live.reset();
      lastFrame = null;
      emit(true);
    },
    setPaused,
    view(name) {
      if (!run) {
        applyView(name);
        live.reset();
        lastFrame = null;
      }
    },
    run(value, seconds, device) {
      if (disposed || loading || !currentVariant)
        throw Error("测试模型尚未就绪");
      if (run) throw Error("已有测试进行中");
      if (!visible || document.hidden) throw Error("请保持画布与页面可见");
      if (![20, 60, 180, 300].includes(seconds))
        throw Error("请选择20、60、180或300秒");
      return new Promise<TestResult>((resolve) => {
        paused = false;
        controls.enabled = false;
        switchIndex = -1;
        applyView("overview");
        live.reset();
        lastFrame = null;
        run = {
          startedAt: new Date().toISOString(),
          scenario: value,
          seconds,
          device: { ...device },
          variant: { ...currentVariant! },
          environment: env(),
          start: performance.now(),
          measureStart: null,
          previous: null,
          samples: [],
          resolve,
        };
        emit(true);
        schedule();
      });
    },
    cancel(reason = "用户停止") {
      finish("cancelled", reason);
      setPaused(true);
    },
    dispose() {
      if (disposed) return;
      finish("interrupted", "退出调试或离开页面");
      disposed = true;
      loadGeneration++;
      loadAbort?.abort();
      cancelAnimationFrame(raf);
      resize.disconnect();
      observer?.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      o.canvas.removeEventListener("webglcontextlost", contextLost);
      controls.dispose();
      release(scene);
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
