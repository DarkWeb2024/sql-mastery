import { describe, expect, it } from 'vitest';
import { computeConceptMastery, overallMasteryScore } from './mastery';

const today = '2026-06-14';

describe('computeConceptMastery', () => {
  it('is new with no attempts', () => {
    const m = computeConceptMastery({ questionIds: ['q1', 'q2'], attempts: {}, solved: {} }, today);
    expect(m.state).toBe('new');
    expect(m.raw).toBe(0);
  });

  it('is mastered when fully solved and recent', () => {
    const m = computeConceptMastery(
      {
        questionIds: ['q1', 'q2'],
        attempts: { q1: { attempts: 1, correct: 1, lastAt: today }, q2: { attempts: 1, correct: 1, lastAt: today } },
        solved: { q1: true, q2: true },
      },
      today
    );
    expect(m.effective).toBeGreaterThanOrEqual(0.8);
    expect(m.state).toBe('mastered');
  });

  it('becomes forgotten when a well-learned concept decays over time', () => {
    const m = computeConceptMastery(
      {
        questionIds: ['q1', 'q2'],
        attempts: { q1: { attempts: 1, correct: 1, lastAt: '2026-01-01' }, q2: { attempts: 1, correct: 1, lastAt: '2026-01-01' } },
        solved: { q1: true, q2: true },
      },
      today
    );
    expect(m.raw).toBeGreaterThanOrEqual(0.7);
    expect(m.effective).toBeLessThan(0.5);
    expect(m.state).toBe('forgotten');
  });

  it('is weak when accuracy and coverage are low', () => {
    const m = computeConceptMastery(
      {
        questionIds: ['q1', 'q2', 'q3', 'q4'],
        attempts: { q1: { attempts: 4, correct: 1, lastAt: today } },
        solved: { q1: true },
      },
      today
    );
    expect(m.state).toBe('weak');
  });
});

describe('overallMasteryScore', () => {
  it('ignores concepts that have not been started', () => {
    const score = overallMasteryScore([
      { raw: 0, effective: 0, coverage: 0, state: 'new', daysSincePractice: null },
      { raw: 1, effective: 1, coverage: 1, state: 'mastered', daysSincePractice: 0 },
    ]);
    expect(score).toBe(100);
  });
});
