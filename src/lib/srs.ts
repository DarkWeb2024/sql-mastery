import { todayKey } from './storage';

// A small spaced-repetition scheduler in the spirit of SM-2. A card tracks an
// ease factor, the current interval in days, and how many times it has been
// reviewed. Grades are coarse on purpose so the review UI stays simple.

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface CardSchedule {
  ease: number; // multiplier applied to the interval on success
  interval: number; // days until the next review
  reps: number; // number of successful reviews in a row
  due: string; // YYYY-MM-DD when the card is next due
}

export const newCard = (): CardSchedule => ({
  ease: 2.5,
  interval: 0,
  reps: 0,
  due: todayKey(),
});

function addDays(dateKey: string, days: number): string {
  const d = new Date(dateKey + 'T00:00:00');
  d.setDate(d.getDate() + Math.max(0, Math.round(days)));
  return todayKey(d);
}

export function schedule(prev: CardSchedule, grade: Grade, today = todayKey()): CardSchedule {
  // A miss resets the streak and brings the card back the next day.
  if (grade === 'again') {
    return { ease: Math.max(1.3, prev.ease - 0.2), interval: 1, reps: 0, due: addDays(today, 1) };
  }

  const easeDelta = grade === 'hard' ? -0.15 : grade === 'easy' ? 0.15 : 0;
  const ease = Math.max(1.3, prev.ease + easeDelta);
  const reps = prev.reps + 1;

  let interval: number;
  if (reps === 1) interval = grade === 'easy' ? 3 : 1;
  else if (reps === 2) interval = grade === 'easy' ? 7 : 4;
  else interval = Math.max(1, Math.round(prev.interval * ease * (grade === 'hard' ? 0.7 : 1)));

  return { ease, interval, reps, due: addDays(today, interval) };
}

export function isDue(card: CardSchedule, today = todayKey()): boolean {
  return card.due <= today;
}
