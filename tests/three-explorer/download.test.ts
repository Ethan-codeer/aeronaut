import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { downloadModel } from "../../lib/three-explorer/download";
const bytes = new Uint8Array(
  readFileSync("public/models/three-explorer/generic-twinjet.glb"),
);
afterEach(() => vi.useRealTimers());
describe("model transport and failure handling", () => {
  it("reports streamed progress when Content-Length is absent", async () => {
    const progress = vi.fn();
    const stream = new ReadableStream({
      start(c) {
        c.enqueue(bytes.slice(0, 1000));
        c.enqueue(bytes.slice(1000));
        c.close();
      },
    });
    const fetcher = vi.fn().mockResolvedValue(
      new Response(stream, {
        headers: { "content-type": "application/octet-stream" },
      }),
    );
    const r = await downloadModel(
      "/model.glb",
      bytes.byteLength,
      new AbortController().signal,
      progress,
      fetcher,
    );
    expect(r.bytes).toBe(bytes.byteLength);
    expect(progress.mock.calls).toEqual([
      [1000, bytes.byteLength],
      [bytes.byteLength, bytes.byteLength],
    ]);
    expect(fetcher.mock.calls[0][1].redirect).toBe("error");
  });
  it("accepts the GLB MIME type and validates the embedded binary header", async () => {
    const r = await downloadModel(
      "/model.glb",
      bytes.byteLength,
      new AbortController().signal,
      () => {},
      vi.fn().mockResolvedValue(
        new Response(bytes, {
          headers: { "content-type": "model/gltf-binary" },
        }),
      ),
    );
    expect(r.mime).toBe("model/gltf-binary");
  });
  it("rejects an HTTP failure without parsing an error page", async () => {
    await expect(
      downloadModel(
        "/missing.glb",
        100,
        new AbortController().signal,
        () => {},
        vi.fn().mockResolvedValue(new Response("missing", { status: 404 })),
      ),
    ).rejects.toThrow("HTTP 404");
  });
  it("rejects a 200 HTML fallback instead of treating it as a model", async () => {
    await expect(
      downloadModel(
        "/bad.glb",
        100,
        new AbortController().signal,
        () => {},
        vi.fn().mockResolvedValue(
          new Response("<html/>", {
            headers: { "content-type": "text/html" },
          }),
        ),
      ),
    ).rejects.toThrow("返回了网页");
  });
  it("limits the download size before continuing GPU work", async () => {
    await expect(
      downloadModel(
        "/huge.glb",
        100,
        new AbortController().signal,
        () => {},
        vi
          .fn()
          .mockResolvedValue(new Response(new Uint8Array(16 * 1048576 + 1))),
      ),
    ).rejects.toThrow("16 MiB");
  });
  it("aborts a stalled request and provides a retryable timeout message", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn(
      (_url, options) =>
        new Promise<Response>((_resolve, reject) =>
          options.signal.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          ),
        ),
    );
    const promise = downloadModel(
      "/slow.glb",
      100,
      new AbortController().signal,
      () => {},
      fetcher,
    );
    const assertion = expect(promise).rejects.toThrow("超过20秒");
    await vi.advanceTimersByTimeAsync(20001);
    await assertion;
  });
  it("propagates user cancellation without calling it a network timeout", async () => {
    const controller = new AbortController();
    const fetcher = vi.fn(
      (_url, options) =>
        new Promise<Response>((_resolve, reject) =>
          options.signal.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          ),
        ),
    );
    const promise = downloadModel(
      "/cancel.glb",
      100,
      controller.signal,
      () => {},
      fetcher,
    );
    controller.abort();
    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
  });
});
