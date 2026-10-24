import type { TestResult } from "./types";
import { scenarios } from "./types";
export const DEBUG_STORAGE_KEY = "aeronaut-3d-performance-debug-v1";
const MAX_STORED = 200;
export interface ResultStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}
export function readResults(storage: ResultStorage): TestResult[] {
  const raw = storage.getItem(DEBUG_STORAGE_KEY);
  if (!raw) return [];
  if (raw.length > 2500000) throw Error("调试记录过大，请先导出。");
  const parsed = JSON.parse(raw);
  if (
    !Array.isArray(parsed) ||
    parsed.some(
      (r) =>
        r?.schemaVersion !== 1 ||
        typeof r.id !== "string" ||
        ![
          "completed",
          "cancelled",
          "interrupted",
          "context-lost",
          "load-error",
        ].includes(r.status) ||
        !r.stats ||
        !r.variant ||
        !r.environment ||
        !r.device,
    )
  )
    throw Error("调试记录格式无效；未改动已有数据。");
  return parsed;
}
export function persistResults(storage: ResultStorage, results: TestResult[]) {
  if (results.length > MAX_STORED)
    throw Error(
      "已达到200条本地记录上限。新结果仍保留在内存，请先导出再清空调试记录。",
    );
  const encoded = JSON.stringify(results);
  if (encoded.length > 2000000)
    throw Error("调试记录达到本地体积上限，请先导出。");
  storage.setItem(DEBUG_STORAGE_KEY, encoded);
}
const value = (n: number | null) => (n === null ? "—" : n.toFixed(1));
export function briefReport(r: TestResult) {
  return [
    `AERONAUT 3D 性能测试 · ${r.startedAt}`,
    `状态 ${r.status}${r.reason ? ` / ${r.reason}` : ""}`,
    `设备 ${r.device.model || "未标注"}${r.device.baselineA12X ? "（用户标注为2018 A12X iPad Pro）" : ""}`,
    `场景 ${scenarios[r.scenario]} · ${r.measuredMs.toFixed(0)}ms · 预热${r.warmupMs}ms不计`,
    `${r.variant.triangles.toLocaleString()}三角面 / 单架飞机 / ${r.environment.pixelWidth}×${r.environment.pixelHeight} / 请求DPR ${r.environment.requestedDpr} / 实际DPR ${r.environment.actualDprX.toFixed(2)}×${r.environment.actualDprY.toFixed(2)}`,
    `平均 ${value(r.stats.fps)} FPS · 1% Low ${value(r.stats.low1Fps)} FPS · p99帧时 ${value(r.stats.p99Ms)}ms`,
    `${r.rendererInfo.drawCalls} Draw Calls / ${r.rendererInfo.textures}纹理 / ${r.rendererInfo.geometries}几何资源`,
    `首10秒 ${value(r.early10.fps)} FPS → 末10秒 ${value(r.late10.fps)} FPS / 变化 ${value(r.fpsChangePercent)}%`,
    `温感（人工）队列开始${r.device.heat} / 测试后${r.postRunHeat || "未记录"} · ${r.thermalConclusion}`,
    `45FPS下限：${r.target45Met ? (r.measuredMs >= 60000 ? "本次长测达标，仍需重复确认" : "短测达标，需热机复测") : "未达标或无有效完成结果"}`,
    `备注 ${r.device.notes || "无"}`,
    `统计：FPS=帧区间数/累计帧时；1% Low=1000/最慢ceil(N×1%)帧时均值；样本不足100帧至少取1帧。后台、加载、预热不计。不是GPU硬件计时或精确显存读数。`,
  ].join("\n");
}
export function candidateCombinations(results: TestResult[]) {
  const groups = new Map<string, TestResult[]>();
  for (const r of results) {
    if (r.status !== "completed") continue;
    const e = r.environment;
    const key = JSON.stringify([
      r.device.model,
      r.device.baselineA12X,
      e.userAgent,
      e.cssWidth,
      e.cssHeight,
      e.pixelWidth,
      e.pixelHeight,
      e.requestedDpr,
      r.variant.id,
      r.artifactRevision,
      e.rendererRevision,
      e.powerPreference,
    ]);
    const group = groups.get(key) || [];
    group.push(r);
    groups.set(key, group);
  }
  return [...groups.values()]
    .filter(
      (group) =>
        Object.keys(scenarios).every((s) =>
          group.some((r) => r.scenario === s),
        ) && group.every((r) => r.target45Met),
    )
    .map((group) => ({
      triangles: group[0].variant.triangles,
      dpr: group[0].environment.requestedDpr,
      device: group[0].device.model || "未标注设备",
      userMarkedA12X: group[0].device.baselineA12X,
      tests: group.length,
      longRun: group.every((r) => r.measuredMs >= 60000),
      minLow1: Math.min(...group.map((r) => r.stats.low1Fps ?? 0)),
      minAverage: Math.min(...group.map((r) => r.stats.fps ?? 0)),
    }))
    .sort((a, b) => b.dpr - a.dpr || b.triangles - a.triangles);
}
