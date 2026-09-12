// Safe localStorage helpers with schema versioning + corruption recovery.
// All student tool data stays in the browser (local-first). No server.

export const STORAGE_SCHEMA_VERSION = 1;

const PREFIX = 'gatefree.v1.';

export function storageGet<T>(key: string, fallback: T): T {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as { schemaVersion?: number; data?: T };
    if (parsed && typeof parsed === 'object' && 'data' in parsed) {
      return (parsed.data as T) ?? fallback;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function storageSet(key: string, data: unknown): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.setItem(PREFIX + key, JSON.stringify({ schemaVersion: STORAGE_SCHEMA_VERSION, data }));
    return true;
  } catch {
    return false;
  }
}

export function storageRemove(key: string): void {
  try { localStorage?.removeItem(PREFIX + key); } catch { /* ignore */ }
}

export interface ExportBundle {
  schemaVersion: number;
  exportedAt: string;
  planner?: unknown;
  attempts?: unknown;
  mistakes?: unknown;
  bookmarks?: unknown;
  revision?: unknown;
}

export function exportAll(keys: string[]): ExportBundle {
  const bundle: ExportBundle = { schemaVersion: STORAGE_SCHEMA_VERSION, exportedAt: new Date().toISOString() };
  const map: Record<string, keyof ExportBundle> = {
    planner: 'planner', attempts: 'attempts', mistakes: 'mistakes', bookmarks: 'bookmarks', revision: 'revision',
  };
  for (const k of keys) {
    const target = map[k];
    if (target) (bundle as unknown as Record<string, unknown>)[target] = storageGet(k, null);
  }
  return bundle;
}

export function importAll(bundle: ExportBundle): string[] {
  if (!bundle || bundle.schemaVersion !== STORAGE_SCHEMA_VERSION) {
    throw new Error('Unsupported backup version. Expected schema v1 JSON exported from this site.');
  }
  const restored: string[] = [];
  const entries: [string, unknown][] = [
    ['planner', bundle.planner], ['attempts', bundle.attempts], ['mistakes', bundle.mistakes],
    ['bookmarks', bundle.bookmarks], ['revision', bundle.revision],
  ];
  for (const [k, v] of entries) {
    if (v !== undefined && v !== null) { storageSet(k, v); restored.push(k); }
  }
  return restored;
}
