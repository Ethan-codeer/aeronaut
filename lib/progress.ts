export interface Result {
  id: string;
  kind: "quiz" | "spotter" | "airline";
  date: string;
  correct: number;
  total: number;
}
export interface Progress {
  version: 2;
  favorites: string[];
  visited: string[];
  results: Result[];
  labUsed: boolean;
}
export const emptyProgress: Progress = {
  version: 2,
  favorites: [],
  visited: [],
  results: [],
  labUsed: false,
};
// Keep the existing storage key to retain V1 favorites, visits and scores.
// Parsing V1 emits only V2 fields; the retired per-question list is ignored.
export const STORAGE_KEY = "aeronaut-progress-v1";
export function parseProgress(raw: string): Progress {
  const p: unknown = JSON.parse(raw);
  if (!p || typeof p !== "object") throw Error("无效备份文件");
  const x = p as Record<string, unknown>;
  if (
    ![1, 2].includes(x.version as number) ||
    !["favorites", "visited"].every(
      (k) =>
        Array.isArray(x[k]) &&
        (x[k] as unknown[]).length <= 1000 &&
        (x[k] as unknown[]).every(
          (v) => typeof v === "string" && v.length < 100,
        ),
    ) ||
    typeof x.labUsed !== "boolean" ||
    !Array.isArray(x.results) ||
    x.results.length > 1000 ||
    !x.results.every(
      (r) =>
        r &&
        typeof r === "object" &&
        typeof r.id === "string" &&
        ["quiz", "spotter", "airline"].includes(r.kind) &&
        typeof r.date === "string" &&
        Number.isFinite(Date.parse(r.date)) &&
        Number.isInteger(r.correct) &&
        Number.isInteger(r.total) &&
        r.correct >= 0 &&
        r.total > 0 &&
        r.correct <= r.total,
    )
  )
    throw Error("备份版本或内容不符合 AERONAUT 进度格式");
  return {
    version: 2,
    favorites: [...new Set(x.favorites as string[])],
    visited: [...new Set(x.visited as string[])],
    labUsed: x.labUsed,
    results: (x.results as Result[]).map(
      ({ id, kind, date, correct, total }) => ({
        id,
        kind,
        date,
        correct,
        total,
      }),
    ),
  };
}
