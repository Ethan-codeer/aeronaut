import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const base = process.env.PERF_TEST_BASE_URL || "http://localhost:4175";
const html = await readFile("out/lab/3d-explorer.html", "utf8"),
  home = await readFile("out/index.html", "utf8");
const scripts = (source) =>
  [...source.matchAll(/<script[^>]+src="([^"?]+\.js)(?:\?[^\"]*)?"/g)].map(
    (m) => m[1],
  );
for (const [name, source] of [
  ["home", home],
  ["normalExplorer", html],
]) {
  for (const path of scripts(source)) {
    const code = await readFile("out" + path, "utf8");
    if (
      code.includes("aeronaut-3d-performance-debug-v1") ||
      code.includes("Offline analytic curve re-tessellation")
    )
      throw Error(
        `Debug code or stress manifest eagerly included: ${name} ${path}`,
      );
  }
  if (source.includes("debug/twinjet-"))
    throw Error(`Stress assets included in initial HTML: ${name}`);
}
if (!html.includes("进入性能调试模式")) throw Error("Debug entry missing");
const manifest = JSON.parse(
  await readFile("public/models/three-explorer/debug/manifest.json", "utf8"),
);
const responses = [];
for (const v of manifest.variants) {
  const r = await fetch(new URL(v.url, base));
  const body = Buffer.from(await r.arrayBuffer());
  const sha = createHash("sha256").update(body).digest("hex");
  if (
    r.status !== 200 ||
    sha !== v.sha256 ||
    body.length !== v.bytes ||
    body.readUInt32LE(0) !== 0x46546c67
  )
    throw Error(`Invalid stress asset ${v.id}`);
  const mime = r.headers.get("content-type") || "";
  if (!/(model\/gltf-binary|application\/octet-stream)/.test(mime))
    throw Error("Incorrect GLB MIME");
  responses.push({
    id: v.id,
    url: v.url,
    triangles: v.triangles,
    status: r.status,
    bytes: body.length,
    mime,
    sha256: sha,
  });
}
const result = {
  checkedAt: new Date().toISOString(),
  base,
  initialHomeAndExplorerDebugRuntime: false,
  initialStressModelRequestsDeclared: false,
  stressAssets: responses,
  scope:
    "Exported HTML/JS and HTTP resource validation; no browser execution, WebAssembly CSP test or real iPad FPS measurement.",
};
await writeFile(
  process.env.PERF_TEST_REPORT || "docs/three-explorer/debug/static-check.json",
  JSON.stringify(result, null, 2) + "\n",
);
console.log(
  `PASS: debug logic absent from normal initial scripts; ${responses.length} single-airframe stress GLBs have correct HTTP bytes, MIME and SHA-256.`,
);
