// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  within,
  cleanup,
} from "@testing-library/react";
import { Header } from "@/components/shell";
vi.mock("next/navigation", () => ({ usePathname: () => "/atlas/a320neo" }));
vi.mock("@/components/use-theme", () => ({
  useTheme: () => ({ dark: false, toggle: vi.fn() }),
}));
vi.mock("next/link", () => ({
  default: ({
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));
afterEach(cleanup);
describe("Hybrid five-destination navigation", () => {
  it("keeps five primary destinations, current section and independent dictionary/hangar access", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: "主要导航" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((a) => a.getAttribute("href")),
    ).toEqual(["/", "/atlas", "/academy", "/lab", "/world"]);
    expect(
      within(nav)
        .getByRole("link", { name: "飞机百科" })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(
      screen.getByRole("link", { name: "航空术语词典" }).getAttribute("href"),
    ).toBe("/dictionary");
    expect(
      screen.getByRole("link", { name: "我的机库" }).getAttribute("href"),
    ).toBe("/hangar");
  });
  it("closes the disclosure on Escape and returns focus to its button", () => {
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: "展开导航" }));
    const close = screen.getByRole("button", { name: "收起导航" });
    expect(close.getAttribute("aria-expanded")).toBe("true");
    const link = within(screen.getByRole("navigation")).getByRole("link", {
      name: "飞机百科",
    });
    link.focus();
    fireEvent.keyDown(link, { key: "Escape" });
    const open = screen.getByRole("button", { name: "展开导航" });
    expect(open.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(open);
  });
});
