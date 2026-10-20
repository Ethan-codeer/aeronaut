"use client";
import { createContext, useContext, useSyncExternalStore } from "react";
import { MotionConfig } from "motion/react";
import type { Progress } from "@/lib/progress";
import {
  getProgressSnapshot,
  getServerProgressSnapshot,
  subscribeProgress,
  updateProgress,
  importProgress,
} from "@/lib/progress-store";
interface Store {
  progress: Progress;
  ready: boolean;
  error: string;
  update: (fn: (p: Progress) => Progress) => void;
  importData: (raw: string) => void;
}
const Context = createContext<Store | null>(null);
export function Providers({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getServerProgressSnapshot,
  );
  return (
    <MotionConfig reducedMotion="user">
      <Context.Provider
        value={{ ...state, update: updateProgress, importData: importProgress }}
      >
        {children}
      </Context.Provider>
    </MotionConfig>
  );
}
export function useProgress() {
  const value = useContext(Context);
  if (!value) throw Error("Missing progress provider");
  return value;
}
