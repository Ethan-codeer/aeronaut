import { liveries } from "@/data/liveries";
import { airports } from "@/data/airports";
// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from "@testing-library/react";
import { DictionaryBrowser } from "../components/dictionary-browser";
import { AnatomyExplorer } from "../components/anatomy-explorer";
import { CockpitChallenge } from "../components/cockpit-challenge";
import { InstrumentLab } from "../components/instruments";
import { LicensedPhoto } from "../components/licensed-photo";
import { LiveryGallery } from "../components/livery-gallery";
import { AirportBrowser } from "../components/airport-browser";
import { AirportChallenge } from "../components/airport-challenge";
import { cockpitQuestions } from "../data/cockpit";
vi.mock("next/link", () => ({
  default: ({
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));
vi.mock("next/dynamic", () => ({
  default: () =>
    function MapFallback() {
      return <div>地图服务不可用，保留列表</div>;
    },
}));
afterEach(cleanup);
describe("V1.2 React interactions (DOM simulation, not browser layout)", () => {
  it("searches dictionary and recovers from no results", () => {
    render(<DictionaryBrowser />);
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "ETOPS" } });
    expect(screen.getByText("延程运行")).toBeTruthy();
    fireEvent.change(input, { target: { value: "nothingfound" } });
    expect(screen.getByText(/没有匹配的术语/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "清除筛选" }));
    expect(screen.getByRole("status").textContent).toContain("69 / 69");
  });
  it("selects anatomy parts by keyboard and touch-equivalent click", () => {
    render(<AnatomyExplorer />);
    fireEvent.keyDown(screen.getByRole("button", { name: "发动机" }), {
      key: "Enter",
    });
    expect(screen.getByRole("heading", { name: "发动机" })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "理解推力 ↗" }).getAttribute("href"),
    ).toBe("/dictionary/thrust");
    fireEvent.click(screen.getByRole("button", { name: "副翼" }));
    expect(screen.getByRole("heading", { name: "副翼" })).toBeTruthy();
  });
  it("changes pitch independently from vertical speed and restores controls", () => {
    render(<InstrumentLab />);
    fireEvent.change(screen.getByLabelText(/俯仰（上仰为正）/), {
      target: { value: "20" },
    });
    expect(screen.getByRole("img", { name: /姿态仪，俯仰20度/ })).toBeTruthy();
    expect(
      screen.getByRole("img", { name: "垂直速度表，0英尺每分钟" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "恢复初始参数" }));
    expect(screen.getByRole("img", { name: /姿态仪，俯仰0度/ })).toBeTruthy();
  });
  it("scores a full cockpit round once per answer and allows a fresh round", () => {
    render(<CockpitChallenge />);
    fireEvent.click(screen.getByRole("button", { name: "开始仪表挑战" }));
    for (let i = 0; i < 10; i++) {
      const title = screen.getByRole("heading", { level: 2 }).textContent;
      const q = cockpitQuestions.find((q) => q.question === title)!;
      const answer = screen.getByRole("button", { name: q.options[q.answer] });
      fireEvent.click(answer);
      expect(answer.hasAttribute("disabled")).toBe(true);
      expect(screen.getByText(`当前得分 ${i + 1}`)).toBeTruthy();
      fireEvent.click(
        screen.getByRole("button", { name: i === 9 ? "查看成绩" : "下一题" }),
      );
    }
    expect(screen.getByText("10 / 10")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "再来一轮" }));
    expect(screen.getByRole("button", { name: "开始仪表挑战" })).toBeTruthy();
  });
  it("shows retry for broken licensed images and preserves the attribution", () => {
    render(
      <LicensedPhoto
        media={{
          file: "/missing.jpg",
          source: "https://example.org/source",
          license: "CC BY 4.0",
          attribution: "Photographer",
        }}
        alt="测试照片"
      />,
    );
    fireEvent.error(screen.getByAltText("测试照片"));
    expect(screen.getByText("照片暂时无法加载")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "重试图片" }));
    expect(screen.getByAltText("测试照片")).toBeTruthy();
    expect(screen.getByText(/Photographer/)).toBeTruthy();
  });
  it("combines livery filters and resets an empty result", () => {
    render(<LiveryGallery />);
    fireEvent.change(screen.getByLabelText("航空公司"), {
      target: { value: "british-airways" },
    });
    expect(
      screen.getByText(
        `${liveries.filter((l) => l.airlineSlug === "british-airways").length} / ${liveries.length} 件视觉档案`,
      ),
    ).toBeTruthy();
    fireEvent.change(screen.getByLabelText("涂装分类"), {
      target: { value: "纪念涂装" },
    });
    expect(screen.getByText(/暂无符合筛选/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "重置筛选" }));
    expect(
      screen.getByText(`${liveries.length} / ${liveries.length} 件视觉档案`),
    ).toBeTruthy();
  });
  it("keeps airport list search and selection usable with an unavailable map", () => {
    render(<AirportBrowser />);
    expect(screen.getByText("地图服务不可用，保留列表")).toBeTruthy();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "HKG" },
    });
    expect(screen.getByRole("status").textContent).toContain(
      `1 / ${airports.length}`,
    );
    fireEvent.click(screen.getByRole("button", { name: "显示详情卡片" }));
    expect(
      screen.getByRole("link", { name: "查看机场档案 ↗" }).getAttribute("href"),
    ).toBe("/world/airports/hkg");
    fireEvent.click(screen.getByRole("button", { name: "关闭机场卡片" }));
    expect(screen.queryByRole("link", { name: "查看机场档案 ↗" })).toBeNull();
  });
  it("provides airport feedback and locks answers before moving on", () => {
    render(<AirportChallenge />);
    fireEvent.click(screen.getByRole("button", { name: "开始机场挑战" }));
    const options = document.querySelector(".answer-options")!;
    const first = within(options as HTMLElement).getAllByRole("button")[0];
    fireEvent.click(first);
    expect(first.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(/正确答案：/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "下一题" }));
    expect(screen.queryByText(/正确答案：/)).toBeNull();
    expect(screen.getByText(/2 \/ 5/)).toBeTruthy();
  });
});
