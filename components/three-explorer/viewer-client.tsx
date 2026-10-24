"use client";
import { useEffect, useRef, useState } from "react";
import manifest from "@/public/models/three-explorer/manifest.json";
import {
  createExplorer,
  type ExplorerHandle,
  type ViewerMetrics,
} from "@/lib/three-explorer/runtime";
import {
  viewLabels,
  formatMiB,
  type ViewName,
  type Quality,
} from "@/lib/three-explorer/policy";
import styles from "./explorer.module.css";
export function ViewerClient({
  onClose,
  onRetry,
  startedAt,
}: {
  onClose: () => void;
  onRetry: () => void;
  startedAt: number;
}) {
  const container = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    handle = useRef<ExplorerHandle | null>(null);
  const [phase, setPhase] = useState("准备图形环境"),
    [progress, setProgress] = useState(0),
    [metrics, setMetrics] = useState<ViewerMetrics | null>(null),
    [error, setError] = useState(""),
    [view, setView] = useState<ViewName>("overview"),
    [quality, setQuality] = useState<Quality>("efficient");
  useEffect(() => {
    if (!container.current || !canvas.current) return;
    const controller = new AbortController();
    let closed = false;
    void createExplorer({
      startedAt,
      canvas: canvas.current,
      container: container.current,
      url: manifest.modelUrl,
      expectedBytes: manifest.bytes,
      expectedSha256: manifest.sha256,
      signal: controller.signal,
      onProgress: (n, total) => {
        if (!closed) setProgress(Math.min(100, Math.round((n / total) * 100)));
      },
      onPhase: (p) => {
        if (!closed) setPhase(p);
      },
      onMetrics: (m) => {
        if (!closed) setMetrics(m);
      },
      onFatal: (message) => {
        if (!closed) {
          controller.abort();
          setError(message);
        }
      },
    })
      .then((value) => {
        if (closed) {
          value.dispose();
          return;
        }
        handle.current = value;
      })
      .catch((reason) => {
        if (!closed && !controller.signal.aborted)
          setError(
            reason instanceof Error
              ? reason.message
              : "3D初始化失败，请使用2D展示。",
          );
      });
    return () => {
      closed = true;
      controller.abort();
      handle.current?.dispose();
      handle.current = null;
    };
  }, [startedAt]);
  const ready = !!metrics && !error;
  function changeView(value: ViewName) {
    handle.current?.view(value);
    setView(value);
  }
  return (
    <>
      <div
        className={styles.stage}
        ref={container}
        aria-busy={!ready && !error}
      >
        <canvas
          ref={canvas}
          className={styles.canvas}
          style={{ visibility: error ? "hidden" : "visible" }}
          tabIndex={ready ? 0 : -1}
          role="img"
          aria-label="可旋转的通用双发民航客机模型；左右方向键旋转，加减键缩放，Home重置"
          onKeyDown={(e) => {
            if (!ready) return;
            if (
              ["ArrowLeft", "ArrowRight", "+", "=", "-", "Home"].includes(e.key)
            ) {
              e.preventDefault();
              if (e.key === "ArrowLeft") handle.current?.rotate(-0.12);
              else if (e.key === "ArrowRight") handle.current?.rotate(0.12);
              else if (e.key === "Home") changeView("overview");
              else handle.current?.zoom(e.key === "-" ? 1.18 : 0.85);
            }
          }}
        />
        {!ready && !error && (
          <div className={styles.loading} role="status">
            <span className={styles.spinner} />
            <h2>{phase}</h2>
            <div
              role="progressbar"
              aria-label="模型下载进度"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className={styles.progress}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
            <p>GLB {progress}% · 模型下载后仍需解析与提交首帧</p>
            <button onClick={onClose}>取消并返回2D</button>
          </div>
        )}
        {error && (
          <>
            <img
              src={manifest.posterUrl}
              alt="同一GLB模型的离线渲染图，双发动机位于低翼下方，常规尾翼与前三点起落架"
              className={styles.poster}
            />
            <div className={styles.error} role="alert">
              <b>已切换至2D展示</b>
              <p>{error}</p>
              <div>
                <button onClick={onRetry}>重试3D</button>
                <button onClick={onClose}>保留2D</button>
              </div>
            </div>
          </>
        )}
        {ready && (
          <div className={styles.stageBadge}>
            WEBGL 2 ·{" "}
            {metrics.state === "benchmark"
              ? "5秒测量中"
              : metrics.state === "paused"
                ? "已暂停"
                : "按需渲染"}
          </div>
        )}
      </div>
      {!error && (
        <>
          <div className={styles.toolbar} aria-label="观察视角">
            {(Object.keys(viewLabels) as ViewName[]).map((v) => (
              <button
                key={v}
                disabled={!ready}
                aria-pressed={view === v}
                onClick={() => changeView(v)}
              >
                {viewLabels[v]}
              </button>
            ))}
            <button disabled={!ready} onClick={() => changeView("overview")}>
              重置视角
            </button>
          </div>
          <div className={styles.secondaryControls}>
            <div>
              <button
                disabled={!ready}
                aria-label="放大模型"
                onClick={() => handle.current?.zoom(0.85)}
              >
                ＋ 放大
              </button>
              <button
                disabled={!ready}
                aria-label="缩小模型"
                onClick={() => handle.current?.zoom(1.18)}
              >
                − 缩小
              </button>
              <button
                disabled={!ready}
                onClick={() => handle.current?.rotate(-0.16)}
              >
                向左旋转
              </button>
              <button
                disabled={!ready}
                onClick={() => handle.current?.rotate(0.16)}
              >
                向右旋转
              </button>
            </div>
            <label>
              画质
              <select
                value={quality}
                disabled={!ready}
                onChange={(e) => {
                  const value = e.target.value as Quality;
                  setQuality(value);
                  handle.current?.quality(value);
                }}
              >
                <option value="efficient">节能 · DPR ≤ 1</option>
                <option value="balanced">平衡 · DPR ≤ 1.5</option>
              </select>
            </label>
            <button onClick={onClose}>退出3D并释放资源</button>
          </div>
          <p className={styles.hint}>
            单指拖动旋转，双指捏合缩放；画布外可滚动页面。键盘方向键、＋/−、Home也可操作。默认不自动旋转。
          </p>
          {metrics && (
            <details className={styles.diagnostics}>
              <summary>本次浏览器的实测读数与资源估算</summary>
              <div className={styles.metrics}>
                <div>
                  <span>模型下载</span>
                  <b>{metrics.downloadMs.toFixed(0)} ms</b>
                </div>
                <div>
                  <span>GLB解析</span>
                  <b>{metrics.parseMs.toFixed(0)} ms</b>
                </div>
                <div>
                  <span>启用至首帧提交</span>
                  <b>{metrics.firstFrameMs.toFixed(0)} ms</b>
                </div>
                <div>
                  <span>每帧绘制调用</span>
                  <b>{metrics.drawCalls}</b>
                </div>
                <div>
                  <span>提交三角面</span>
                  <b>{metrics.triangles.toLocaleString()}</b>
                </div>
                <div>
                  <span>纹理对象</span>
                  <b>{metrics.textures}</b>
                </div>
                <div>
                  <span>几何缓冲估算</span>
                  <b>{formatMiB(metrics.geometryBytes)} MiB</b>
                </div>
                <div>
                  <span>单套帧缓冲估算</span>
                  <b>{formatMiB(metrics.framebufferBytes)} MiB</b>
                </div>
                <div>
                  <span>绘制缓冲尺寸</span>
                  <b>
                    {metrics.pixelWidth} × {metrics.pixelHeight}
                  </b>
                </div>
                <div>
                  <span>当前DPR</span>
                  <b>{metrics.dpr.toFixed(2)}</b>
                </div>
                <div>
                  <span>5秒提交帧率</span>
                  <b>
                    {metrics.benchmarkFps === null
                      ? "尚未测量"
                      : `${metrics.benchmarkFps.toFixed(1)} fps`}
                  </b>
                </div>
                <div>
                  <span>资源MIME</span>
                  <b>{metrics.mime}</b>
                </div>
              </div>
              <button
                className={styles.measure}
                disabled={
                  metrics.state === "benchmark" || metrics.state === "paused"
                }
                onClick={() => handle.current?.benchmark()}
              >
                {metrics.state === "benchmark"
                  ? "正在测量，请保持页面可见…"
                  : "运行5秒渲染测量"}
              </button>
              <p>
                帧率通过可见页面的 requestAnimationFrame
                及渲染提交计数计算，先预热0.5秒；不是GPU计时或真实设备验收证明。首帧为CPU提交时刻，不保证已被屏幕呈现。显存无法由浏览器精确读取；上方估算未包含驱动、双缓冲及浏览器开销。启用至首帧计时包含3D组件代码加载、模型下载与初始化；解析与下载耗时另外列出。
              </p>
              <button
                className={styles.download}
                onClick={() => {
                  const blob = new Blob(
                    [
                      JSON.stringify(
                        {
                          timestamp: new Date().toISOString(),
                          userAgent: navigator.userAgent,
                          viewport: {
                            width: innerWidth,
                            height: innerHeight,
                            dpr: devicePixelRatio,
                          },
                          model: manifest.id,
                          quality,
                          metrics,
                          scope:
                            "This browser only; no device certification or exact GPU memory claim",
                        },
                        null,
                        2,
                      ),
                    ],
                    { type: "application/json" },
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "aeronaut-3d-device-measurement.json";
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                }}
              >
                导出本次读数 JSON
              </button>
            </details>
          )}
        </>
      )}
    </>
  );
}
