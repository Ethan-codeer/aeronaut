"use client";
import Link from "next/link";
import { useState, useRef, useEffect, type ComponentType } from "react";
import manifest from "@/public/models/boeing747/manifest.json";
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
              alt="Boeing 747-8洲际型GLB的离线渲染图，展示驼峰、四台发动机及后掠翼尖"
              fetchPriority="high"
            />
            <div className={styles.posterLabel}>
              2D PREVIEW / 同一GLB模型离线渲染
            </div>
            <div className={styles.activate}>
              <span>EXPLORE THE AIRFRAME</span>
              <h2>认识四发传奇，Boeing 747-8。</h2>
              <p>
                手动启用后才下载3D代码和模型。默认轻量档，可切换约14.9万面高清档；两档均保留2048像素主纹理。
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
            2D图始终可浏览；无需WebGL。模型用于747-8外形科普，不是厂商工程或维修资料。
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
          <span>高清 GLB</span>
          <b>{Math.round(manifest.bytes / 1024)} KiB</b>
        </div>
        <div>
          <span>三角面</span>
          <b>{manifest.triangles.toLocaleString()}</b>
        </div>
        <div>
          <span>贴图</span>
          <b>{manifest.textures} 张图集</b>
        </div>
        <div>
          <span>模型许可</span>
          <b>GPL 2.0</b>
        </div>
      </div>
      <section className={styles.source}>
        <h2>模型来源、署名与展示范围</h2>
        <p>
          Boeing 747-8 Intercontinental 社区模型源自 FlightGear：John
          Williams、Grupo FGBr（Aurino das Neves、Isaias Prestes、Rick
          Britto、Wagner Silva），并基于 Gijs de Rooy
          等作者的747-400资源。模型及本次修改按GPL 2.0提供。
        </p>
        <p>
          已转换与优化外观和起落架、细化曲面、合并六种材质并压缩网格。机身与机翼采用上游GPL纹理；发动机、起落架和轮胎纹理重新制作，未采用原发动机照片及标志。中性白色外观不代表真实航司涂装。
        </p>
        <div className={styles.sourceLinks}>
          <a href={manifest.origin.url} target="_blank" rel="noreferrer">
            原始模型与作者 ↗
          </a>
          <a href={manifest.licenseUrl}>GPL 2.0全文 ↗</a>
          <a href={manifest.sourceBundleUrl}>对应源码与修改说明 ↗</a>
          <a href="/models/boeing747/manifest.json">模型与纹理清单 ↗</a>
          <Link href="/atlas/747-8">747-8百科 ↗</Link>
        </div>
        <p className={styles.note}>
          非波音、发动机厂商或航空公司官方产品，不表示相关品牌认可；品牌名称仅用于识别机型。社区模型存在简化，目前未实现内部剖视、结构拆解或起落架动画。真实A12X
          iPad Safari触控、帧率和发热尚待设备实测，页面不预填性能结论。
        </p>
      </section>
    </div>
  );
}
