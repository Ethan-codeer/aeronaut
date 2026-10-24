import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { meshopt } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import validator from "gltf-validator";
import {
  buildDebugTwinjet,
  qualityForTarget,
  predictedTriangles,
} from "./model-builder.mjs";
await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const directory = "public/models/three-explorer/debug";
await mkdir(directory, { recursive: true });
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "meshopt.encoder": MeshoptEncoder,
    "meshopt.decoder": MeshoptDecoder,
  });
const variants = [];
const validation = [];
for (const target of [20000, 50000, 100000, 150000, 200000]) {
  const quality = qualityForTarget(target),
    doc = await buildDebugTwinjet(quality),
    root = doc.getRoot();
  const triangles = root
    .listMeshes()
    .reduce(
      (n, m) =>
        n +
        m
          .listPrimitives()
          .reduce(
            (a, p) =>
              a +
              (p.getIndices()?.getCount() ||
                p.getAttribute("POSITION").getCount()) /
                3,
            0,
          ),
      0,
    );
  if (
    triangles !== predictedTriangles(quality) ||
    Math.abs(triangles - target) / target > 0.05
  )
    throw Error("Target tessellation verification failed");
  const nodes = root
    .listScenes()[0]
    .listChildren()
    .map((n) => n.getName());
  if (nodes.length !== 13 || root.listMeshes().length !== 24)
    throw Error("Unexpected airframe count or batching");
  const uncompressed = await io.writeBinary(doc);
  const originalValidation = await validator.validateBytes(uncompressed, {
    uri: `single-twinjet-${target}.glb`,
  });
  if (originalValidation.issues.numErrors)
    throw Error("Uncompressed model validation failed");
  await doc.transform(
    meshopt({
      encoder: MeshoptEncoder,
      level: "high",
      quantizePosition: 16,
      quantizeNormal: 12,
    }),
  );
  const bytes = await io.writeBinary(doc);
  const decoded = await io.readBinary(bytes);
  decoded
    .getRoot()
    .listExtensionsUsed()
    .find((e) => e.extensionName === "EXT_meshopt_compression")
    ?.dispose();
  const decodedBuffer =
    decoded.getRoot().listBuffers()[0] || decoded.createBuffer();
  for (const a of decoded.getRoot().listAccessors()) a.setBuffer(decodedBuffer);
  const roundTrip = await io.writeBinary(decoded);
  const checked = await validator.validateBytes(roundTrip, {
    uri: `decoded-${target}.glb`,
  });
  // The validator cannot decode EXT_meshopt_compression itself; validate its decoded round-trip.
  if (checked.issues.numErrors) throw Error("Decoded model validation failed");
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const name = `twinjet-${target}-${sha256.slice(0, 10)}.glb`;
  await writeFile(directory + "/" + name, bytes);
  const record = {
    id: `twinjet-${target}`,
    targetTriangles: target,
    triangles,
    quality,
    bytes: bytes.length,
    uncompressedBytes: uncompressed.length,
    sha256,
    url: "/models/three-explorer/debug/" + name,
    airframes: 1,
    meshes: 24,
    semanticGroups: 13,
    materials: 6,
    textures: 0,
    license: "CC0-1.0",
    source: "scripts/three-explorer/debug/model-builder.mjs",
    extensionsRequired: root
      .listExtensionsRequired()
      .map((e) => e.extensionName),
    method:
      "Offline analytic curve re-tessellation of one twinjet; same 13 semantic groups, 24 primitives and six materials; not duplicated airframes, not flat-face subdivision.",
  };
  variants.push(record);
  validation.push({
    id: record.id,
    sourceErrors: originalValidation.issues.numErrors,
    sourceWarnings: originalValidation.issues.numWarnings,
    decodedRoundTripErrors: checked.issues.numErrors,
    decodedRoundTripWarnings: checked.issues.numWarnings,
    compressedBytes: bytes.length,
    actualTriangles: triangles,
    airframes: 1,
  });
  console.log(JSON.stringify(record));
}
const manifest = {
  schemaVersion: 1,
  createdAt: new Date().toISOString(),
  license: "CC0-1.0",
  decoder: "meshoptimizer 0.22.0, MIT, bundled locally only in debug mode",
  method:
    "Single airframe per asset. Only curved-surface tessellation changes; material count, texture count, model dimensions and scene count held constant. Not representative of textured OEM models.",
  variants,
};
await writeFile(
  directory + "/manifest.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
await writeFile(
  "docs/three-explorer/debug/asset-validation.json",
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      variants: validation,
      scope:
        "Offline generator, topology and decoded glTF validation; not a GPU or device performance result.",
    },
    null,
    2,
  ) + "\n",
);
await writeFile(
  directory + "/LICENSE.txt",
  await readFile("public/models/three-explorer/LICENSE.txt"),
);
