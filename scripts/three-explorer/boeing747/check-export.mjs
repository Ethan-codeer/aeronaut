import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const base = process.env.BOEING_TEST_BASE_URL || "http://localhost:4177";
const root = "out",
  manifest = JSON.parse(
    await readFile("public/models/boeing747/manifest.json", "utf8"),
  );
const r = await fetch(base + "/lab/3d-explorer"),
  html = await r.text();
if (
  r.status !== 200 ||
  !html.includes("Boeing 747-8") ||
  !html.includes("GPL 2.0") ||
  !html.includes("corresponding-source.zip")
)
  throw Error("747 page, source or attribution missing");
if (/<link[^>]*rel="preload"[^>]*\.glb/.test(html))
  throw Error("Unwanted model preload");
for (const page of ["index.html", "lab/3d-explorer.html"]) {
  const source = await readFile(root + "/" + page, "utf8");
  for (const m of source.matchAll(/<script[^>]+src="([^"?]+\.js)/g)) {
    const code = await readFile(root + m[1], "utf8");
    if (
      [
        "THREE.WebGLRenderer",
        "THREE.GLTFLoader",
        "aeronaut-3d-performance-debug-v1",
      ].some((s) => code.includes(s))
    )
      throw Error("Eager runtime " + m[1]);
  }
}
const paths = [
    ...manifest.variants.map((v) => v.url),
    manifest.posterUrl,
    manifest.licenseUrl,
    manifest.sourceBundleUrl,
    "/models/boeing747/manifest.json",
    "/models/boeing747/NOTICE.txt",
    "/models/boeing747/AUTHORS.txt",
  ],
  assets = [];
for (const path of paths) {
  const response = await fetch(base + path),
    body = Buffer.from(await response.arrayBuffer()),
    local = await readFile(root + path),
    sha = (b) => createHash("sha256").update(b).digest("hex");
  if (response.status !== 200 || sha(body) !== sha(local))
    throw Error("HTTP/hash mismatch " + path);
  const mime = response.headers.get("content-type") || "";
  if (
    path.endsWith(".glb") &&
    !/(model\/gltf-binary|application\/octet-stream)/.test(mime)
  )
    throw Error("GLB MIME mismatch");
  if (path.endsWith(".webp") && !mime.includes("image/webp"))
    throw Error("Poster MIME mismatch");
  assets.push({
    path,
    status: response.status,
    bytes: body.length,
    mime,
    sha256: sha(body),
  });
}
const report = {
  checkedAt: new Date().toISOString(),
  base,
  pageStatus: r.status,
  initialRuntimeEager: false,
  modelPreload: false,
  assets,
  scope: "HTML/resource validation, not a Safari device or hardware FPS test",
};
await writeFile(
  process.env.BOEING_TEST_REPORT ||
    "docs/three-explorer/boeing747/static-check.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  "PASS: 747 page, opt-in loading, attribution/source bundle and " +
    assets.length +
    " matching HTTP assets.",
);
