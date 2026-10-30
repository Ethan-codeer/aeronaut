"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Fade the new page without delaying navigation or remounting its contents. */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = container.current;
    if (!element || typeof element.animate !== "function" || document.hidden)
      return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    const animation = element.animate([{ opacity: 0.88 }, { opacity: 1 }], {
      duration: 240,
      easing: "cubic-bezier(0.2, 0.65, 0.3, 1)",
    });
    const reduceMotion = () => {
      if (preference.matches) animation.cancel();
    };
    preference.addEventListener("change", reduceMotion);
    return () => {
      preference.removeEventListener("change", reduceMotion);
      animation.cancel();
    };
  }, [pathname]);

  // No initial hidden state, route key, transform or animation-dependent controls.
  return (
    <div ref={container} data-page-transition>
      {children}
    </div>
  );
}
