import { describe, expect, it } from 'vitest';
import { gradeRevisionCard, nextRevisionInterval, planStudy, scorePractice } from '../src/lib/study';
import { evaluate, summarize } from '../src/lib/exam';

describe('planStudy', () => {
  it('allocates days across subjects and exposes assumptions', () => {
    const out = planStudy({
      examDateISO: '2027-02-06',
      todayISO: '2026-09-12',
      hoursPerDay: 4,
      subjects: ['OS', 'DBMS', 'CN'],
      confidenceBySubject: { OS: 2, DBMS: 4, CN: 3 },
      daysOffPerWeek: 1,
    });
    expect(out.totalDays).toBeGreaterThan(100);
    expect(out.weeks.length).toBeGreaterThan(4);
    expect(out.assumptions.length).toBeGreaterThanOrEqual(3);
    // Weak subject OS should appear at least as often as strong DBMS in study days.
    const counts: Record<string, number> = {};
    for (const w of out.weeks) for (const d of w.days) {
      if (d.kind === 'study') counts[d.focusSubject] = (counts[d.focusSubject] ?? 0) + 1;
    }
    expect(counts['OS'] ?? 0).toBeGreaterThanOrEqual(counts['DBMS'] ?? 0);
  });

  it('rejects invalid input', () => {
    expect(() => planStudy({ examDateISO: '2027-02-06', todayISO: '2026-09-12', hoursPerDay: 0, subjects: ['OS'] })).toThrow();
    expect(() => planStudy({ examDateISO: '2027-02-06', todayISO: '2026-09-12', hoursPerDay: 4, subjects: [] })).toThrow();
    expect(() => planStudy({ examDateISO: '2026-09-13', todayISO: '2026-09-12', hoursPerDay: 4, subjects: ['OS'] })).toThrow();
  });
});

describe('revision', () => {
  it('grows intervals on recall, resets on forgot', () => {
    expect(nextRevisionInterval(1, 'forgot')).toBe(1);
    expect(nextRevisionInterval(2, 'easy')).toBeGreaterThan(nextRevisionInterval(2, 'hard'));
    const card = { id: 'c1', topic: 'T', state: 'learning' as const, intervalDays: 2, dueDate: '2026-09-12', streak: 1 };
    const forgot = gradeRevisionCard(card, 'forgot', '2026-09-12');
    expect(forgot.intervalDays).toBe(1);
    expect(forgot.state).toBe('weak');
    const easy = gradeRevisionCard({ ...card, streak: 4, intervalDays: 10 }, 'easy', '2026-09-12');
    expect(easy.state).toBe('stable');
  });
});

describe('scorePractice', () => {
  it('scores marks and accuracy', () => {
    const r = scorePractice([
      { questionId: 'a', correct: true, marks: 1 },
      { questionId: 'b', correct: false, marks: 2 },
    ]);
    expect(r.score).toBe(1);
    expect(r.max).toBe(3);
    expect(r.accuracy).toBeCloseTo(0.5);
  });
});

describe('evaluate (MCQ/MSQ/NAT)', () => {
  it('MCQ applies negative only on wrong', () => {
    const q = { id: 'x', questionType: 'MCQ' as const, answer: 'A', marks: 1, subject: 'S', topic: 't' };
    expect(evaluate(q, 'A').score).toBe(1);
    expect(evaluate(q, 'B').score).toBeCloseTo(-1 / 3, 2);
    expect(evaluate(q, '').score).toBe(0);
  });
  it('MSQ needs exact match, no negative', () => {
    const q = { id: 'y', questionType: 'MSQ' as const, answer: 'A', correctOptions: ['A', 'B'], marks: 2, subject: 'S', topic: 't' };
    expect(evaluate(q, ['A', 'B']).correct).toBe(true);
    expect(evaluate(q, ['A']).correct).toBe(false);
    expect(evaluate(q, ['A']).score).toBe(0);
  });
  it('NAT respects tolerance', () => {
    const q = { id: 'z', questionType: 'NAT' as const, answer: '2.4', tolerance: 0.05, marks: 1, subject: 'S', topic: 't' };
    expect(evaluate(q, '2.42').correct).toBe(true);
    expect(evaluate(q, '2.6').correct).toBe(false);
  });
  it('summarize finds weak topics', () => {
    const s = summarize([
      { id: 'a', correct: true, score: 1, max: 1, topic: 'x', subject: 'S' },
      { id: 'b', correct: false, score: 0, max: 1, topic: 'y', subject: 'S' },
      { id: 'c', correct: false, score: 0, max: 1, topic: 'y', subject: 'S' },
    ]);
    expect(s.weakTopics).toContain('y');
    expect(s.accuracy).toBeCloseTo(1 / 3);
  });
});
