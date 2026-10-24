// SPDX-License-Identifier: GPL-2.0-only
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, weld, meshopt } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import validator from "gltf-validator";
import sharp from "sharp";
const [highDirectory, balancedDirectory] = process.argv.slice(2);
if (!highDirectory || !balancedDirectory)
  throw Error("Pass high and balanced conversion directories");
const directory = "public/models/boeing747";
await mkdir(directory, { recursive: true });
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "meshopt.encoder": MeshoptEncoder,
    "meshopt.decoder": MeshoptDecoder,
  });
const variants = [],
  audits = [];
for (const [quality, dir] of [
  ["high", highDirectory],
  ["balanced", balancedDirectory],
]) {
  const doc = await io.read(dir + "/747-8i-source-converted.glb");
  const source = await io.writeBinary(doc);
  const rawAudit = await validator.validateBytes(source);
  if (rawAudit.issues.numErrors) throw Error("Source validation failed");
  await doc.transform(dedup(), prune(), weld());
  let removedDegenerateTriangles = 0;
  for (const m of doc.getRoot().listMeshes())
    for (const p of m.listPrimitives()) {
      const index = p.getIndices(),
        position = p.getAttribute("POSITION");
      if (!index) continue;
      const source = index.getArray(),
        kept = [];
      for (let i = 0; i < source.length; i += 3) {
        const a = [],
          b = [],
          c = [];
        position.getElement(source[i], a);
        position.getElement(source[i + 1], b);
        position.getElement(source[i + 2], c);
        const u = b.map((n, k) => n - a[k]),
          v = c.map((n, k) => n - a[k]);
        const cross = [
          u[1] * v[2] - u[2] * v[1],
          u[2] * v[0] - u[0] * v[2],
          u[0] * v[1] - u[1] * v[0],
        ];
        if (cross.reduce((sum, n) => sum + n * n, 0) < 1e-16)
          removedDegenerateTriangles++;
        else kept.push(source[i], source[i + 1], source[i + 2]);
      }
      index.setArray(new source.constructor(kept));
    }
  await doc.transform(
    meshopt({
      encoder: MeshoptEncoder,
      level: "high",
      quantizePosition: 16,
      quantizeNormal: 12,
      quantizeTexcoord: 16,
    }),
  );
  const bytes = await io.writeBinary(doc),
    sha256 = createHash("sha256").update(bytes).digest("hex");
  const file = `747-8i-${quality}-${sha256.slice(0, 12)}.glb`;
  await writeFile(directory + "/" + file, bytes);
  const decoded = await io.readBinary(bytes),
    root = decoded.getRoot();
  root
    .listExtensionsUsed()
    .find((e) => e.extensionName === "EXT_meshopt_compression")
    ?.dispose();
  const buffer = root.listBuffers()[0] || decoded.createBuffer();
  for (const a of root.listAccessors()) a.setBuffer(buffer);
  const plain = await io.writeBinary(decoded),
    audit = await validator.validateBytes(plain);
  if (audit.issues.numErrors) throw Error("Decoded validation failed");
  // Retain decoded output only in the research workspace for independent Blender validation.
  await writeFile(dir + "/747-8i-decoded.glb", plain);
  const primitives = root.listMeshes().flatMap((m) => m.listPrimitives());
  const triangles = primitives.reduce(
    (n, p) =>
      n +
      (p.getIndices()?.getCount() || p.getAttribute("POSITION").getCount()) / 3,
    0,
  );
  const textures = await Promise.all(
    root.listTextures().map(async (t) => {
      const b = t.getImage();
      const m = await sharp(b).metadata();
      return {
        name: t.getName(),
        mime: t.getMimeType(),
        width: m.width,
        height: m.height,
        bytes: b.length,
      };
    }),
  );
  if (
    textures.length !== 2 ||
    root.listMaterials().length > 6 ||
    primitives.length > 50
  )
    throw Error("Resource budget failed");
  const parts = root
    .listNodes()
    .filter((n) => n.getMesh())
    .map((n) => n.getName());
  if (parts.filter((n) => n.startsWith("Engine")).length !== 4)
    throw Error("Four-engine assembly missing");
  const record = {
    id: "boeing747-" + quality,
    label: quality === "high" ? "747-8 洲际型 · 高清" : "747-8 洲际型 · 轻量",
    quality,
    targetTriangles: quality === "high" ? 150000 : 67000,
    triangles,
    bytes: bytes.length,
    sha256,
    url: "/models/boeing747/" + file,
    airframes: 1,
    meshes: primitives.length,
    materials: root.listMaterials().length,
    textures: textures.length,
    textureDetails: textures,
    cameraProfile: "boeing747",
    license: "GPL-2.0-only",
    parts,
    geometryBufferBytes: root
      .listAccessors()
      .reduce((n, a) => n + a.getByteLength(), 0),
  };
  variants.push(record);
  audits.push({
    id: record.id,
    sourceErrors: rawAudit.issues.numErrors,
    removedDegenerateTriangles,
    sourceWarnings: rawAudit.issues.numWarnings,
    decodedErrors: audit.issues.numErrors,
    decodedWarnings: audit.issues.numWarnings,
    messages: audit.issues.messages,
  });
}
await sharp(highDirectory + "/overview.png")
  .resize(1400, 900)
  .webp({ quality: 88 })
  .toFile(directory + "/poster.webp");
