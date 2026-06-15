import { describe, expect, it } from 'vitest';
import { interviewReadiness, learningVelocity, retentionRate } from './analytics';
import type { ConceptMastery } from './mastery';

const cm = (raw: number, effective: number, state: ConceptMastery['state']): ConceptMastery => ({
  raw,
  effective,
  coverage: 1,
  state,
  daysSincePractice: 0,
});

describe('analytics', () => {
  it('retention is 100 with no started concepts', () => {
    expect(retentionRate([cm(0, 0, 'new')])).toBe(100);
  });

  it('retention reflects decay from raw to effective', () => {
    expect(retentionRate([cm(1, 0.5, 'forgotten')])).toBe(50);
  });

  it('interview readiness blends mastery with hard coverage', () => {
    const ready = interviewReadiness([cm(1, 1, 'mastered')], 0, 10);
    // Full mastery (0.6 weight) but no hard solved (0.4 weight) -> 60.
    expect(ready).toBe(60);
  });

  it('learning velocity counts recent solves only', () => {
    const activity = [
      { at: '2026-06-14T10:00:00.000Z', label: 'Solved a medium question' },
      { at: '2026-01-01T10:00:00.000Z', label: 'Solved a hard question' },
      { at: '2026-06-13T10:00:00.000Z', label: 'Reviewed a card' },
    ];
    expect(learningVelocity(activity, '2026-06-14')).toBe(1);
  });
});
