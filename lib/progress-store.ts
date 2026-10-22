import {
  emptyProgress,
  parseProgress,
  Progress,
  STORAGE_KEY,
} from "./progress";
interface Snapshot {
  progress: Progress;
  ready: boolean;
  error: string;
}
const serverSnapshot: Snapshot = {
  progress: emptyProgress,
  ready: false,
  error: "",
};
let snapshot = serverSnapshot;
let initialized = false;
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((listener) => listener());
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const progress = raw ? parseProgress(raw) : emptyProgress;
    snapshot = { progress, ready: true, error: "" };
    // Migrate only our own record. No other localStorage keys are touched.
    if (raw && JSON.stringify(progress) !== raw) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch {
        snapshot.error = "旧进度已在内存迁移；浏览器无法保存，请导出备份。";
      }
    }
  } catch {
    snapshot = {
      ...snapshot,
      ready: true,
      error: "本地记录暂时无法读取。当前会话仍可使用，请导出数据备份。",
    };
  }
  emit();
}
function onStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY || event.key === null) load();
}
export function subscribeProgress(listener: () => void) {
  listeners.add(listener);
  if (!initialized) {
    initialized = true;
    load();
  }
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}
export function getProgressSnapshot() {
  return snapshot;
}
export function getServerProgressSnapshot() {
  return serverSnapshot;
}
export function updateProgress(fn: (p: Progress) => Progress) {
  const progress = fn(snapshot.progress);
  if (progress === snapshot.progress) return;
  let error = snapshot.error;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    error = "";
  } catch {
    error = "浏览器无法保存记录，请在机库导出本次进度。";
  }
  snapshot = { progress, ready: true, error };
  emit();
}
export function importProgress(raw: string) {
  const parsed = parseProgress(raw);
  updateProgress(() => parsed);
}