const manifest = {
  schemaVersion: 1,
  title: "Boeing 747-8 Intercontinental",
  chineseTitle: "波音747-8洲际型",
  defaultQuality: "balanced",
  modelUrl: variants[0].url,
  bytes: variants[0].bytes,
  sha256: variants[0].sha256,
  triangles: variants[0].triangles,
  textures: 2,
  materials: variants[0].materials,
  license: "GPL-2.0-only",
  licenseUrl: "/models/boeing747/LICENSE.txt",
  posterUrl: "/models/boeing747/poster.webp",
  sourceBundleUrl: "/models/boeing747/corresponding-source.zip",
  origin: {
    url: "https://github.com/JMaverick16/747-8",
    commit: "0ed6056990828084bd51770e3ad73d0b61a1ad61",
    authors: [
      "John Williams",
      "Grupo FGBr: Aurino das Neves, Isaias Prestes, Rick Britto, Wagner Silva",
      "Gijs de Rooy; Ivan Ngeow, Jentron, Syd Adams, Torsten Dreyer, Markus Bulik",
    ],
    readmeUrl:
      "https://github.com/JMaverick16/747-8/blob/0ed6056990828084bd51770e3ad73d0b61a1ad61/README",
  },
  livery: "中性白色 · 无航司涂装",
  modifications: [
    "AC3D外观与起落架转换为静态glTF；移除不可见客舱内饰及灯光效果",
    "曲面细化、固定边界并对高清档作UV边界减面；保留四发动机、驼峰、后掠翼尖和五组起落架",
    "重制发动机、起落架与轮胎纹理，移除原发动机照片和标志；保留GPL机身/机翼纹理",
    "2048×2048与512×512两张内嵌PNG图集，六材质共享与部件批处理，Meshopt压缩",
  ],
  variants,
};
await writeFile(
  directory + "/manifest.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
await writeFile(
  "docs/three-explorer/boeing747/asset-validation.json",
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      tool: "gltf-validator + glTF Transform Meshopt decode round-trip",
      variants: audits,
      note: "Not GPU or iPad Safari performance verification",
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify(
    variants.map(
      ({
        id,
        triangles,
        bytes,
        meshes,
        materials,
        textures,
        textureDetails,
      }) => ({
        id,
        triangles,
        bytes,
        drawPrimitives: meshes,
        materials,
        textures,
        textureDetails,
      }),
    ),
    null,
    2,
  ),
);
