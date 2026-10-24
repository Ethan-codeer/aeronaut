import { assertGlb, MODEL_MAX_BYTES } from "./policy";
export async function downloadModel(
  url: string,
  expectedBytes: number,
  signal: AbortSignal,
  onProgress: (bytes: number, total: number) => void,
  fetcher: typeof fetch = fetch,
) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal.addEventListener("abort", cancel, { once: true });
  if (signal.aborted) cancel();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 20000);
  try {
    const response = await fetcher(url, {
      signal: controller.signal,
      credentials: "same-origin",
      redirect: "error",
    });
    if (!response.ok) throw Error(`模型请求失败（HTTP ${response.status}）。`);
    const mime = response.headers.get("content-type") || "未提供";
    if (mime.includes("text/html"))
      throw Error("模型地址返回了网页，请检查静态资源路径。");
    const reader = response.body?.getReader();
    let result: ArrayBuffer;
    if (reader) {
      const chunks: Uint8Array[] = [];
      let bytes = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (controller.signal.aborted)
          throw new DOMException("Aborted", "AbortError");
        bytes += value.byteLength;
        if (bytes > MODEL_MAX_BYTES) {
          await reader.cancel();
          throw Error("模型超过 1 MiB 的原型资源预算。");
        }
        chunks.push(value);
        onProgress(bytes, expectedBytes);
      }
      const all = new Uint8Array(bytes);
      let offset = 0;
      for (const chunk of chunks) {
        all.set(chunk, offset);
        offset += chunk.length;
      }
      result = all.buffer;
    } else {
      result = await response.arrayBuffer();
      onProgress(result.byteLength, expectedBytes);
    }
    assertGlb(result);
    return { data: result, mime, bytes: result.byteLength };
  } catch (error) {
    if (timedOut)
      throw Error("模型加载超过20秒，请检查网络后重试，或继续浏览2D图片。");
    throw error;
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", cancel);
  }
}
