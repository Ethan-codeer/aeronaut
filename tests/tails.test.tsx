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
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { Game } from "@/components/game";
import { airlineQuestions } from "@/data/airline-questions";
import { airlines } from "@/data/airlines";
const { update } = vi.hoisted(() => ({ update: vi.fn() }));
vi.mock("@/components/providers", () => ({
  useProgress: () => ({ ready: true, update }),
}));
vi.mock("next/link", () => ({
  default: ({
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const bank = airlineQuestions.filter((q) => q.type === "livery");
describe("tail identification bank and full round", () => {
  it("provides at least 20 distinct licensed photographs with valid answer and viewport bounds", () => {
    expect(bank.length).toBeGreaterThanOrEqual(20);
    expect(new Set(bank.map((q) => q.id)).size).toBe(bank.length);
    expect(
      new Set(
        bank.map((q) =>
          createHash("sha256")
            .update(readFileSync(`public${q.image}`))
            .digest("hex"),
        ),
      ).size,
    ).toBe(bank.length);
    for (const q of bank) {
      expect(q.options[q.answer]).toBe(
        airlines.find((a) => a.slug === q.airlineSlug)!.nameZh,
      );
      expect(q.image).toMatch(
        /^\/images\/challenges\/[ap]-[a-f0-9]+\.(jpg|webp)$/,
      );
      expect(existsSync(`public${q.image}`)).toBe(true);
      expect(q.imageSource).toMatch(/^https:/);
      expect(q.imageLicense).toBeTruthy();
      expect(q.imageAttribution).toBeTruthy();
      expect(q.imageReviewed).toBe(true);
      expect(q.imageAnswerLeakRisk).toBe("low");
      if (q.imageView) {
        const v = q.imageView;
        expect(v.x).toBeGreaterThanOrEqual(0);
        expect(v.y).toBeGreaterThanOrEqual(0);
        expect(v.width).toBeGreaterThan(0);
        expect(v.height).toBeGreaterThan(0);
        expect(v.x + v.width).toBeLessThanOrEqual(v.sourceWidth);
        expect(v.y + v.height).toBeLessThanOrEqual(v.sourceHeight);
      }
    }
  });
  it("plays 20 unique questions, withholds source links until answered and records a 20-question score once", () => {
    const { container } = render(<Game kind="airline" liveryOnly />);
    fireEvent.click(screen.getByRole("button", { name: /开始挑战 · 20 题/ }));
    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const image = container.querySelector(
        ".spotter-image image, .spotter-image img",
      )!;
      const path = image.getAttribute("href") || image.getAttribute("src")!;
      expect(seen.has(path)).toBe(false);
      seen.add(path);
      const q = bank.find((q) => q.image === path)!;
      if (q.imageView) {
        expect(image.getAttribute("clip-path")).toBe(
          `url(#question-crop-${q.id})`,
        );
        expect(
          container
            .querySelector(`#question-crop-${q.id} rect`)
            ?.getAttribute("width"),
        ).toBe(String(q.imageView.width));
      }
      expect(
        screen.queryByRole("link", { name: "照片与授权来源 ↗" }),
      ).toBeNull();
      const button = within(
        container.querySelector(".answer-options") as HTMLElement,
      ).getByRole("button", { name: new RegExp(q.options[q.answer]) });
      expect(button.hasAttribute("disabled")).toBe(true);
      fireEvent.load(image);
      fireEvent.click(button);
      expect(
        screen
          .getByRole("link", { name: "照片与授权来源 ↗" })
          .getAttribute("href"),
      ).toBe(q.imageSource);
      expect(button.hasAttribute("disabled")).toBe(true);
      fireEvent.click(
        screen.getByRole("button", { name: i === 19 ? "查看成绩" : "下一题" }),
      );
    }
    expect(seen.size).toBe(20);
    expect(screen.getByText(/本轮答对 20 \/ 20 题/)).toBeTruthy();
    expect(update).toHaveBeenCalledTimes(1);
    expect(update.mock.calls[0][0]({ results: [] }).results[0]).toMatchObject({
      kind: "airline",
      correct: 20,
      total: 20,
    });
  });
});
