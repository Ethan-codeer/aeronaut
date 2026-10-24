import { readFile, writeFile, mkdir } from "node:fs/promises";
import validator from "gltf-validator";
import { NodeIO } from "@gltf-transform/core";
import { createHash } from "node:crypto";
const base = "public/models/three-explorer",
  bytes = await readFile(base + "/generic-twinjet.glb");
const manifest = JSON.parse(await readFile(base + "/manifest.json", "utf8"));
const result = await validator.validateBytes(new Uint8Array(bytes), {
  uri: "generic-twinjet.glb",
  maxIssues: 1000,
});
const doc = await new NodeIO().readBinary(bytes);
let triangles = 0,
  vertices = 0,
  invalidNormals = 0,
  negativeVolume = [];
const volumes = {};
for (const mesh of doc.getRoot().listMeshes()) {
  let volume = 0;
  for (const p of mesh.listPrimitives()) {
    const pos = p.getAttribute("POSITION"),
      normal = p.getAttribute("NORMAL"),
      idx = p.getIndices();
    vertices += pos.getCount();
    triangles += (idx?.getCount() || pos.getCount()) / 3;
    for (let i = 0; i < normal.getCount(); i++) {
      const v = normal.getElement(i, []);
      const length = Math.hypot(...v);
      if (!Number.isFinite(length) || Math.abs(length - 1) > 0.005)
        invalidNormals++;
    }
    for (let i = 0; i < (idx?.getCount() || pos.getCount()); i += 3) {
      const [a, b, c] = [0, 1, 2].map((j) =>
        pos.getElement(idx ? idx.getScalar(i + j) : i + j, []),
      );
      volume +=
        (a[0] * (b[1] * c[2] - b[2] * c[1]) +
          a[1] * (b[2] * c[0] - b[0] * c[2]) +
          a[2] * (b[0] * c[1] - b[1] * c[0])) /
        6;
    }
  }
  volumes[mesh.getName()] = volume;
  if (volume < -0.001) negativeVolume.push(mesh.getName());
}
const checks = {
  hashMatches:
    createHash("sha256").update(bytes).digest("hex") === manifest.sha256,
  sizeMatches: bytes.byteLength === manifest.bytes,
  triangleCountMatches: triangles === manifest.triangles,
  withinByteBudget: bytes.byteLength <= manifest.budget.maxBytes,
  withinTriangleBudget: triangles <= manifest.budget.maxTriangles,
  noTextures: doc.getRoot().listTextures().length === 0,
  noExternalBuffers: doc
    .getRoot()
    .listBuffers()
    .every((b) => !b.getURI()),
  noDecoderExtensions: doc.getRoot().listExtensionsRequired().length === 0,
  validNormals: invalidNormals === 0,
  outwardClosedMeshes: negativeVolume.length === 0,
};
await mkdir("docs/three-explorer", { recursive: true });
const report = {
  checkedAt: new Date().toISOString(),
  validator: { version: validator.version(), ...result },
  checks,
  triangles,
  vertices,
  invalidNormals,
  negativeVolume,
  meshSignedVolumes: volumes,
  scope: "Static GLB validation; not a browser, GPU or device performance test",
};
await writeFile(
  "docs/three-explorer/model-validation.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    {
      errors: result.issues.numErrors,
      warnings: result.issues.numWarnings,
      triangles,
      vertices,
      checks,
    },
    null,
    2,
  ),
);
if (result.issues.numErrors || Object.values(checks).some((value) => !value))
  process.exitCode = 1;
