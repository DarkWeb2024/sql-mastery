import { dayDiff, todayKey } from './storage';
import type { ConceptMastery } from './mastery';
import type { ActivityItem } from '../features/progress/store';

// Meaningful, non-vanity learning metrics derived from the mastery model and
// activity history. Each returns a plain number so the dashboard can present it
// without re-deriving anything.

// How retained the learner's knowledge is: the average ratio of effective (after
// forgetting) to raw mastery across concepts they have started. 100 means
// nothing has decayed; lower means revision is overdue.
export function retentionRate(masteries: ConceptMastery[]): number {
  const started = masteries.filter((m) => m.state !== 'new' && m.raw > 0);
  if (started.length === 0) return 100;
  const sum = started.reduce((n, m) => n + m.effective / m.raw, 0);
  return Math.round((sum / started.length) * 100);
}

// Interview readiness blends overall effective mastery with how much hard
// material has actually been demonstrated, so confidence on easy questions alone
// does not inflate it.
export function interviewReadiness(
  masteries: ConceptMastery[],
  hardSolved: number,
  hardTotal: number
): number {
  const started = masteries.filter((m) => m.state !== 'new');
  const masteryPart =
    started.length === 0 ? 0 : started.reduce((n, m) => n + m.effective, 0) / started.length;
  const hardPart = hardTotal === 0 ? 0 : hardSolved / hardTotal;
  return Math.round((masteryPart * 0.6 + hardPart * 0.4) * 100);
}

// Learning velocity: solves in the last 7 days, a simple momentum signal pulled
// from the recent-activity log.
export function learningVelocity(activity: ActivityItem[], today = todayKey()): number {
  return activity.filter((a) => {
    const day = a.at.slice(0, 10);
    return /solved/i.test(a.label) && dayDiff(day, today) <= 7 && dayDiff(day, today) >= 0;
  }).length;
}
