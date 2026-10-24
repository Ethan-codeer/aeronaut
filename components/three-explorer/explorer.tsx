"use client";
import { useState, useRef, useEffect, type ComponentType } from "react";
import manifest from "@/public/models/three-explorer/manifest.json";
import styles from "./explorer.module.css";
type Viewer = ComponentType<{
  onClose: () => void;
  onRetry: () => void;
  startedAt: number;
}>;
export function ThreeExplorer() {
  const [Debug, setDebug] = useState<ComponentType<{
    onExit: () => void;
  }> | null>(null);
  const [debugBusy, setDebugBusy] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [Viewer, setViewer] = useState<Viewer | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  const generation = useRef(0);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  async function activate() {
    const request = ++generation.current;
    setBusy(true);
    setError("");
    setStartedAt(performance.now());
    try {
      const loaded = await import("./viewer-client");
      if (request !== generation.current) return;
      setViewer(() => loaded.ViewerClient);
      setAttempt((a) => a + 1);
    } catch {
      if (request === generation.current)
        setError("3D组件暂时无法下载。2D图片仍可使用，请重试。");
    } finally {
      if (request === generation.current) setBusy(false);
    }
  }
  function close() {
    generation.current++;
    setBusy(false);
    setViewer(null);
    setDebug(null);
    setDebugBusy(false);
    setError("");
  }
  async function activateDebug() {
    const request = ++generation.current;
    setViewer(null);
    setDebugBusy(true);
    setError("");
    try {
      const loaded = await import("./debug/panel");
      if (request === generation.current)
        setDebug(() => loaded.PerformancePanel);
    } catch {
      if (request === generation.current)
        setError("调试模块加载失败，请重试；普通查看器仍可使用。");
    } finally {
      if (request === generation.current) setDebugBusy(false);
    }
  }
  if (Debug) return <Debug onExit={close} />;
  return (
    <div className={styles.explorer}>
      {Viewer ? (
        <Viewer
          key={attempt}
          startedAt={startedAt}
          onClose={close}
          onRetry={() => {
            setStartedAt(performance.now());
            setAttempt((a) => a + 1);
          }}
        />
      ) : (
        <>
          <div className={styles.stage}>
            <img
              className={styles.poster}
              src={manifest.posterUrl}
              width={1100}
              height={700}
              alt="通用双发民航客机GLB的离线渲染图，展示低翼、两台翼下发动机及常规尾翼"
              fetchPriority="high"
            />
            <div className={styles.posterLabel}>
              2D PREVIEW / 同一GLB模型离线渲染
            </div>
            <div className={styles.activate}>
              <span>EXPLORE THE AIRFRAME</span>
              <h2>换个角度，认识飞机。</h2>
              <p>
                手动启用后才下载3D代码和模型。模型{" "}
                {Math.round(manifest.bytes / 1024)} KiB，不加载任何贴图。
              </p>
              <button
                className="button primary"
                onClick={activate}
                disabled={busy}
              >
                {busy ? "正在下载3D组件…" : "启用3D探索"}{" "}
                <span aria-hidden="true">↗</span>
              </button>
              {busy && (
                <button className={styles.cancel} onClick={close}>
                  取消，继续浏览2D
                </button>
              )}
            </div>
          </div>
          {error && (
            <div className={styles.error} role="alert">
              <p>{error}</p>
              <button
                onClick={
                  error.startsWith("调试模块")
                    ? () => {
                        void activateDebug();
                      }
                    : activate
                }
              >
                {error.startsWith("调试模块") ? "重试调试模块" : "重试3D组件"}
              </button>
            </div>
          )}
          <p className={styles.hint}>
            2D图始终可浏览；无需WebGL。3D模型仅用于通用外形展示，不是某个型号的工程或维修资料。
          </p>
        </>
      )}
      <details className={styles.debugEntry}>
        <summary>开发者性能调试</summary>
        <p>
          仅主动进入后加载测试逻辑与多精度单模型。此模式会持续绘制，并提供DPR、帧时统计和本机测试报告。
        </p>
        <button
          className="button secondary"
          disabled={debugBusy}
          onClick={() => {
            void activateDebug();
          }}
        >
          {debugBusy ? "正在加载调试器…" : "进入性能调试模式"}
        </button>
        {debugBusy && (
          <button className="button secondary" onClick={close}>
            取消调试加载
          </button>
        )}
      </details>
      <div className={styles.facts}>
        <div>
          <span>GLB</span>
          <b>{Math.round(manifest.bytes / 1024)} KiB</b>
        </div>
        <div>
          <span>三角面</span>
          <b>{manifest.triangles.toLocaleString()}</b>
        </div>
        <div>
          <span>贴图</span>
          <b>0 张</b>
        </div>
        <div>
          <span>模型许可</span>
          <b>CC0 1.0</b>
        </div>
      </div>
      <section className={styles.source}>
        <h2>模型来源与原型边界</h2>
        <p>
          本项目原创的通用双发民航客机外观模型，由可复现的参数化建模源码生成，OpenAI
          Codex辅助制作。不使用第三方网格、厂商CAD、航空公司标志或图片贴图；不宣称特定型号的尺寸精度。
        </p>
        <p>
          机身、左右机翼、双发动机、常规尾翼与三组起落架分为独立节点；目前没有内部结构、骨骼或起落架动画。模型依据CC0允许复制、修改、再分发及商用，生成器另附MIT条款。
        </p>
        <div className={styles.sourceLinks}>
          <a href={manifest.licenseFile}>授权说明 ↗</a>
          <a href={manifest.licenseUrl} target="_blank" rel="noreferrer">
            CC0条款 ↗
          </a>
          <a href={manifest.source}>建模源码 ↗</a>
          <a href="/models/three-explorer/manifest.json">模型与预算清单 ↗</a>
        </div>
        <p className={styles.note}>
          这是通用飞机外形展示。真实iPad
          Safari触控、帧率、加载耗时和资源占用尚需在设备上测量；诊断读数只在启用3D后由当前浏览器产生。
        </p>
      </section>
    </div>
  );
}
