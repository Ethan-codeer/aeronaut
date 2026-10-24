import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { networkInterfaces } from "node:os";
import { pathToFileURL } from "node:url";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".glb": "model/gltf-binary",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};
/** @param {number} port @param {Record<string, {family: string|number, internal: boolean, address: string}[]|undefined>} interfaces */
export function lanPreviewUrls(port, interfaces = networkInterfaces()) {
  const ips = new Set();
  for (const entries of Object.values(interfaces))
    for (const item of entries || [])
      if (
        !item.internal &&
        (item.family === "IPv4" || item.family === 4) &&
        /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(item.address)
      )
        ips.add(item.address);
  return [...ips].map((ip) => `http://${ip}:${port}/lab/3d-explorer`);
}
/** @param {string} root @param {string} rawUrl @param {string} method @returns {Promise<{status:number, headers:Record<string,string>, body:Buffer}>} */
export async function previewResponse(root, rawUrl, method = "GET") {
  const headers = {
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  };
  if (!["GET", "HEAD"].includes(method))
    return {
      status: 405,
      headers: {
        ...headers,
        allow: "GET, HEAD",
        "content-type": "text/plain; charset=utf-8",
      },
      body: Buffer.from("Preview is read-only."),
    };
  let pathname;
  try {
    pathname = decodeURIComponent(
      new URL(rawUrl, "http://preview.local").pathname,
    );
  } catch {
    return { status: 400, headers, body: Buffer.from("Invalid preview path.") };
  }
  if (pathname.includes("\0"))
    return { status: 400, headers, body: Buffer.from("Invalid preview path.") };
  const base = resolve(root);
  let file = resolve(base, `.${pathname}`);
  const within = (p) => p === base || p.startsWith(base + sep);
  if (!within(file))
    return { status: 403, headers, body: Buffer.from("Forbidden") };
  if (pathname.endsWith("/")) file = resolve(file, "index.html");
  else if (!extname(file)) file += ".html";
  try {
    const resolved = await realpath(file);
    if (!within(resolved))
      return { status: 403, headers, body: Buffer.from("Forbidden") };
    if (!(await stat(resolved)).isFile()) throw Error("missing");
    const body = await readFile(resolved);
    return {
      status: 200,
      headers: {
        ...headers,
        "content-type":
          mime[extname(file).toLowerCase()] || "application/octet-stream",
        "content-length": String(body.length),
      },
      body,
    };
  } catch (error) {
    if (error.code && !["ENOENT", "ENOTDIR"].includes(error.code)) throw error;
    let body;
    try {
      body = await readFile(resolve(base, "404.html"));
    } catch {
      body = Buffer.from("Not found");
    }
    return {
      status: 404,
      headers: {
        ...headers,
        "content-type": "text/html; charset=utf-8",
        "content-length": String(body.length),
      },
      body,
    };
  }
}
export function createPreviewServer(root) {
  return createServer(async (req, res) => {
    try {
      const result = await previewResponse(root, req.url, req.method);
      res.writeHead(result.status, result.headers);
      res.end(req.method === "HEAD" ? undefined : result.body);
    } catch {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end("Preview request failed.");
    }
  });
}
if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  const args = process.argv.slice(2);
  const read = (name, fallback) => {
    const i = args.indexOf(name);
    return i === -1 ? fallback : args[i + 1];
  };
  const root = resolve(read("--root", "out"));
  const port = Number(read("--port", "4173"));
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw Error("Choose a port from 1 to 65535.");
  await stat(resolve(root, "index.html"));
  const server = createPreviewServer(root);
  server.on("error", (error) => {
    console.error(`Cannot start preview: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, "0.0.0.0", () => {
    console.log(
      `AERONAUT local preview: http://localhost:${port}/lab/3d-explorer`,
    );
    const urls = lanPreviewUrls(port);
    if (urls.length) {
      console.log("On an iPad on the same private Wi-Fi, open one of:");
      for (const url of urls) console.log(url);
    } else
      console.log(
        "No private IPv4 interface found. Connect this computer and iPad to the same private Wi-Fi.",
      );
    console.log(
      "Keep this window open. Press Ctrl+C to stop. No production Site is updated.",
    );
  });
}
