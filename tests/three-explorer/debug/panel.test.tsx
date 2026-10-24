// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { ThreeExplorer } from "../../../components/three-explorer/explorer";
import { PerformancePanel } from "../../../components/three-explorer/debug/panel";
import { DEBUG_STORAGE_KEY } from "../../../lib/three-explorer/debug/results";
import { fakeResult } from "./fixtures";
const fake = vi.hoisted(() => ({
  create: vi.fn(),
  load: vi.fn(),
  run: vi.fn(),
  setDpr: vi.fn(),
  setScenario: vi.fn(),
  setPaused: vi.fn(),
  view: vi.fn(),
  cancel: vi.fn(),
  dispose: vi.fn(),
  normal: vi.fn(),
  normalDispose: vi.fn(),
  callbacks: null as null | {
    onResult: (r: unknown) => void;
    onSnapshot: (s: unknown) => void;
    onError: (s: string) => void;
  },
}));
vi.mock("../../../lib/three-explorer/debug/runtime", () => ({
  createPerformanceExplorer: fake.create,
}));
vi.mock("../../../lib/three-explorer/runtime", () => ({
  createExplorer: fake.normal,
}));
beforeEach(() => {
  window.localStorage.removeItem(DEBUG_STORAGE_KEY);
  fake.load.mockResolvedValue(undefined);
  fake.create.mockImplementation((options) => {
    fake.callbacks = options;
    options.onSnapshot({
      realtime: { fps: 60 },
      tenSeconds: { fps: 59, low1Fps: 52 },
      triangles: 20644,
      drawCalls: 25,
      textures: 0,
      geometries: 25,
      cssWidth: 800,
      cssHeight: 400,
      pixelWidth: 800,
      pixelHeight: 400,
      deviceDpr: 2,
      requestedDpr: 1,
      actualDprX: 1,
      actualDprY: 1,
      profile: "调试手动DPR1",
      hardwareCapped: false,
      running: false,
      paused: false,
      phase: "实时监测",
      elapsedMs: 0,
      remainingMs: 0,
    });
    return fake;
  });
  fake.run.mockImplementation(async (scenario) => {
    const result = fakeResult(scenario, "synthetic-ui");
    fake.callbacks!.onResult(result);
    return result;
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  window.localStorage.removeItem(DEBUG_STORAGE_KEY);
});
describe("explicitly loaded performance debug panel", () => {
  it("does not initialize debug rendering during ordinary browsing and returns to 2D on exit", async () => {
    render(<ThreeExplorer />);
    expect(fake.create).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("开发者性能调试"));
    fireEvent.click(screen.getByRole("button", { name: "进入性能调试模式" }));
    await waitFor(() => expect(fake.create).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("region", { name: "开发者性能测试" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "退出调试并释放资源" }));
    expect(fake.dispose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /启用3D探索/ })).toBeTruthy();
  });
  it("offers four DPR settings, independent model levels, scenarios and measurements", async () => {
    render(<PerformancePanel onExit={() => {}} />);
    await waitFor(() =>
      expect(
        screen
          .getByRole("button", { name: "测量当前组合" })
          .hasAttribute("disabled"),
      ).toBe(false),
    );
    fireEvent.change(screen.getByLabelText("渲染DPR"), {
      target: { value: "2" },
    });
    expect(fake.setDpr).toHaveBeenCalledWith(2);
    const options = Array.from(
      (screen.getByLabelText("单模型复杂度") as HTMLSelectElement).options,
    );
    expect(options).toHaveLength(5);
    fireEvent.change(screen.getByLabelText("测试场景"), {
      target: { value: "static" },
    });
    expect(fake.setScenario).toHaveBeenCalledWith("static");
    fireEvent.click(screen.getByRole("button", { name: "测量当前组合" }));
    await waitFor(() =>
      expect(screen.getByText(/本机测试结果 · 1 次/)).toBeTruthy(),
    );
    expect(fake.run).toHaveBeenCalledWith(
      "static",
      20,
      expect.objectContaining({ baselineA12X: false }),
    );
    const saved = JSON.parse(localStorage.getItem(DEBUG_STORAGE_KEY)!);
    expect(saved[0].id).toBe("synthetic-ui");
    expect(
      (screen.getByLabelText("简要报告") as HTMLTextAreaElement).value,
    ).toContain("1% Low");
  });
  it("supports manually adding post-run heat and a copy fallback without touching personal progress", async () => {
    localStorage.setItem("aeronaut-progress-v1", "preserved");
    render(<PerformancePanel onExit={() => {}} />);
    await waitFor(() =>
      expect(
        screen
          .getByRole("button", { name: "测量当前组合" })
          .hasAttribute("disabled"),
      ).toBe(false),
    );
    fireEvent.click(screen.getByRole("button", { name: "测量当前组合" }));
    await waitFor(() =>
      expect(screen.getByLabelText("synthetic-ui测试后温感")).toBeTruthy(),
    );
    fireEvent.change(screen.getByLabelText("synthetic-ui测试后温感"), {
      target: { value: "温热" },
    });
    expect(
      (screen.getByLabelText("简要报告") as HTMLTextAreaElement).value,
    ).toContain("温热");
    expect(
      JSON.parse(localStorage.getItem(DEBUG_STORAGE_KEY)!)[0].postRunHeat,
    ).toBe("温热");
    fireEvent.click(screen.getByRole("button", { name: "复制简要报告" }));
    await waitFor(() =>
      expect(screen.getByText(/长按下方报告全选复制/)).toBeTruthy(),
    );
    expect(localStorage.getItem("aeronaut-progress-v1")).toBe("preserved");
  });
  it("keeps results exportable when the browser refuses persistence", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw Error("quota");
    });
    render(<PerformancePanel onExit={() => {}} />);
    await waitFor(() =>
      expect(
        screen
          .getByRole("button", { name: "测量当前组合" })
          .hasAttribute("disabled"),
      ).toBe(false),
    );
    fireEvent.click(screen.getByRole("button", { name: "测量当前组合" }));
    await waitFor(() =>
      expect(screen.getByText(/新结果已保留在当前页面/)).toBeTruthy(),
    );
    expect(
      screen
        .getByRole("button", { name: "导出全部结果 JSON" })
        .hasAttribute("disabled"),
    ).toBe(false);
    expect(screen.getByText(/本机测试结果 · 1 次/)).toBeTruthy();
  });
  it("exposes recovery without a bogus device score when WebGL creation fails", async () => {
    fake.create.mockImplementationOnce(() => {
      throw Error("WebGL2 unavailable");
    });
    const exit = vi.fn();
    render(<PerformancePanel onExit={exit} />);
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "WebGL2 unavailable",
      ),
    );
    expect(
      screen
        .getByRole("button", { name: "测量当前组合" })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(screen.getByText(/尚无测试结果/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "退出调试并释放资源" }));
    expect(exit).toHaveBeenCalledOnce();
  });
});
