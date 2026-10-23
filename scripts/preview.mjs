import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("out");
const port = Number(process.env.PORT || 3000);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
};
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (pathname.endsWith("/")) file = resolve(file, "index.html");
    else if (!extname(file)) file += ".html";
    try {
      if (!(await stat(file)).isFile()) throw Error("missing");
    } catch {
      res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      res.end(await readFile(resolve(root, "404.html")));
      return;
    }
    res.writeHead(200, {
      "content-type": types[extname(file)] || "application/octet-stream",
      "cache-control": "no-cache",
    });
    res.end(await readFile(file));
  } catch {
    res.writeHead(500);
    res.end("Preview request failed");
  }
}).listen(port, "0.0.0.0", () =>
  console.log(`AERONAUT static preview: http://localhost:${port}`),
);
