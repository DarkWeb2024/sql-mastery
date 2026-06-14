import { describe, expect, it } from 'vitest';
import { dayDiff, todayKey } from './storage';
import { levelFromXp } from '../features/progress/store';

describe('streak date helpers', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(todayKey(new Date('2026-06-14T09:30:00'))).toBe('2026-06-14');
  });

  it('computes consecutive-day differences', () => {
    expect(dayDiff('2026-06-13', '2026-06-14')).toBe(1);
    expect(dayDiff('2026-06-14', '2026-06-14')).toBe(0);
    expect(dayDiff('2026-06-10', '2026-06-14')).toBe(4);
  });
});

describe('levelFromXp', () => {
  it('starts at level 1 with no xp', () => {
    const { level, into } = levelFromXp(0);
    expect(level).toBe(1);
    expect(into).toBe(0);
  });

  it('advances a level once the first threshold is crossed', () => {
    expect(levelFromXp(100).level).toBe(2);
    expect(levelFromXp(99).level).toBe(1);
  });

  it('keeps remaining xp within the current span', () => {
    const { into, span } = levelFromXp(250);
    expect(into).toBeLessThan(span);
    expect(into).toBeGreaterThanOrEqual(0);
  });
});
