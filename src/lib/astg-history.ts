// Local-first recently-viewed + offline cache helpers for ASTG protocols.
const HISTORY_KEY = "astg:recent";
const CACHE_KEY = "astg:cache";
const MAX_HISTORY = 5;
const MAX_CACHE = 10;

export type RecentEntry = {
  categoryKey: string;
  diseaseKey: string;
  name: string;
  modern: string;
  viewedAt: number;
};

export function getRecent(): RecentEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}

export function pushRecent(e: Omit<RecentEntry, "viewedAt">) {
  const list = getRecent().filter(r => r.diseaseKey !== e.diseaseKey);
  list.unshift({ ...e, viewedAt: Date.now() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)));
}

export function cacheProtocol(key: string, payload: unknown) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}") as Record<string, { at: number; payload: unknown }>;
    cache[key] = { at: Date.now(), payload };
    const entries = Object.entries(cache).sort((a, b) => b[1].at - a[1].at).slice(0, MAX_CACHE);
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch { /* ignore quota */ }
}

export function getCachedProtocol<T = unknown>(key: string): T | null {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    return cache[key]?.payload ?? null;
  } catch { return null; }
}
