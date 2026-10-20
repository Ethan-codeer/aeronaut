"use client";
import { useSyncExternalStore } from "react";
let dark = false;
let initialized = false;
const listeners = new Set<() => void>();
function publish() {
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  listeners.forEach((fn) => fn());
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  if (!initialized) {
    initialized = true;
    try {
      dark = localStorage.getItem("aeronaut-theme") === "dark";
    } catch {}
    publish();
  }
  return () => {
    listeners.delete(fn);
  };
}
function getSnapshot() {
  return dark;
}
function getServerSnapshot() {
  return false;
}
export function useTheme() {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    dark: value,
    toggle: () => {
      dark = !dark;
      try {
        localStorage.setItem("aeronaut-theme", dark ? "dark" : "light");
      } catch {}
      publish();
    },
  };
}
