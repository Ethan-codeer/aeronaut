import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Box3, Vector3, Mesh } from "three";
import manifest from "../../public/models/three-explorer/manifest.json";
import validation from "../../docs/three-explorer/model-validation.json";
import {
  assertGlb,
  renderingSize,
  viewPresets,
} from "../../lib/three-explorer/policy";
const file = readFileSync("public/models/three-explorer/generic-twinjet.glb");
const data = file.buffer.slice(
  file.byteOffset,
  file.byteOffset + file.byteLength,
) as ArrayBuffer;
describe("original CC0 twinjet GLB", () => {
  it("matches its provenance, budget and Khronos validation record", () => {
    assertGlb(data);
    expect(file.byteLength).toBe(manifest.bytes);
    expect(createHash("sha256").update(file).digest("hex")).toBe(
      manifest.sha256,
    );
    expect(validation.validator.issues.numErrors).toBe(0);
    expect(validation.validator.issues.numWarnings).toBe(0);
    expect(Object.values(validation.checks).every(Boolean)).toBe(true);
    expect(manifest.triangles).toBeLessThan(40000);
    expect(manifest.bytes).toBeLessThan(1048576);
    expect(manifest.textures).toBe(0);
    expect(manifest.license).toBe("CC0-1.0");
    expect(manifest.animations).toBe(0);
  });
  it("parses in the actual Three GLTFLoader without a decoder, image or browser GPU", async () => {
    const gltf = await new GLTFLoader().parseAsync(data, "");
    const box = new Box3().setFromObject(gltf.scene);
    const dimensions = box.getSize(new Vector3());
    expect(dimensions.z).toBeCloseTo(38.6, 1);
    expect(dimensions.x).toBeCloseTo(35.6, 1);
    for (const part of [
      "Fuselage",
      "WingLeft",
      "WingRight",
      "EngineLeft",
      "EngineRight",
      "VerticalTail",
      "NoseGear",
      "MainGearLeft",
      "MainGearRight",
    ])
      expect(gltf.scene.getObjectByName(part), part).toBeTruthy();
    let triangles = 0;
    gltf.scene.traverse((o) => {
      if (o instanceof Mesh)
        triangles +=
          (o.geometry.index?.count || o.geometry.attributes.position.count) / 3;
    });
    expect(triangles).toBe(manifest.triangles);
    expect(gltf.animations).toHaveLength(0);
    // With +Y up and +Z forward in a right-handed system, cockpit-left is +X.
    expect(
      new Box3()
        .setFromObject(gltf.scene.getObjectByName("EngineLeft")!)
        .getCenter(new Vector3()).x,
    ).toBeGreaterThan(0);
    expect(
      new Box3()
        .setFromObject(gltf.scene.getObjectByName("EngineRight")!)
        .getCenter(new Vector3()).x,
    ).toBeLessThan(0);
  });
  it("rejects HTML, truncated and oversized payloads", () => {
    expect(() =>
      assertGlb(new TextEncoder().encode("<html>not a model</html>").buffer),
    ).toThrow();
    const corrupt = data.slice(0, 24);
    expect(() => assertGlb(corrupt)).toThrow();
    expect(() => assertGlb(new ArrayBuffer(1048577))).toThrow();
  });
  it("bounds physical pixels and DPR for iPad-sized and high-DPI layouts", () => {
    for (const q of ["efficient", "balanced"] as const) {
      for (const [w, h, dpr] of [
        [1024, 768, 2],
        [1366, 1024, 2],
        [390, 540, 3],
        [3840, 2160, 2],
      ]) {
        const r = renderingSize(w, h, dpr, q);
        expect(r.pixelWidth * r.pixelHeight).toBeLessThanOrEqual(
          q === "efficient" ? 800000 : 1500000,
        );
        expect(r.dpr).toBeLessThanOrEqual(q === "efficient" ? 1 : 1.5);
      }
    }
    expect(renderingSize(0, 0, NaN, "efficient").pixelWidth).toBe(1);
  });
  it("provides distinct view targets and a genuine nose-forward coordinate convention", () => {
    expect(Object.keys(viewPresets)).toHaveLength(5);
    expect(viewPresets.nose.target[2]).toBeGreaterThan(0);
    expect(viewPresets.engine.target[0]).toBeGreaterThan(0);
    expect(viewPresets.engine.target[1]).toBeLessThan(0);
    expect(viewPresets.top.position[1]).toBeGreaterThan(1);
    expect(
      new Set(Object.values(viewPresets).map((v) => JSON.stringify(v))).size,
    ).toBe(5);
  });
});
