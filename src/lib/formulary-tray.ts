import { useSyncExternalStore } from "react";

export interface TrayItem {
  formula_id: string;
  name: string;
  sanskrit?: string;
  type: string;
  dose: string;
  frequency: string; // e.g. BD, TDS
  duration: string;
  anupana: string;
  manufacturer?: string;
  manufacturer_pack?: string;
  manufacturer_mrp?: number;
  also_order?: boolean;
}

const KEY = "ayuzee.formulary.tray";
let items: TrayItem[] = load();
const listeners = new Set<() => void>();

function load(): TrayItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function persist() {
  localStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((l) => l());
}

export const trayStore = {
  get: () => items,
  add(item: TrayItem) {
    const idx = items.findIndex((i) => i.formula_id === item.formula_id);
    if (idx >= 0) items[idx] = item;
    else items = [...items, item];
    persist();
  },
  remove(formula_id: string) {
    items = items.filter((i) => i.formula_id !== formula_id);
    persist();
  },
  update(formula_id: string, patch: Partial<TrayItem>) {
    items = items.map((i) => (i.formula_id === formula_id ? { ...i, ...patch } : i));
    persist();
  },
  clear() { items = []; persist(); },
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
};

export function useTray(): TrayItem[] {
  return useSyncExternalStore(trayStore.subscribe, trayStore.get, trayStore.get);
}
