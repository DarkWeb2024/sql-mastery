// Thin, typed wrappers around localStorage so the rest of the app never has to
// deal with JSON parsing or the storage API throwing in private-mode browsers.

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be full or disabled; progress simply will not persist.
  }
}

/** Returns the local date as YYYY-MM-DD, used for streak bookkeeping. */
export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Whole-day difference between two YYYY-MM-DD keys (b - a). */
export function dayDiff(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  const ms = db.getTime() - da.getTime();
  return Math.round(ms / 86_400_000);
}
