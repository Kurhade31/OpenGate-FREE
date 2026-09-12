// Exam evaluation: MCQ / MSQ / NAT with GATE-style negative marking.
// MCQ: 1-mark wrong → -1/3, 2-mark wrong → -2/3. MSQ/NAT: no negative.
export interface EvalQ {
  id: string;
  questionType: 'MCQ' | 'MSQ' | 'NAT';
  options?: string[];
  answer: string;
  correctOptions?: string[];
  tolerance?: number;
  marks: number;
  negativeMarks?: number;
  subject: string;
  topic: string;
}

export type UserAnswer = string | string[] | number | null | undefined;

function norm(s: string): string { return s.trim().toLowerCase().replace(/\s+/g, ' '); }

export function defaultNegative(q: EvalQ): number {
  if (q.questionType !== 'MCQ') return 0;
  if (typeof q.negativeMarks === 'number') return q.negativeMarks;
  return q.marks === 2 ? 2 / 3 : 1 / 3;
}

export function evaluate(q: EvalQ, user: UserAnswer): { correct: boolean; score: number; max: number } {
  const max = q.marks;
  if (user === null || user === undefined || user === '' || (Array.isArray(user) && !user.length)) {
    return { correct: false, score: 0, max };
  }
  if (q.questionType === 'MCQ') {
    const ok = norm(String(user)) === norm(q.answer) ||
      (q.options ?? []).some((o) => norm(o) === norm(String(user)) && norm(o) === norm(q.answer));
    // Also accept option text matching answer text loosely:
    const ok2 = ok || norm(String(user)) === norm(q.answer);
    return ok2 ? { correct: true, score: max, max } : { correct: false, score: -Math.round(defaultNegative(q) * 100) / 100, max };
  }
  if (q.questionType === 'MSQ') {
    const expected = new Set((q.correctOptions ?? [q.answer]).map(norm));
    const got = new Set((Array.isArray(user) ? user : [String(user)]).map((x) => norm(String(x))));
    const correct = expected.size === got.size && [...expected].every((x) => got.has(x));
    return correct ? { correct: true, score: max, max } : { correct: false, score: 0, max };
  }
  // NAT
  const tol = q.tolerance ?? 0;
  const a = Number(String(user).trim());
  const b = Number(String(q.answer).trim());
  if (!Number.isFinite(a) || !Number.isFinite(b)) return { correct: false, score: 0, max };
  return Math.abs(a - b) <= tol + 1e-9 ? { correct: true, score: max, max } : { correct: false, score: 0, max };
}

export interface AttemptRec { id: string; correct: boolean; score: number; max: number; topic: string; subject: string; secs?: number }

export function summarize(attempts: AttemptRec[]): {
  score: number; max: number; accuracy: number; attempted: number; correct: number; incorrect: number;
  byTopic: Record<string, { n: number; ok: number; score: number }>; weakTopics: string[];
} {
  let score = 0, max = 0, correct = 0;
  const byTopic: Record<string, { n: number; ok: number; score: number }> = {};
  for (const a of attempts) {
    score += a.score; max += a.max;
    if (a.correct) correct++;
    const t = a.topic || 'general';
    if (!byTopic[t]) byTopic[t] = { n: 0, ok: 0, score: 0 };
    byTopic[t]!.n++; if (a.correct) byTopic[t]!.ok++; byTopic[t]!.score += a.score;
  }
  score = Math.round(score * 100) / 100;
  const weakTopics = Object.entries(byTopic)
    .filter(([, v]) => v.n > 0 && v.ok / v.n < 0.6)
    .sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n)
    .map(([k]) => k);
  return {
    score, max,
    accuracy: attempts.length ? correct / attempts.length : 0,
    attempted: attempts.length, correct, incorrect: attempts.length - correct,
    byTopic, weakTopics,
  };
}
