import { describe, expect, it } from 'vitest';
import { isDue, newCard, schedule } from './srs';
import { todayKey } from './storage';

describe('spaced-repetition scheduler', () => {
  it('a new card is due immediately', () => {
    // newCard() is due today, so compare against the same notion of "today"
    // rather than a hardcoded date that drifts out of range over time.
    expect(isDue(newCard(), todayKey())).toBe(true);
  });

  it('a miss resets the streak and brings the card back the next day', () => {
    const card = schedule({ ease: 2.5, interval: 10, reps: 4, due: '2026-06-14' }, 'again', '2026-06-14');
    expect(card.reps).toBe(0);
    expect(card.interval).toBe(1);
    expect(card.due).toBe('2026-06-15');
  });

  it('successful reviews push the due date further out each time', () => {
    let card = newCard();
    card = schedule(card, 'good', '2026-06-14');
    const firstDue = card.due;
    card = schedule(card, 'good', firstDue);
    expect(card.reps).toBe(2);
    expect(card.due > firstDue).toBe(true);
  });

  it('easy grades raise the ease and hard grades lower it', () => {
    const easy = schedule(newCard(), 'easy', '2026-06-14');
    const hard = schedule(newCard(), 'hard', '2026-06-14');
    expect(easy.ease).toBeGreaterThan(hard.ease);
  });

  it('never lets the ease fall below the floor', () => {
    let card = { ease: 1.35, interval: 1, reps: 0, due: '2026-06-14' };
    for (let i = 0; i < 5; i += 1) card = schedule(card, 'again', card.due);
    expect(card.ease).toBeGreaterThanOrEqual(1.3);
  });
});
