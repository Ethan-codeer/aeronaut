"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import manifest from "@/public/models/three-explorer/debug/manifest.json";
import boeing from "@/public/models/boeing747/manifest.json";
import { createPerformanceExplorer } from "@/lib/three-explorer/debug/runtime";
import {
  readResults,
  persistResults,
  DEBUG_STORAGE_KEY,
  briefReport,
  candidateCombinations,
} from "@/lib/three-explorer/debug/results";
import {
  scenarios,
  type DebugHandle,
  type DebugSnapshot,
  type TestResult,
  type Scenario,
  type DebugDpr,
  type DeviceNotes,
  type Variant,
} from "@/lib/three-explorer/debug/types";
import styles from "./panel.module.css";
const variants = [...boeing.variants, ...manifest.variants] as Variant[];
const number = (n: number | null | undefined) =>
  n === null || n === undefined || !Number.isFinite(n) ? "—" : n.toFixed(1);
const preciseDpr = (n: number | null | undefined) =>
  n == null || !Number.isFinite(n) ? "—" : n.toFixed(2);
const blankDevice: DeviceNotes = {
  model: "",
  baselineA12X: false,
  heat: "未记录",
  notes: "",
};
function download(value: unknown, name: string) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function PerformancePanel({ onExit }: { onExit: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    stage = useRef<HTMLDivElement>(null),
    engine = useRef<DebugHandle | null>(null),
    historyRef = useRef<TestResult[]>([]),
    mounted = useRef(false),
    sequence = useRef<AbortController | null>(null),
    loaded = useRef("");
  const [engineReady, setEngineReady] = useState(false);
  const [snapshot, setSnapshot] = useState<DebugSnapshot | null>(null),
    [history, setHistory] = useState<TestResult[]>([]),
    [ready, setReady] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [storageError, setStorageError] = useState(""),
    [variantId, setVariantId] = useState(variants[0].id),
    [dpr, setDpr] = useState<DebugDpr>(1),
    [scenario, setScenario] = useState<Scenario>("rotate"),
    [seconds, setSeconds] = useState(20),
    [device, setDevice] = useState<DeviceNotes>(blankDevice),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState("准备调试环境"),
    [report, setReport] = useState(""),
    [copyStatus, setCopyStatus] = useState("");
  const persist = useCallback((next: TestResult[], alive = true) => {
    historyRef.current = next;
    if (alive) setHistory(next);
    try {
      persistResults(window.localStorage, next);
      if (alive) setStorageError("");
    } catch {
      if (alive)
        setStorageError(
          "本地存储不可用或已满。新结果已保留在当前页面，请导出JSON；个人机库数据不受影响。",
        );
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    let closed = false;
    Promise.resolve().then(() => {
      if (closed) return;
      try {
        const saved = readResults(window.localStorage);
        historyRef.current = saved;
        setHistory(saved);
      } catch {
        setStorageError(
          "无法读取本工具的历史记录；未删除已有数据。新结果仍可导出。",
        );
      }
    });
    try {
      if (!canvas.current || !stage.current) return;
      const value = createPerformanceExplorer({
        canvas: canvas.current,
        container: stage.current,
        onSnapshot: (s) => {
          if (!closed) setSnapshot(s);
        },
        onResult: (r) => {
          persist([r, ...historyRef.current], !closed);
          if (!closed) setReport(briefReport(r));
        },
        onError: (message) => {
          if (!closed) {
            setError(message);
            setEngineReady(false);
          }
        },
      });
      engine.current = value;
      Promise.resolve().then(() => {
        if (!closed) setEngineReady(true);
      });
      void value
        .load(variants[0])
        .then(() => {
          if (!closed) {
            loaded.current = variants[0].id;
            value.setScenario("rotate");
            setReady(true);
            setLoading(false);
            setStatus("可开始测试。实时监测本身也会持续绘制。");
          }
        })
        .catch((reason) => {
          if (!closed) {
            setError(
              reason instanceof Error ? reason.message : "测试模型加载失败",
            );
            setLoading(false);
          }
        });
    } catch (reason) {
      Promise.resolve().then(() => {
        if (!closed) {
          setError(
            reason instanceof Error ? reason.message : "无法创建调试查看器",
          );
          setLoading(false);
          setEngineReady(false);
        }
      });
    }
    return () => {
      closed = true;
      mounted.current = false;
      sequence.current?.abort();
      engine.current?.dispose();
      engine.current = null;
    };
  }, [persist]);
  async function loadVariant(v: Variant) {
    if (!engine.current) return;
    setLoading(true);
    setReady(false);
    setVariantId(v.id);
    setError("");
    try {
      await engine.current.load(v);
      if (mounted.current) {
        loaded.current = v.id;
        setReady(true);
        setStatus(`已载入 ${v.triangles.toLocaleString()} 三角面的单架模型`);
      }
    } catch (reason) {
      if (mounted.current)
        setError(reason instanceof Error ? reason.message : "模型加载失败");
      throw reason;
    } finally {
      if (mounted.current) setLoading(false);
    }
  }
  function stop() {
    sequence.current?.abort();
    engine.current?.cancel();
    setStatus("已停止；进行中的测量会作为取消结果保存。");
  }
  async function runTests(matrix: boolean) {
    if (!engine.current || !ready || busy) return;
    const controller = new AbortController();
    sequence.current = controller;
    setBusy(true);
    setError("");
    const todo = matrix
      ? variants.flatMap((variant) =>
          (["rotate", "static", "switch"] as Scenario[]).map((scene) => ({
            variant,
            scene,
          })),
        )
      : [
          {
            variant: variants.find((v) => v.id === variantId)!,
            scene: scenario,
          },
        ];
    try {
      for (let i = 0; i < todo.length; i++) {
        if (controller.signal.aborted || !mounted.current || document.hidden)
          break;
        const task = todo[i];
        setStatus(
          `${i + 1}/${todo.length} · ${task.variant.triangles.toLocaleString()}面 · ${scenarios[task.scene]}`,
        );
        if (loaded.current !== task.variant.id) await loadVariant(task.variant);
        if (controller.signal.aborted || !mounted.current) break;
        const result = await engine.current!.run(task.scene, seconds, device);
        if (result.status !== "completed" || controller.signal.aborted) break;
        if (i + 1 < todo.length) {
          engine.current!.setPaused(true);
          for (let remaining = 15; remaining > 0; remaining--) {
            if (
              controller.signal.aborted ||
              document.hidden ||
              !mounted.current
            )
              break;
            setStatus(
              `冷却暂停 ${remaining} 秒 · 下一项 ${i + 2}/${todo.length}`,
            );
            await new Promise<void>((resolve) => {
              const done = () => {
                clearTimeout(timer);
                controller.signal.removeEventListener("abort", done);
                resolve();
              };
              const timer = setTimeout(done, 1000);
              controller.signal.addEventListener("abort", done, { once: true });
            });
          }
        }
      }
      if (mounted.current)
        setStatus(
          controller.signal.aborted
            ? "测试队列已停止。"
            : "本轮已结束；请检查结果状态与温感，必要时冷却后复测。",
        );
    } catch (reason) {
      if (mounted.current)
        setError(reason instanceof Error ? reason.message : "测试无法继续");
    } finally {
      if (mounted.current) setBusy(false);
      sequence.current = null;
    }
  }
  const candidates = useMemo(() => candidateCombinations(history), [history]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(report);
      setCopyStatus("已复制");
    } catch {
      setCopyStatus("此浏览器不允许自动复制，请长按下方报告全选复制。");
    }
  }
  const annotate = useCallback(
    (id: string, heat: DeviceNotes["heat"]) => {
      const next = historyRef.current.map((r) =>
        r.id === id ? { ...r, postRunHeat: heat } : r,
      );
      persist(next);
      const updated = next.find((r) => r.id === id);
      if (updated) setReport(briefReport(updated));
      setCopyStatus("");
    },
    [persist],
  );
  const historyTable = useMemo(
    () => (
      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>时间 / 场景</th>
              <th>三角面 / DPR</th>
              <th>平均 / 1% Low</th>
              <th>首→末10秒</th>
              <th>状态 / 测试后温感</th>
              <th>报告</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(0, 200).map((r) => (
              <tr key={r.id}>
                <td>
                  {new Date(r.startedAt).toLocaleString()}
                  <br />
                  {scenarios[r.scenario]}
                </td>
                <td>
                  {r.variant.triangles.toLocaleString()} /{" "}
                  {r.environment.requestedDpr}
                </td>
                <td>
                  {number(r.stats.fps)} / {number(r.stats.low1Fps)}
                </td>
                <td>
                  {number(r.early10.fps)}→{number(r.late10.fps)}
                </td>
                <td>
                  {r.status}
                  <select
                    disabled={busy}
                    aria-label={`${r.id}测试后温感`}
                    value={r.postRunHeat || "未记录"}
                    onChange={(e) =>
                      annotate(r.id, e.target.value as DeviceNotes["heat"])
                    }
                  >
                    {["未记录", "正常", "温热", "明显发热"].map((h) => (
                      <option key={h}>{h}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    disabled={busy}
                    onClick={() => {
                      setReport(briefReport(r));
                      setCopyStatus("");
                    }}
                  >
                    查看/复制
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => download(r, `aeronaut-${r.id}.json`)}
                  >
                    JSON
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
    [history, annotate, busy],
  );

  return (
    <section className={styles.panel} aria-label="开发者性能测试">
      <div className={styles.heading}>
        <div>
          <span>DEVELOPER PERFORMANCE LAB</span>
          <h2>3D 性能测试</h2>
        </div>
        <button onClick={onExit}>退出调试并释放资源</button>
      </div>
      <p className={styles.notice}>
        本模式持续绘制，用于开发测量；普通查看器仍按需渲染。A12X iPad Pro 2018
        的45–60 FPS能力需要真机结果，未预填结论。浏览器不提供芯片温度接口。
      </p>
      <details className={styles.device}>
        <summary>设备与温感标注（不能从User-Agent自动识别A12X）</summary>
        <div className={styles.deviceGrid}>
          <label>
            设备型号
            <input
              value={device.model}
              onChange={(e) => setDevice({ ...device, model: e.target.value })}
              maxLength={100}
              disabled={busy}
              placeholder="例如：iPad Pro 2018 11英寸 / A12X"
            />
          </label>
          <label>
            本轮开始温感
            <select
              disabled={busy}
              value={device.heat}
              onChange={(e) =>
                setDevice({
                  ...device,
                  heat: e.target.value as DeviceNotes["heat"],
                })
              }
            >
              {["未记录", "正常", "温热", "明显发热"].map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </label>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={device.baselineA12X}
              disabled={busy}
              onChange={(e) =>
                setDevice({ ...device, baselineA12X: e.target.checked })
              }
            />
            我确认本机为2018款A12X iPad Pro（人工标注）
          </label>
          <label>
            系统、网络、充电等备注
            <input
              disabled={busy}
              value={device.notes}
              onChange={(e) => setDevice({ ...device, notes: e.target.value })}
              maxLength={300}
            />
          </label>
        </div>
      </details>
      <div className={styles.controls}>
        <label>
          单模型 / 复杂度
          <select
            disabled={busy || loading}
            value={variantId}
            onChange={(e) => {
              void loadVariant(
                variants.find((v) => v.id === e.target.value)!,
              ).catch(() => {});
            }}
          >
            {variants.map((v) => (
              <option value={v.id} key={v.id}>
                {v.label || "通用双发压力模型"} · {v.triangles.toLocaleString()}
                面
              </option>
            ))}
          </select>
        </label>
        <label>
          渲染DPR
          <select
            disabled={busy || loading}
            value={dpr}
            onChange={(e) => {
              const value = Number(e.target.value) as DebugDpr;
              setDpr(value);
              engine.current?.setDpr(value);
            }}
          >
            {[1, 1.25, 1.5, 2].map((d) => (
              <option key={d} value={d}>
                {d.toFixed(2)}
              </option>
            ))}
          </select>
        </label>
        <label>
          测试场景
          <select
            disabled={busy || loading}
            value={scenario}
            onChange={(e) => {
              const value = e.target.value as Scenario;
              setScenario(value);
              engine.current?.setScenario(value);
            }}
          >
            {Object.entries(scenarios).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          有效测量时长
          <select
            disabled={busy}
            value={seconds}
            onChange={(e) => setSeconds(Number(e.target.value))}
          >
            {[20, 60, 180, 300].map((s) => (
              <option key={s} value={s}>
                {s}秒{s >= 180 ? " · 热机观察" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={styles.stage} ref={stage}>
        <canvas
          ref={canvas}
          aria-label="性能测试中的单架测试客机"
          className={styles.canvas}
        />
        <div className={styles.hud} aria-live="off">
          <strong>
            FPS {number(snapshot?.realtime.fps)} <small>最近1秒</small>
          </strong>
          <span>
            10秒均值 {number(snapshot?.tenSeconds.fps)} · 1% Low{" "}
            {number(snapshot?.tenSeconds.low1Fps)}
          </span>
          <span>
            {snapshot?.triangles.toLocaleString() ?? "—"} 三角面 ·{" "}
            {snapshot?.drawCalls ?? "—"} Draw Calls
          </span>
          <span>
            {snapshot?.textures ?? "—"} 纹理 · {snapshot?.geometries ?? "—"}{" "}
            几何资源
          </span>
          <span>
            {snapshot
              ? `${snapshot.pixelWidth} × ${snapshot.pixelHeight}`
              : "—"}{" "}
            实际渲染像素
          </span>
          <span>
            DPR 请求 {dpr.toFixed(2)} / 实际 {preciseDpr(snapshot?.actualDprX)}×
            {preciseDpr(snapshot?.actualDprY)} / 设备{" "}
            {preciseDpr(snapshot?.deviceDpr)}
          </span>
          <span>
            {snapshot?.profile || "调试手动档"}
            {snapshot?.hardwareCapped ? " · 已达到硬件/像素限制" : ""}
          </span>
        </div>
        {(loading || snapshot?.running) && (
          <div className={styles.phase}>
            {loading
              ? "正在加载、解码模型，不计入FPS结果"
              : `${snapshot?.phase} · 剩余 ${Math.ceil((snapshot?.remainingMs || 0) / 1000)} 秒`}
          </div>
        )}
      </div>
      <div className={styles.actions}>
        <button
          disabled={!ready || busy}
          onClick={() => {
            void runTests(false);
          }}
        >
          测量当前组合
        </button>
        <button
          disabled={!ready || busy}
          onClick={() => {
            void runTests(true);
          }}
        >
          当前DPR · 七档 × 三场景
        </button>
        <button
          disabled={!ready || busy}
          onClick={() => engine.current?.setPaused(!snapshot?.paused)}
        >
          {snapshot?.paused ? "恢复实时监测" : "暂停实时监测"}
        </button>
        <button disabled={!busy && !snapshot?.running} onClick={stop}>
          停止并保存部分结果
        </button>
      </div>
      <p role="status" className={styles.status}>
        {status}
      </p>
      <p className={styles.hint}>
        每项先预热2秒；连测项间暂停15秒。七档×三场景约需{" "}
        {Math.ceil(((seconds + 2 + 15) * variants.length * 3 - 15) / 60)}{" "}
        分钟。静止场景同样持续绘制，以便比较渲染吞吐。测试时保持画布可见；切后台、旋转屏幕、离开画布会中止并标记结果，避免污染统计。
      </p>
      <p className={styles.hint}>
        设备明显发热请停止并充分冷却。短测达标不能证明长时间稳定；用60–300秒观察首末10秒变化，并重复冷机/热机测试。FPS下降不能单独证明热降频。
      </p>
      {error && (
        <div className={styles.error} role="alert">
          {error}
          <button
            disabled={busy || !engineReady}
            onClick={() => {
              void loadVariant(variants.find((v) => v.id === variantId)!).catch(
                () => {},
              );
            }}
          >
            重试模型
          </button>
        </div>
      )}
      {storageError && (
        <p role="alert" className={styles.error}>
          {storageError}
        </p>
      )}
      <details className={styles.results} open>
        <summary>本机测试结果 · {history.length} 次（独立调试存储）</summary>
        <div className={styles.actions}>
          <button
            disabled={busy || !history.length}
            onClick={() =>
              download(
                {
                  schemaVersion: 1,
                  exportedAt: new Date().toISOString(),
                  definition:
                    "1% Low=1000/mean(slowest ceil(N*.01) frame intervals). Background/loading/warmup excluded.",
                  results: history,
                },
                "aeronaut-performance-results.json",
              )
            }
          >
            导出全部结果 JSON
          </button>
          <button
            disabled={busy || !history.length}
            onClick={() => {
              if (
                window.confirm("仅删除本工具的性能记录？个人机库不会受影响。")
              ) {
                try {
                  localStorage.removeItem(DEBUG_STORAGE_KEY);
                  historyRef.current = [];
                  setHistory([]);
                  setReport("");
                  setStorageError("");
                } catch {
                  setStorageError("浏览器拒绝清除本工具存储。");
                }
              }
            }}
          >
            清空调试记录
          </button>
        </div>
        {historyTable}
        {!history.length && (
          <p>尚无测试结果。页面中的实时数字不是已经保存的测试。</p>
        )}
        <label className={styles.report}>
          简要报告
          <textarea
            value={report}
            readOnly
            rows={10}
            placeholder="完成或选择一次测试后生成"
          />
        </label>
        <button
          disabled={busy || !report}
          onClick={() => {
            void copy();
          }}
        >
          复制简要报告
        </button>
        <span role="status">{copyStatus}</span>
        <h3>45FPS候选组合</h3>
        {candidates.length ? (
          <ul>
            {candidates.map((c, i) => (
              <li key={i}>
                {c.device} · {c.triangles.toLocaleString()}面 / DPR{c.dpr}
                ：三场景均值≥{number(c.minAverage)}、1% Low≥{number(c.minLow1)}
                。
                {c.longRun
                  ? "均完成≥60秒，仍需重复确认"
                  : "包含短测，需热机复测"}
                ；{c.userMarkedA12X ? "用户标注A12X" : "未核实为A12X"}。
              </li>
            ))}
          </ul>
        ) : (
          <p>
            尚无同设备、同分辨率、同DPR在三种场景全部完成且平均与1%
            Low都≥45的组合。不会预设A12X结论。
          </p>
        )}
      </details>
      <details className={styles.method}>
        <summary>统计定义、资产与测试范围</summary>
        <p>
          实时FPS为最近1秒帧区间计数/累计帧时；10秒均值按实际覆盖时长加权。1%
          Low=1000÷最慢ceil(N×1%)帧时间均值，少于100帧至少取最慢1帧。后台、加载与2秒预热不计；暂停显示“—”。均为requestAnimationFrame与实际渲染提交计数，不是GPU硬件计时。
        </p>
        <p>
          前两档测量当前747-8真实纹理资产；后五档是原有通用双发飞机的几何精度对照，保持24个绘制批次、6材质与零贴图，未复制多架飞机。请勿把通用模型结果当成747的性能。调试逻辑只在主动进入后加载；普通3D也使用本地Meshopt解码器。
        </p>
        <a href="/models/three-explorer/debug/manifest.json">
          模型精度与哈希清单 ↗
        </a>
        <p>
          温度无标准浏览器接口，温感由用户标注。设备型号也由用户标注；User-Agent不能可靠区分A12X。结果保存在本机独立键，容量受浏览器限制；达到200条或写入失败时需导出，当前会话的新结果仍可查看。
        </p>
      </details>
    </section>
  );
}
