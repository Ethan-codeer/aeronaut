// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PageTransition } from "@/components/page-transition";
const route = vi.hoisted(() => ({ pathname: "/atlas" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
const originalAnimate = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "animate",
);
const listeners = new Set<() => void>();
let reduced = false;
let cancel: ReturnType<typeof vi.fn>;
let animate: ReturnType<typeof vi.fn>;
beforeEach(() => {
  route.pathname = "/atlas";
  reduced = false;
  listeners.clear();
  cancel = vi.fn();
  animate = vi.fn(() => ({ cancel }));
  Object.defineProperty(HTMLElement.prototype, "animate", {
    configurable: true,
    value: animate,
  });
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: false,
  });
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      get matches() {
        return reduced;
      },
      addEventListener: (_: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    })),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  if (originalAnimate)
    Object.defineProperty(HTMLElement.prototype, "animate", originalAnimate);
  else Reflect.deleteProperty(HTMLElement.prototype, "animate");
  Reflect.deleteProperty(document, "hidden");
});
describe("quiet page transitions", () => {
  it("keeps child state and cancels previous animation when routes change", () => {
    const view = render(
      <PageTransition>
        <input aria-label="筛选" defaultValue="" />
      </PageTransition>,
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "A320" } });
    route.pathname = "/atlas/a320neo";
    view.rerender(
      <PageTransition>
        <input aria-label="筛选" defaultValue="" />
      </PageTransition>,
    );
    expect(screen.getByRole("textbox")).toBe(input);
    expect((input as HTMLInputElement).value).toBe("A320");
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(animate).toHaveBeenCalledTimes(2);
    view.unmount();
    expect(cancel).toHaveBeenCalledTimes(2);
    expect(listeners.size).toBe(0);
  });
  it("does not animate with reduced motion and never hides content", () => {
    reduced = true;
    const { container } = render(
      <PageTransition>
        <button>继续探索</button>
      </PageTransition>,
    );
    expect(animate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "继续探索" })).toBeTruthy();
    expect(
      container.querySelector("[data-page-transition]")?.getAttribute("style"),
    ).toBeNull();
  });
  it("immediately cancels motion when the system preference changes", () => {
    render(<PageTransition>飞机百科</PageTransition>);
    reduced = true;
    listeners.forEach((fn) => fn());
    expect(cancel).toHaveBeenCalledTimes(1);
  });
  it("works without the Web Animations API", () => {
    Reflect.deleteProperty(HTMLElement.prototype, "animate");
    render(
      <PageTransition>
        <button>继续探索</button>
      </PageTransition>,
    );
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(false);
  });
  it("does not start motion in a hidden tab", () => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    render(<PageTransition>飞机百科</PageTransition>);
    expect(animate).not.toHaveBeenCalled();
  });
});
