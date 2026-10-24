// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  act,
} from "@testing-library/react";
import { ThreeExplorer } from "../../components/three-explorer/explorer";
const fake = vi.hoisted(() => ({
  dispose: vi.fn(),
  view: vi.fn(),
  zoom: vi.fn(),
  rotate: vi.fn(),
  quality: vi.fn(),
  benchmark: vi.fn(),
  autoRotate: vi.fn(),
  create: vi.fn(),
  fail: false,
}));
vi.mock("../../lib/three-explorer/runtime", () => ({
  createExplorer: fake.create,
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  fake.fail = false;
});
function readyMock() {
  fake.create.mockImplementation(async (o) => {
    if (fake.fail) throw Error("WebGL 2 unavailable");
    o.onProgress(269568, 269568);
    o.onPhase("模型已就绪");
    o.onMetrics({
      downloadMs: 12,
      parseMs: 3,
      firstFrameMs: 30,
      bytes: 269568,
      mime: "model/gltf-binary",
      triangles: 13300,
      drawCalls: 25,
      geometries: 25,
      textures: 0,
      geometryBytes: 253836,
      textureBytes: 23767723,
      framebufferBytes: 4096000,
      pixelWidth: 800,
      pixelHeight: 640,
      dpr: 1,
      benchmarkFps: null,
      benchmarkFrames: 0,
      benchmarkMs: 0,
      renderSubmissionMs: 0.5,
      state: "ready",
    });
    return fake;
  });
}
describe("independent 3D explorer UI with simulated renderer", () => {
  it("shows a usable 2D poster and makes no renderer request before consent to load", () => {
    readyMock();
    render(<ThreeExplorer />);
    expect(screen.getByRole("button", { name: /启用3D探索/ })).toBeTruthy();
    expect(screen.getByRole("img", { name: /离线渲染图/ })).toBeTruthy();
    expect(fake.create).not.toHaveBeenCalled();
  });
  it("activates lazily, changes views, zooms, resets, changes quality, and releases resources", async () => {
    readyMock();
    render(<ThreeExplorer />);
    fireEvent.click(screen.getByRole("button", { name: /启用3D探索/ }));
    await waitFor(() => expect(fake.create).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "发动机" }).hasAttribute("disabled"),
      ).toBe(false),
    );
    fireEvent.click(screen.getByRole("button", { name: "发动机" }));
    expect(fake.view).toHaveBeenLastCalledWith("engine");
    fireEvent.click(screen.getByRole("button", { name: "重置视角" }));
    expect(fake.view).toHaveBeenLastCalledWith("overview");
    fireEvent.click(screen.getByRole("button", { name: "放大模型" }));
    expect(fake.zoom).toHaveBeenCalledWith(0.85);
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "efficient" },
    });
    expect(fake.quality).toHaveBeenCalledWith("efficient");
    fireEvent.keyDown(screen.getByRole("img", { name: /可旋转/ }), {
      key: "ArrowLeft",
    });
    expect(fake.rotate).toHaveBeenCalledWith(-0.12);
    fireEvent.click(screen.getByRole("button", { name: "退出3D并释放资源" }));
    expect(fake.dispose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /启用3D探索/ })).toBeTruthy();
  });
  it("falls back to the same model poster on WebGL failure and supports retry", async () => {
    readyMock();
    fake.fail = true;
    render(<ThreeExplorer />);
    fireEvent.click(screen.getByRole("button", { name: /启用3D探索/ }));
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "WebGL 2 unavailable",
      ),
    );
    expect(screen.getByRole("img", { name: /离线渲染图/ })).toBeTruthy();
    fake.fail = false;
    fireEvent.click(screen.getByRole("button", { name: "重试3D" }));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(fake.create).toHaveBeenCalledTimes(2);
  });
  it("switches to the actual high 747 asset, releases the old renderer and supports explicit auto rotation", async () => {
    readyMock();
    render(<ThreeExplorer />);
    fireEvent.click(screen.getByRole("button", { name: /启用3D探索/ }));
    await waitFor(() =>
      expect(
        screen
          .getByRole("button", { name: "自动旋转" })
          .hasAttribute("disabled"),
      ).toBe(false),
    );
    fireEvent.click(screen.getByRole("button", { name: "自动旋转" }));
    expect(fake.autoRotate).toHaveBeenLastCalledWith(true);
    fireEvent.click(screen.getByRole("button", { name: "停止自动旋转" }));
    expect(fake.autoRotate).toHaveBeenLastCalledWith(false);
    const oldCanvas = screen.getByRole("img", { name: /可旋转/ });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "high" },
    });
    await waitFor(() => expect(fake.create).toHaveBeenCalledTimes(2));
    expect(fake.dispose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("img", { name: /可旋转/ })).not.toBe(oldCanvas);
    expect(fake.create.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        initialQuality: "high",
        url: expect.stringContaining("747-8i-high-"),
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "退出3D并释放资源" }));
    expect(fake.dispose).toHaveBeenCalledTimes(2);
  });
  it("can cancel the module activation before mounting the renderer", async () => {
    readyMock();
    render(<ThreeExplorer />);
    fireEvent.click(screen.getByRole("button", { name: /启用3D探索/ }));
    const cancel = screen.queryByRole("button", { name: "取消，继续浏览2D" });
    expect(cancel).toBeTruthy();
    fireEvent.click(cancel!);
    await act(async () => {
      await Promise.resolve();
    });
    expect(fake.create).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /启用3D探索/ })).toBeTruthy();
  });
});
