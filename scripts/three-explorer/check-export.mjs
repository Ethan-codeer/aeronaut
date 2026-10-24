import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const base = process.env.THREE_TEST_BASE_URL || "http://localhost:3001";
const html = await readFile("out/lab/3d-explorer.html", "utf8");
const home = await readFile("out/index.html", "utf8");
const manifest = JSON.parse(
  await readFile("public/models/three-explorer/manifest.json", "utf8"),
);
const initialScripts = (source) =>
  [...source.matchAll(/<script[^>]+src="([^"?]+\.js)(?:\?[^\"]*)?"/g)].map(
    (m) => m[1],
  );
const findings = [];
for (const [label, source] of [
  ["home", home],
  ["prototype", html],
]) {
  for (const script of initialScripts(source)) {
    const text = await readFile("out" + script, "utf8");
    for (const marker of [
      "THREE.WebGLRenderer",
      "THREE.OrbitControls",
      "THREE.GLTFLoader",
    ])
      if (text.includes(marker))
        throw Error(`3D runtime eagerly included in ${label}: ${script}`);
  }
  findings.push({
    page: label,
    initialScripts: initialScripts(source),
    eagerThreeRuntime: false,
  });
}
if (
  /<link[^>]+(?:preload|prefetch)[^>]+\.glb/.test(html) ||
  /<(?:img|iframe)[^>]+src="[^\"]+\.glb/.test(html)
)
  throw Error("Unexpected eager model resource");
const routes = [
  "/lab/3d-explorer",
  manifest.modelUrl,
  manifest.posterUrl,
  manifest.source,
  manifest.licenseFile,
  "/models/three-explorer/manifest.json",
];
const responses = [];
for (const path of routes) {
  const t = performance.now();
  const requestPath = path.endsWith(".glb")
    ? `${path}?v=${manifest.sha256.slice(0, 16)}`
    : path;
  const r = await fetch(new URL(requestPath, base));
  if (r.status !== 200) throw Error(`${path} HTTP ${r.status}`);
  const data = Buffer.from(await r.arrayBuffer());
  const mime = r.headers.get("content-type");
  if (path.endsWith(".glb")) {
    if (
      !["model/gltf-binary", "application/octet-stream"].some((t) =>
        mime?.includes(t),
      )
    )
      throw Error("GLB returned incorrect MIME");
    const sha = createHash("sha256").update(data).digest("hex");
    if (sha !== manifest.sha256) throw Error("GLB hash mismatch over HTTP");
    if (data.readUInt32LE(0) !== 0x46546c67)
      throw Error("Model bytes are not GLB");
  }
  responses.push({
    path,
    status: r.status,
    mime,
    bytes: data.byteLength,
    environmentLocalFetchMs: performance.now() - t,
  });
}
const report = {
  checkedAt: new Date().toISOString(),
  base,
  scope:
    "Local static HTTP and exported HTML/JS checks. Not a browser network trace or Sites-hosted model request.",
  findings,
  modelPreloadPresent: false,
  responses,
};
await writeFile(
  "docs/three-explorer/static-export-check.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  `PASS: no Three runtime in initial home/prototype scripts; no GLB preload; ${responses.length} prototype resources served with correct content and model hash.`,
);
