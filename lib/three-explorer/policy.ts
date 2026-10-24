export type ViewName = "overview" | "nose" | "wing" | "engine" | "top";
export type Quality = "efficient" | "balanced";
export const viewLabels: Record<ViewName, string> = {
  overview: "整机",
  nose: "机头",
  wing: "机翼",
  engine: "发动机",
  top: "俯视",
};
export const viewPresets: Record<
  ViewName,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  overview: { position: [1.15, 0.65, 1.45], target: [0, 0, 0] },
  nose: { position: [0.18, 0.12, 0.96], target: [0, 0, 0.38] },
  wing: { position: [1.25, 0.8, -0.04], target: [0.18, -0.04, -0.04] },
  engine: { position: [0.32, -0.06, 0.28], target: [0.16, -0.085, 0.06] },
  top: { position: [0, 1.9, 0.01], target: [0, 0, 0] },
};
export const MODEL_MAX_BYTES = 1024 * 1024;
export function renderingSize(
  width: number,
  height: number,
  deviceDpr: number,
  quality: Quality,
) {
  const w = Math.max(1, Math.floor(width)),
    h = Math.max(1, Math.floor(height));
  const maxDpr = quality === "efficient" ? 1 : 1.5;
  const cap = quality === "efficient" ? 800000 : 1500000;
  const dpr = Math.min(
    Number.isFinite(deviceDpr) && deviceDpr > 0 ? deviceDpr : 1,
    maxDpr,
    Math.sqrt(cap / (w * h)),
  );
  return {
    width: w,
    height: h,
    dpr,
    pixelWidth: Math.max(1, Math.floor(w * dpr)),
    pixelHeight: Math.max(1, Math.floor(h * dpr)),
  };
}
export function assertGlb(data: ArrayBuffer, maxBytes = MODEL_MAX_BYTES) {
  if (data.byteLength < 20 || data.byteLength > maxBytes)
    throw Error("模型大小不符合原型预算。");
  const v = new DataView(data);
  if (
    v.getUint32(0, true) !== 0x46546c67 ||
    v.getUint32(4, true) !== 2 ||
    v.getUint32(8, true) !== data.byteLength
  )
    throw Error("资源不是完整的 GLB 2.0 文件。");
}
export const formatMiB = (bytes: number) => (bytes / 1048576).toFixed(2);
