import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "meshoptimizer";
import {
  Mesh,
  Group,
  Box3,
  Vector3,
  PerspectiveCamera,
  Texture,
  BoxGeometry,
  MeshStandardMaterial,
} from "three";
import manifest from "../../public/models/boeing747/manifest.json";
import validation from "../../docs/three-explorer/boeing747/asset-validation.json";
import { releaseObject } from "../../lib/three-explorer/resources";
import { boeing747Views } from "../../lib/three-explorer/boeing747";
import { frameAirframe } from "../../lib/three-explorer/camera";
import { renderingSize } from "../../lib/three-explorer/policy";
afterEach(() => vi.unstubAllGlobals());
describe("licensed textured 747-8 production assets", () => {
  it("retains author attribution, GPL terms, editable source and an explicit neutral-paint notice", () => {
    expect(manifest.origin.authors.join(" ")).toContain("John Williams");
    expect(manifest.license).toBe("GPL-2.0-only");
    expect(manifest.livery).toContain("无航司");
    expect(
      readFileSync("public" + manifest.sourceBundleUrl)
        .subarray(0, 2)
        .toString(),
    ).toBe("PK");
    expect(readFileSync("public" + manifest.licenseUrl, "utf8")).toContain(
      "Version 2, June 1991",
    );
    expect(
      readFileSync("public/models/boeing747/NOTICE.txt", "utf8"),
    ).toContain("no original engine photographs");
  });
  it("decodes both actual Meshopt GLBs and both embedded PNG atlases with the real loaders", async () => {
    vi.stubGlobal("self", globalThis);
    vi.stubGlobal("createImageBitmap", async (blob: Blob) => {
      const { info } = await sharp(Buffer.from(await blob.arrayBuffer()))
        .raw()
        .toBuffer({ resolveWithObject: true });
      return { width: info.width, height: info.height, close: vi.fn() };
    });
    await MeshoptDecoder.ready;
    for (const variant of manifest.variants) {
      const file = readFileSync("public" + variant.url);
      expect(file.length).toBe(variant.bytes);
      expect(createHash("sha256").update(file).digest("hex")).toBe(
        variant.sha256,
      );
      const data = file.buffer.slice(
        file.byteOffset,
        file.byteOffset + file.length,
      ) as ArrayBuffer;
      const gltf = await new GLTFLoader()
        .setMeshoptDecoder(MeshoptDecoder)
        .parseAsync(data, "");
      const box = new Box3().setFromObject(gltf.scene),
        size = box.getSize(new Vector3());
      expect(size.x).toBeCloseTo(68.4, 1);
      expect(size.z).toBeCloseTo(76.55, 1);
      for (const part of [
        "EnginePortInner",
        "EnginePortOuter",
        "EngineStarboardInner",
        "EngineStarboardOuter",
        "Fuselage",
        "Wings",
        "VerticalTail",
        "HorizontalTail",
        "LandingGear",
      ])
        expect(gltf.scene.getObjectByName(part), part).toBeTruthy();
      let count = 0,
        meshes = 0;
      const materials = new Set<MeshStandardMaterial>();
      const maps = new Set<Texture>();
      gltf.scene.traverse((o) => {
        if (o instanceof Mesh) {
          meshes++;
          count +=
            (o.geometry.index?.count || o.geometry.attributes.position.count) /
            3;
          for (const m of Array.isArray(o.material)
            ? o.material
            : [o.material]) {
            materials.add(m);
            if (m.map) maps.add(m.map);
          }
        }
      });
      expect(count).toBe(variant.triangles);
      expect(meshes).toBe(20);
      expect(materials.size).toBe(6);
      expect(maps.size).toBe(2);
      expect([...maps].map((t) => t.image.width).sort((a, b) => a - b)).toEqual(
        [512, 2048],
      );
      for (const material of materials)
        expect(material.transparent).toBe(false);
      const audit = validation.variants.find((v) => v.id === variant.id)!;
      expect(audit.sourceErrors).toBe(0);
      expect(audit.decodedErrors).toBe(0);
      // Entire aircraft is framed at phone and iPad aspect ratios, not clipped to the twinjet bounds.
      for (const aspect of [360 / 420, 1024 / 460])
        for (const view of ["overview", "top"] as const) {
          const camera = new PerspectiveCamera(35, aspect, 0.1, 1000),
            preset = boeing747Views[view];
          camera.position
            .fromArray(preset.position)
            .multiplyScalar(size.z * Math.max(1, 1 / aspect));
          frameAirframe(
            camera,
            box,
            new Vector3().fromArray(preset.target).multiplyScalar(size.z),
          );
          camera.updateMatrixWorld();
          for (const x of [box.min.x, box.max.x])
            for (const y of [box.min.y, box.max.y])
              for (const z of [box.min.z, box.max.z]) {
                const point = new Vector3(x, y, z).project(camera);
                expect(Math.abs(point.x)).toBeLessThan(1);
                expect(Math.abs(point.y)).toBeLessThan(1);
              }
        }
      releaseObject(gltf.scene);
    }
  }, 30000);
  it("deduplicates shared texture/image disposal without leaving model resources alive", () => {
    const close = vi.fn(),
      texture = new Texture({ width: 2048, height: 2048, close } as never),
      geometry = new BoxGeometry(),
      material = new MeshStandardMaterial({ map: texture });
    const td = vi.spyOn(texture, "dispose"),
      gd = vi.spyOn(geometry, "dispose"),
      md = vi.spyOn(material, "dispose");
    const group = new Group();
    group.add(new Mesh(geometry, material), new Mesh(geometry, material));
    releaseObject(group);
    expect(td).toHaveBeenCalledOnce();
    expect(gd).toHaveBeenCalledOnce();
    expect(md).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
  });
  it("supports DPR 2 in the explicit high profile with bounded drawing-buffer pixels", () => {
    const high = renderingSize(1024, 460, 2, "high");
    expect(high.dpr).toBe(2);
    expect(high.pixelWidth).toBe(2048);
    const capped = renderingSize(3840, 2160, 2, "high");
    expect(capped.pixelWidth * capped.pixelHeight).toBeLessThanOrEqual(4000000);
  });
});
