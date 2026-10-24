// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import Lab from "../../app/lab/page";
import { Footer } from "../../components/shell";
vi.mock("next/link", () => ({
  default: (
    props: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      prefetch?: boolean;
    },
  ) => {
    const forwarded = { ...props };
    delete forwarded.prefetch;
    return <a {...forwarded} />;
  },
}));
vi.mock("../../components/lift-lab", () => ({
  LiftLab: () => (
    <div role="region" aria-label="原有升力实验">
      LiftLab retained
    </div>
  ),
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/lab" }));
afterEach(cleanup);
describe("3D entry points preserve existing learning flows", () => {
  it("adds a 3D entry to Aero Lab while preserving the original lift lab and related tools", () => {
    render(<Lab />);
    expect(screen.getByRole("region", { name: "原有升力实验" })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "3D 飞机探索 ↗" }).getAttribute("href"),
    ).toBe("/lab/3d-explorer");
    for (const [name, path] of [
      ["互动飞机结构图 ↗", "/lab/anatomy"],
      ["互动仪表实验室 ↗", "/lab/instruments"],
      ["升力术语 ↗", "/dictionary/lift"],
    ])
      expect(screen.getByRole("link", { name }).getAttribute("href")).toBe(
        path,
      );
  });
  it("keeps every existing footer destination alongside the new 3D destination", () => {
    render(<Footer />);
    for (const [name, path] of [
      ["探索百科", "/atlas"],
      ["开始挑战", "/academy"],
      ["飞行科学", "/lab"],
      ["我的机库", "/hangar"],
      ["资料与署名", "/credits"],
      ["3D 飞机探索", "/lab/3d-explorer"],
    ])
      expect(screen.getByRole("link", { name }).getAttribute("href")).toBe(
        path,
      );
  });
});
