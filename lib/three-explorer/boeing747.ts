import type { ViewName, Quality } from "./policy";
import manifest from "@/public/models/boeing747/manifest.json";
export const boeing747 = manifest;
export function boeingVariant(quality: Quality) {
  return manifest.variants.find(
    (v) =>
      v.id === (quality === "high" ? "boeing747-high" : "boeing747-balanced"),
  )!;
}
export const boeing747Views: Record<
  ViewName,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  overview: { position: [1.08, 0.58, 1.35], target: [0, -0.02, 0] },
  nose: { position: [0.22, 0.1, 0.95], target: [0, 0.005, 0.37] },
  wing: { position: [1.1, 0.7, -0.1], target: [0.15, -0.03, -0.04] },
  engine: { position: [0.43, 0.03, 0.49], target: [0.17, -0.075, 0.12] },
  top: { position: [0, 1.9, 0.01], target: [0, 0, 0] },
};
