import { dayDiff, todayKey } from './storage';

// The mastery model is the heart of the adaptive engine. For each concept it
// estimates how well the learner knows it right now, accounting for both their
// track record and forgetting over time. Everything here is pure and
// deterministic so it is fully testable and never depends on a network call.

export type ConceptState = 'new' | 'learning' | 'weak' | 'mastered' | 'forgotten';

export interface AttemptStat {
  attempts: number;
  correct: number;
  /** Most recent attempt date (YYYY-MM-DD), used for forgetting decay. */
  lastAt?: string;
}

export interface ConceptMastery {
  /** What the learner has demonstrated, ignoring time (0..1). */
  raw: number;
  /** Raw mastery after applying the forgetting curve (0..1). */
  effective: number;
  /** Fraction of the concept's questions solved at least once (0..1). */
  coverage: number;
  state: ConceptState;
  daysSincePractice: number | null;
}

// Strong learning resists forgetting: the better something was learned, the
// longer its half-life. This mirrors how durable, well-practised memories decay
// far more slowly than freshly crammed ones.
function halfLifeDays(raw: number): number {
  return 3 + raw * raw * 40; // ~3 days when shaky, ~43 days when solid
}

function applyDecay(raw: number, daysSince: number | null): number {
  if (daysSince === null || daysSince <= 0) return raw;
  const hl = halfLifeDays(raw);
  return raw * Math.pow(0.5, daysSince / hl);
}

export interface ConceptInput {
  questionIds: string[];
  attempts: Record<string, AttemptStat>;
  solved: Record<string, true>;
}

export function computeConceptMastery(input: ConceptInput, today = todayKey()): ConceptMastery {
  const { questionIds, attempts, solved } = input;
  const total = questionIds.length;

  let attemptCount = 0;
  let correctCount = 0;
  let solvedCount = 0;
  let lastAt: string | null = null;

  for (const id of questionIds) {
    const stat = attempts[id];
    if (stat) {
      attemptCount += stat.attempts;
      correctCount += stat.correct;
      if (stat.lastAt && (!lastAt || stat.lastAt > lastAt)) lastAt = stat.lastAt;
    }
    if (solved[id]) solvedCount += 1;
  }

  const coverage = total === 0 ? 0 : solvedCount / total;

  if (attemptCount === 0) {
    return { raw: 0, effective: 0, coverage: 0, state: 'new', daysSincePractice: null };
  }

  // Raw mastery blends how accurate the learner is with how much of the concept
  // they have actually covered, so acing one of ten questions is not "mastered".
  const accuracy = correctCount / attemptCount;
  const raw = Math.min(1, accuracy * 0.6 + coverage * 0.4);

  const daysSince = lastAt ? Math.max(0, dayDiff(lastAt, today)) : null;
  const effective = applyDecay(raw, daysSince);

  return { raw, effective, coverage, state: classify(raw, effective), daysSincePractice: daysSince };
}

function classify(raw: number, effective: number): ConceptState {
  if (raw >= 0.7 && effective < 0.5) return 'forgotten';
  if (effective >= 0.8) return 'mastered';
  if (effective < 0.5) return 'weak';
  return 'learning';
}

// A single 0..100 headline number for the dashboard: the average effective
// mastery across concepts that have been started, so it reflects real progress
// rather than being diluted by untouched topics.
export function overallMasteryScore(masteries: ConceptMastery[]): number {
  const started = masteries.filter((m) => m.state !== 'new');
  if (started.length === 0) return 0;
  const sum = started.reduce((n, m) => n + m.effective, 0);
  return Math.round((sum / started.length) * 100);
}
