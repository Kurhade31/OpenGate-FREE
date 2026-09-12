// Pure, testable logic for study planning, revision scheduling, and practice scoring.
// No DOM access here — UI layers import these functions.

export interface PlannerInput {
  examDateISO: string; // YYYY-MM-DD
  todayISO?: string; // YYYY-MM-DD (defaults to today UTC)
  hoursPerDay: number; // 1..12
  subjects: string[]; // subject names/ids
  confidenceBySubject?: Record<string, 1 | 2 | 3 | 4 | 5>; // 1=weak .. 5=strong
  daysOffPerWeek?: number; // 0..3
}

export interface PlannerDay {
  date: string; // YYYY-MM-DD
  focusSubject: string;
  studyMinutes: number;
  practiceMinutes: number;
  revisionMinutes: number;
  kind: 'study' | 'revision' | 'mock' | 'buffer';
}

export interface PlannerOutput {
  totalDays: number;
  studyDays: number;
  hoursTotal: number;
  assumptions: string[];
  weeks: { week: number; days: PlannerDay[] }[];
}

function toUTCDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}
function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function planStudy(input: PlannerInput): PlannerOutput {
  if (!input.subjects.length) throw new Error('Select at least one subject.');
  if (!(input.hoursPerDay >= 1 && input.hoursPerDay <= 12)) {
    throw new Error('hoursPerDay must be between 1 and 12.');
  }
  const today = toUTCDate(input.todayISO ?? new Date().toISOString().slice(0, 10));
  const exam = toUTCDate(input.examDateISO);
  const totalDays = Math.round((exam.getTime() - today.getTime()) / 86400000);
  if (!Number.isFinite(totalDays) || totalDays < 7) {
    throw new Error('Exam date must be at least 7 days after the start date.');
  }

  const daysOffPerWeek = Math.min(3, Math.max(0, input.daysOffPerWeek ?? 1));
  // Weight weak subjects more (inverse confidence). Default confidence 3.
  const weights = input.subjects.map((s) => {
    const c = input.confidenceBySubject?.[s] ?? 3;
    return { subject: s, weight: 6 - c }; // 1..5
  });
  const weightSum = weights.reduce((a, b) => a + b.weight, 0);

  const days: PlannerDay[] = [];
  let studyCursor = 0;
  // Precompute a round-robin weighted order.
  const order: string[] = [];
  const totalSlots = totalDays;
  for (let i = 0; i < totalSlots; i++) {
    // pick subject proportional to weight using largest-remainder style rotation
    const target = (i * weightSum) / totalSlots;
    let acc = 0;
    let picked = weights[0]?.subject ?? input.subjects[0] ?? 'General';
    for (const w of weights) {
      acc += w.weight;
      if (target < acc) { picked = w.subject; break; }
    }
    order.push(picked);
  }

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(today.getTime() + i * 86400000);
    const dow = d.getUTCDay(); // 0 Sun
    const isOff = daysOffPerWeek > 0 && dow % 7 < daysOffPerWeek && i < totalDays - 14;
    const date = toISODate(d);
    const daysLeft = totalDays - i;
    const baseMinutes = Math.round(input.hoursPerDay * 60);
    if (isOff) {
      days.push({ date, focusSubject: 'Rest / light revision', studyMinutes: 0, practiceMinutes: 20, revisionMinutes: 10, kind: 'buffer' });
      continue;
    }
    let kind: PlannerDay['kind'] = 'study';
    if (daysLeft <= 14 && i % 3 === 2) kind = 'mock';
    else if (daysLeft <= 28 && i % 4 === 3) kind = 'revision';
    else if (i % 7 === 6) kind = 'revision';

    const focusSubject = order[studyCursor % order.length] ?? 'General';
    studyCursor += kind === 'study' ? 1 : 0;

    const studyMinutes = kind === 'mock' ? Math.round(baseMinutes * 0.2) : kind === 'revision' ? Math.round(baseMinutes * 0.35) : Math.round(baseMinutes * 0.55);
    const practiceMinutes = kind === 'mock' ? Math.round(baseMinutes * 0.65) : Math.round(baseMinutes * 0.3);
    const revisionMinutes = Math.max(0, baseMinutes - studyMinutes - practiceMinutes);
    days.push({ date, focusSubject, studyMinutes, practiceMinutes, revisionMinutes, kind });
  }

  const studyDays = days.filter((d) => d.kind !== 'buffer').length;
  const hoursTotal = Math.round((days.reduce((a, d) => a + d.studyMinutes + d.practiceMinutes + d.revisionMinutes, 0) / 60) * 10) / 10;

  const weeks: PlannerOutput['weeks'] = [];
  days.forEach((day, idx) => {
    const w = Math.floor(idx / 7);
    if (!weeks[w]) weeks[w] = { week: w + 1, days: [] };
    weeks[w]!.days.push(day);
  });

  return {
    totalDays,
    studyDays,
    hoursTotal,
    assumptions: [
      'Weak subjects (lower confidence) get proportionally more days.',
      'Last 4 weeks shift toward revision; last 2 weeks include regular mocks.',
      'Weekly off-days are light-revision days, skipped in the final 2 weeks.',
      'This is a starting allocation, not a prediction of marks or rank.',
    ],
    weeks,
  };
}

