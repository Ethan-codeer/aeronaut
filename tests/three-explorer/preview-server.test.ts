import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, writeFile, mkdir, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  previewResponse,
  lanPreviewUrls,
} from "../../scripts/three-explorer/preview-server.mjs";
let root: string;
beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "aeronaut-preview-"));
  await writeFile(join(root, "index.html"), "<html>home</html>");
  await writeFile(join(root, "404.html"), "<html>missing</html>");
  await mkdir(join(root, "lab"));
  await writeFile(
    join(root, "lab/3d-explorer.html"),
    "<html>3D Explorer</html>",
  );
  await writeFile(join(root, "model.glb"), Buffer.from("glTF binary"));
  await symlink("/etc/hosts", join(root, "outside.txt"));
});
afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});
describe("read-only device preview server", () => {
  it("maps extensionless routes and serves GLB with a length and usable MIME", async () => {
    const page = await previewResponse(root, "/lab/3d-explorer", "GET");
    expect(page.status).toBe(200);
    expect(page.body.toString()).toContain("3D Explorer");
    const model = await previewResponse(root, "/model.glb?v=sample", "HEAD");
    expect(model.status).toBe(200);
    expect(model.headers["content-type"]).toBe("model/gltf-binary");
    expect(Number(model.headers["content-length"])).toBe(model.body.length);
  });
  it("preserves real 404s and rejects writes and links outside the export", async () => {
    expect((await previewResponse(root, "/not-a-route", "GET")).status).toBe(
      404,
    );
    expect((await previewResponse(root, "/model.glb", "POST")).status).toBe(
      405,
    );
    expect((await previewResponse(root, "/outside.txt", "GET")).status).toBe(
      403,
    );
    expect((await previewResponse(root, "/%00bad", "GET")).status).toBe(400);
  });
  it("prints private LAN addresses and excludes loopback and public interfaces", () => {
    const addresses = {
      wifi: [
        { family: "IPv4", internal: false, address: "192.168.1.40" },
        { family: "IPv4", internal: false, address: "192.168.1.40" },
      ],
      local: [{ family: "IPv4", internal: true, address: "127.0.0.1" }],
      public: [{ family: "IPv4", internal: false, address: "8.8.8.8" }],
    };
    expect(lanPreviewUrls(4173, addresses)).toEqual([
      "http://192.168.1.40:4173/lab/3d-explorer",
    ]);
  });
});
