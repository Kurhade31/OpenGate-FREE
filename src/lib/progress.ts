// Unified local-first student store. All keys versioned; corrupted data ignored.
// Keys: gf-topics (completion), gf-important, gf-revision-topics, gf-notes,
// gf-bookmarks-q, gf-mistakes-v2, gf-activity, gf-streak, gf-targets, gf-sessions,
// gf-planner-custom, gf-mocks, gf-pomodoro
import { storageGet, storageSet } from './storage';

export const K = {
  topics: 'topics-v1',
  important: 'important-v1',
  revisionTopics: 'revision-topics-v1',
  notes: 'notes-v1',
  bookmarksQ: 'bookmarks-q-v1',
  mistakesV2: 'mistakes-v2',
  activity: 'activity-v1',
  streak: 'streak-v1',
  targets: 'targets-v1',
  sessions: 'sessions-v1',
  plannerCustom: 'planner-custom-v1',
  mocks: 'mocks-v1',
} as const;

export type TopicStatus = 'not-started' | 'in-progress' | 'completed';

export function getTopicStatus(id: string): TopicStatus {
  const m = storageGet<Record<string, TopicStatus>>('gf-' + K.topics, {});
  return m[id] ?? 'not-started';
}
export function setTopicStatus(id: string, s: TopicStatus): void {
  const m = storageGet<Record<string, TopicStatus>>('gf-' + K.topics, {});
  m[id] = s;
  storageSet('gf-' + K.topics, m);
  logActivity({ kind: 'topic', id, status: s });
}

export function toggleInSet(key: string, id: string): string[] {
  const arr = storageGet<string[]>('gf-' + key, []);
  const i = arr.indexOf(id);
  if (i >= 0) arr.splice(i, 1); else arr.push(id);
  storageSet('gf-' + key, arr);
  return arr;
}
export function inSet(key: string, id: string): boolean {
  return (storageGet<string[]>('gf-' + key, []) as string[]).includes(id);
}

export function getNote(id: string): string {
  return (storageGet<Record<string, string>>('gf-' + K.notes, {}) as Record<string, string>)[id] ?? '';
}
export function setNote(id: string, text: string): void {
  const m = storageGet<Record<string, string>>('gf-' + K.notes, {});
  m[id] = text;
  storageSet('gf-' + K.notes, m);
}

// --- Mistakes v2 ---
export interface MistakeV2 {
  id: string;
  questionId: string;
  question: string;
  subject: string;
  topic: string;
  kind: string;
  why: string;
  fix: string;
  note: string;
  difficulty: string;
  date: string;
  reviewed: boolean;
}
export function getMistakesV2(): MistakeV2[] {
  return storageGet<MistakeV2[]>('gf-' + K.mistakesV2, []);
}
export function addMistakeV2(m: Omit<MistakeV2, 'id' | 'date' | 'reviewed'> & { reviewed?: boolean }): MistakeV2 {
  const arr = getMistakesV2();
  const entry: MistakeV2 = {
    id: 'm' + Date.now().toString(36), date: new Date().toISOString().slice(0, 10), reviewed: false, ...m,
  };
  arr.unshift(entry);
  storageSet('gf-' + K.mistakesV2, arr.slice(0, 500));
  logActivity({ kind: 'mistake', id: entry.id });
  return entry;
}
export function updateMistakeV2(id: string, patch: Partial<MistakeV2>): void {
  const arr = getMistakesV2().map((x) => (x.id === id ? { ...x, ...patch } : x));
  storageSet('gf-' + K.mistakesV2, arr);
}
export function deleteMistakeV2(id: string): void {
  storageSet('gf-' + K.mistakesV2, getMistakesV2().filter((x) => x.id !== id));
}

// --- Activity + streak ---
export interface ActivityItem { at: string; kind: string; id?: string; status?: string; label?: string }
export function logActivity(a: Omit<ActivityItem, 'at'>): void {
  try {
    const arr = storageGet<ActivityItem[]>('gf-' + K.activity, []).slice(0, 200);
    arr.unshift({ ...a, at: new Date().toISOString() });
    storageSet('gf-' + K.activity, arr);
    // streak: count distinct UTC days with activity
    const days = new Set(arr.map((x) => (x.at ?? '').slice(0, 10)));
    storageSet('gf-' + K.streak, { days: [...days].slice(0, 60), count: days.size });
  } catch { /* ignore */ }
}
export function getActivity(): ActivityItem[] { return storageGet<ActivityItem[]>('gf-' + K.activity, []); }
export function getStreak(): { days: string[]; count: number } {
  return storageGet('gf-' + K.streak, { days: [], count: 0 });
}