// --- Revision (simplified SM-2-like intervals) ---

export type RecallGrade = 'forgot' | 'hard' | 'okay' | 'easy';
export type CardState = 'new' | 'learning' | 'needs-review' | 'weak' | 'stable' | 'overdue';

export interface RevisionCard {
  id: string;
  topic: string;
  state: CardState;
  intervalDays: number;
  dueDate: string; // YYYY-MM-DD
  streak: number;
}

export function nextRevisionInterval(currentIntervalDays: number, grade: RecallGrade): number {
  switch (grade) {
    case 'forgot': return 1;
    case 'hard': return Math.max(1, Math.round(currentIntervalDays * 1.2));
    case 'okay': return Math.max(2, Math.round((currentIntervalDays || 1) * 2.2));
    case 'easy': return Math.max(4, Math.round((currentIntervalDays || 1) * 3.5));
  }
}

export function gradeRevisionCard(card: RevisionCard, grade: RecallGrade, todayISO: string): RevisionCard {
  const interval = grade === 'forgot' ? 1 : nextRevisionInterval(card.intervalDays || 1, grade);
  const next = new Date(toUTCDate(todayISO).getTime() + interval * 86400000);
  const streak = grade === 'forgot' ? 0 : card.streak + 1;
  const state: CardState =
    grade === 'forgot' ? 'weak' : streak >= 4 && interval >= 14 ? 'stable' : streak >= 2 ? 'learning' : 'needs-review';
  return { ...card, intervalDays: interval, dueDate: toISODate(next), streak, state };
}

// --- Practice scoring ---

export interface ScoredAttempt {
  questionId: string;
  correct: boolean;
  marks: number;
  timeSeconds?: number;
}

export function scorePractice(attempts: ScoredAttempt[], negativePerMark = 0): { score: number; max: number; accuracy: number; answered: number } {
  let score = 0, max = 0, correct = 0;
  for (const a of attempts) {
    max += a.marks;
    if (a.correct) { score += a.marks; correct += 1; }
    else if (negativePerMark > 0) { score -= a.marks * negativePerMark; }
  }
  const answered = attempts.length;
  return { score: Math.round(score * 100) / 100, max, accuracy: answered ? correct / answered : 0, answered };
}

export type MistakeKind =
  | 'concept-gap' | 'formula-error' | 'calculation-error' | 'misread'
  | 'method-error' | 'careless' | 'time-pressure' | 'guessing'
  | 'memory-failure' | 'prerequisite-gap';

export const MISTAKE_KINDS: { id: MistakeKind; label: string }[] = [
  { id: 'concept-gap', label: 'Concept gap' },
  { id: 'formula-error', label: 'Formula error' },
  { id: 'calculation-error', label: 'Calculation error' },
  { id: 'misread', label: 'Question misread' },
  { id: 'method-error', label: 'Method selection error' },
  { id: 'careless', label: 'Careless error' },
  { id: 'time-pressure', label: 'Time pressure' },
  { id: 'guessing', label: 'Guessing' },
  { id: 'memory-failure', label: 'Memory failure' },
  { id: 'prerequisite-gap', label: 'Prerequisite gap' },
];
