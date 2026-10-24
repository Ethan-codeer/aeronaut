"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import models from "@/data/atlas-models.json";
import boeing from "@/public/models/boeing747/manifest.json";
import { anatomyParts } from "@/data/anatomy";
import type {
  ExplorerHandle,
  ViewerMetrics,
} from "@/lib/three-explorer/runtime";
import { boeing747Views } from "@/lib/three-explorer/boeing747";
import styles from "./three-explorer/explorer.module.css";
interface Model {
  aircraftSlug: string;
  modelUrl: string;
  bytes: number;
  sha256: string;
  textures: number;
  triangles: number;
  license: string;
  source: string;
  limitations: string[];
  liveries: { id: string; name: string; colors: Record<string, string> }[];
}
export function Atlas3D({
  slug,
  name,
  image,
}: {
  slug: string;
  name: string;
  image: string;
}) {
  const model = (models as unknown as Model[]).find(
    (m) => m.aircraftSlug === slug,
  );
  if (!model && slug !== "747-8") return null;
  return (
    <section className="section" id="aircraft-3d">
      <span className="eyebrow blue">3D AIRCRAFT ATLAS / V1.3</span>
      <h2>{name} · 3D Anatomy</h2>
      <AtlasViewer slug={slug} name={name} image={image} model={model} />
    </section>
  );
}
function AtlasViewer({
  slug,
  name,
  image,
  model,
}: {
  slug: string;
  name: string;
  image: string;
  model?: Model;
}) {
  const [active, setActive] = useState(false),
    [retry, setRetry] = useState(0),
    [error, setError] = useState(""),
    [part, setPart] = useState<string | null>(null),
    [metrics, setMetrics] = useState<ViewerMetrics | null>(null),
    [progress, setProgress] = useState(0),
    [palette, setPalette] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null),
    container = useRef<HTMLDivElement>(null),
    handle = useRef<ExplorerHandle | null>(null);
  const variant = boeing.variants.find((v) => v.id === "boeing747-balanced")!;
  const asset = model ?? {
    modelUrl: variant.url,
    bytes: variant.bytes,
    sha256: variant.sha256,
    textures: variant.textures,
  };
  useEffect(() => {
    if (!active || !canvas.current || !container.current) return;
    const abort = new AbortController();
    let closed = false;
    setError("");
    setMetrics(null);
    setProgress(0);
    setPart(null);
    setPalette("");
    const startedAt = performance.now();
    import("@/lib/three-explorer/runtime")
      .then(({ createExplorer }) => {
        if (closed) return;
        return createExplorer({
          canvas: canvas.current!,
          container: container.current!,
          url: asset.modelUrl,
          expectedBytes: asset.bytes,
          expectedSha256: asset.sha256,
          expectedTextures: asset.textures,
          initialQuality: "high",
          views: slug === "747-8" ? boeing747Views : undefined,
          signal: abort.signal,
          startedAt,
          onProgress: (n, total) => {
            if (!closed) setProgress(Math.round((n / total) * 100));
          },
          onPhase: () => {},
          onMetrics: (m) => {
            if (!closed) setMetrics(m);
          },
          onPart: (p) => {
            if (!closed) setPart(p);
          },
          onFatal: (e) => {
            if (!closed) {
              setError(e);
              abort.abort();
            }
          },
        });
      })
      .then((h) => {
        if (h) {
          if (closed) h.dispose();
          else handle.current = h;
        }
      })
      .catch((e) => {
        if (!closed && !abort.signal.aborted)
          setError(e instanceof Error ? e.message : "3D加载失败");
      });
    return () => {
      closed = true;
      abort.abort();
      handle.current?.dispose();
      handle.current = null;
    };
  }, [
    active,
    retry,
    asset.modelUrl,
    asset.bytes,
    asset.sha256,
    asset.textures,
    slug,
  ]);
  const selected = anatomyParts.find((p) => p.id === part);
  const parts = anatomyParts.filter((p) =>
    ["wing", "body", "engine", "horizontal", "vertical", "gear"].includes(p.id),
  );
  return (
    <div className={styles.explorer}>
      <p className="body-copy">
        {model
          ? "独立简化教学模型：按该子型号的长宽比例与主要外形特征制作，非厂商精确几何。AERONAUT Concept Livery 为原创概念配色，不代表真实航司运营涂装。"
          : "复用 FlightGear GPL 2.0 的 747-8 Intercontinental 模型；保留原有中性纹理外观，无可用授权航司涂装。"}
      </p>
      <div className={styles.stage} ref={container}>
        {(!active || error) && (
          <img
            className={styles.poster}
            src={image}
            alt={`${name} 静态参考照片（不是模型渲染）`}
          />
        )}
        {active && !error && (
          <canvas
            className={styles.canvas}
            ref={canvas}
            aria-label={`${name} 可旋转模型；点击结构或使用下方结构按钮`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Home") {
                e.preventDefault();
                handle.current?.selectPart(null);
              }
              if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
                handle.current?.rotate(e.key === "ArrowLeft" ? -0.15 : 0.15);
              }
              if (["+", "-", "="].includes(e.key)) {
                e.preventDefault();
                handle.current?.zoom(e.key === "-" ? 1.15 : 0.87);
              }
            }}
          />
        )}
        {!active && (
          <div className={styles.activate}>
            <span>ON-DEMAND EXPLORER</span>
            <h3>近距离探索 {name}</h3>
            <p>仅在启用后下载当前机型的模型。静态照片始终可用。</p>
            <button className="button primary" onClick={() => setActive(true)}>
              启用此机型 3D ↗
            </button>
          </div>
        )}
        {active && !metrics && !error && (
          <div className={styles.loading} role="status">
            <p>加载模型 {progress}%</p>
            <button onClick={() => setActive(false)}>取消加载</button>
          </div>
        )}
        {error && (
          <div className={styles.error} role="alert">
            <p>已保留静态参考图。{error}</p>
            <button onClick={() => setRetry((n) => n + 1)}>重试 3D</button>
            <button onClick={() => setActive(false)}>保留图片</button>
          </div>
        )}
      </div>
      {active && (
        <div className={styles.toolbar}>
          <button onClick={() => handle.current?.selectPart(null)}>
            返回整体模型
          </button>
          <button onClick={() => handle.current?.zoom(0.85)}>放大 ＋</button>
          <button onClick={() => handle.current?.zoom(1.18)}>缩小 −</button>
          <button
            onClick={() => {
              setActive(false);
              setMetrics(null);
            }}
          >
            关闭 3D · 释放资源
          </button>
        </div>
      )}
      <p className={styles.hint}>
        单指旋转、双指缩放；触控区域外可滚动页面。Home 返回整机，方向键旋转，＋
        / −
        缩放。结构高亮仅代表本教学模型的独立部件网格，不等于真实工程结构边界；未开放机械动画。
      </p>
      <div className="anatomy-layout">
        <div className="paper-panel">
          <h3>3D Anatomy — 互动飞机结构</h3>
          <div className="button-row">
            {parts.map((p) => (
              <button
                className={`button ${part === p.id ? "primary" : "secondary"}`}
                disabled={!metrics || !!error || !active}
                key={p.id}
                aria-pressed={part === p.id}
                onClick={() => handle.current?.selectPart(p.id)}
              >
                {p.name} · {p.en}
              </button>
            ))}
          </div>
        </div>
        <article className="paper-panel reading-panel" aria-live="polite">
          <h3>
            {selected ? `${selected.name} / ${selected.en}` : "从整体到结构"}
          </h3>
          <p>
            {selected?.function ??
              "启用 3D 后点击模型部件，或使用结构按钮。对应网格会高亮，相机平滑聚焦。"}
          </p>
          {selected && (
            <>
              <p>
                {selected.id === "gear"
                  ? "起落架通过轮胎、减震支柱和刹车支承地面载荷、吸收着陆冲击并减速。前起落架用于地面转向；主起落架承受大部分重量。747-8I 和 A380 采用四组主起落架，其余本站重点双发机型采用两组主起落架。此处仅展示静态外观。"
                  : selected.principle}
              </p>
              <Link className="text-link" href={`/dictionary/${selected.term}`}>
                Aviation Dictionary · {selected.en} ↗
              </Link>
              <Link className="text-link" href={selected.link}>
                {selected.label} ↗
              </Link>
            </>
          )}
        </article>
      </div>
      {model && model.liveries.length > 1 && (
        <label className="paper-panel atlas-palette">
          3D 外观 · Concept Livery
          <select
            value={palette}
            disabled={!metrics || !!error || !active}
            onChange={(e) => {
              const l = model.liveries.find((l) => l.id === e.target.value);
              if (
                l &&
                handle.current?.setPalette(
                  Object.fromEntries(
                    Object.entries(l.colors).map(([key, value]) => [
                      key === "paint"
                        ? "AeronautPaint"
                        : key === "accent"
                          ? "AeronautAccent"
                          : key,
                      value,
                    ]),
                  ),
                )
              )
                setPalette(l.id);
              else setError("配色切换失败，原配色未修改；可重新启用模型。");
            }}
          >
            <option value="" disabled>
              选择原创概念配色
            </option>
            {model.liveries.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <small>
            复用相同几何与材质，只修改颜色，保持观察视角。无二维照片贴图或历史涂装声明。
          </small>
        </label>
      )}
      {metrics && active && !error && (
        <details className={styles.diagnostics}>
          <summary>
            本次设备读数 · {metrics.triangles.toLocaleString()} 三角面 /{" "}
            {metrics.drawCalls} Draw Calls / DPR {metrics.dpr.toFixed(2)}
          </summary>
          <p>
            下载 {metrics.downloadMs.toFixed(0)} ms · 解析{" "}
            {metrics.parseMs.toFixed(0)} ms · 启用至首帧{" "}
            {metrics.firstFrameMs.toFixed(0)} ms
          </p>
          <p>
            5 秒平均提交帧率：{metrics.benchmarkFps?.toFixed(1) ?? "尚未测量"}{" "}
            FPS · 1% Low：
            {metrics.benchmarkOnePercentLow?.toFixed(1) ?? "尚未测量"} FPS。低于
            50 FPS 时会自动降至均衡分辨率。此读数不是 A12X Safari 验收结果。
          </p>
          <button
            className="button secondary"
            disabled={metrics.state !== "ready"}
            onClick={() => handle.current?.benchmark()}
          >
            测量本机帧率
          </button>
        </details>
      )}
      <details className={styles.source}>
        <summary>模型与涂装授权、制作来源、适用范围</summary>
        {model ? (
          <>
            <p>
              模型、几何与概念配色：AERONAUT 原创 ·
              CC0-1.0。模型未使用第三方照片纹理或航司商标。
            </p>
            <a href={model.source}>模型生成源码 ↗</a>
            <p>{model.limitations.join("；")}</p>
          </>
        ) : (
          <>
            <p>
              模型：FlightGear / John Williams、Grupo FGBr、Gijs de Rooy
              等，GPL-2.0-only。机身与机翼采用上游 GPL
              纹理，发动机及起落架纹理由 AERONAUT 重制。保留完整署名与对应源码。
            </p>
            <a href={boeing.origin.url}>原作者 ↗ </a>
            <a href={boeing.licenseUrl}>许可证 ↗ </a>
            <a href={boeing.sourceBundleUrl}>对应源码 ↗</a>
          </>
        )}
        <p>
          照片授权沿用上方机型图片署名。未对真实 iPad A12X 的平均 FPS、1% Low
          或发热作验收声明。
        </p>
      </details>
    </div>
  );
}
