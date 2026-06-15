import { describe, expect, it } from 'vitest';
import { buildLearnerGraph } from './knowledgeGraph';
import { recommendMode, selectSmartQuestions } from './adaptive';

describe('adaptive engine', () => {
  it('recommends beginner mode for a brand-new learner', () => {
    const graph = buildLearnerGraph({}, {});
    expect(recommendMode(graph)).toBe('beginner');
  });

  it('beginner mode returns only unsolved questions, easiest first', () => {
    const graph = buildLearnerGraph({}, {});
    const queue = selectSmartQuestions('beginner', graph, {}, 5);
    expect(queue.length).toBeGreaterThan(0);
    // The first question should be the easiest available difficulty.
    expect(queue[0].q.difficulty).toBe('beginner');
  });

  it('interview mode only surfaces harder questions', () => {
    const graph = buildLearnerGraph({}, {});
    const queue = selectSmartQuestions('interview', graph, {}, 20);
    const rank: Record<string, number> = { beginner: 1, easy: 2, medium: 3, hard: 4, expert: 5 };
    expect(queue.every((i) => rank[i.q.difficulty] >= 3)).toBe(true);
  });

  it('respects solved status in beginner mode', () => {
    const graph = buildLearnerGraph({}, {});
    const all = selectSmartQuestions('beginner', graph, {}, 50);
    const first = all[0];
    const withSolved = selectSmartQuestions('beginner', graph, { [first.q.id]: true }, 50);
    expect(withSolved.find((i) => i.q.id === first.q.id)).toBeUndefined();
  });
});
