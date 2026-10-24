import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "meshoptimizer";
import { Mesh, Box3, Vector3 } from "three";
import manifest from "../../../public/models/three-explorer/debug/manifest.json";
import validation from "../../../docs/three-explorer/debug/asset-validation.json";
import normal from "../../../public/models/three-explorer/manifest.json";
describe("offline single-airframe stress assets", () => {
  it("preserves the published normal model and its normal byte budget", () => {
    const bytes = readFileSync("public" + normal.modelUrl);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(
      "878e9ee9ed8e3411741e5fcc8ed7cf456b178e99574f04450cfb69b065b31272",
    );
    expect(bytes.length).toBe(269568);
  });
  it("has five verified precision levels, without duplicating airframes or increasing material count", async () => {
    await MeshoptDecoder.ready;
    expect(manifest.variants.map((v) => v.targetTriangles)).toEqual([
      20000, 50000, 100000, 150000, 200000,
    ]);
    let previous = 0;
    for (const v of manifest.variants) {
      const bytes = readFileSync("public" + v.url);
      expect(bytes.length).toBe(v.bytes);
      expect(bytes.length).toBeLessThan(1048576);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(v.sha256);
      const array = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.length,
      ) as ArrayBuffer;
      const gltf = await new GLTFLoader()
        .setMeshoptDecoder(MeshoptDecoder)
        .parseAsync(array, "");
      let triangles = 0,
        meshes = 0;
      const materials = new Set();
      gltf.scene.traverse((object) => {
        if (object instanceof Mesh) {
          triangles +=
            (object.geometry.index?.count ||
              object.geometry.attributes.position.count) / 3;
          meshes++;
          materials.add(object.material);
        }
      });
      expect(triangles).toBe(v.triangles);
      expect(triangles).toBeGreaterThan(previous);
      expect(
        Math.abs(triangles - v.targetTriangles) / v.targetTriangles,
      ).toBeLessThan(0.05);
      expect(meshes).toBe(24);
      expect(materials.size).toBe(6);
      expect(gltf.scene.children.length).toBe(13);
      const size = new Box3().setFromObject(gltf.scene).getSize(new Vector3());
      expect(size.x).toBeCloseTo(35.6, 1);
      expect(size.z).toBeCloseTo(38.6, 1);
      previous = triangles;
      const audit = validation.variants.find((a) => a.id === v.id)!;
      expect(audit.sourceErrors).toBe(0);
      expect(audit.decodedRoundTripErrors).toBe(0);
    }
  }, 15000);
});
