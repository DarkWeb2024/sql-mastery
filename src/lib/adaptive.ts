import { allTopics } from '../content/topics';
import type { Difficulty, PracticeQuestion } from '../types';
import type { LearnerGraph } from './knowledgeGraph';

// The adaptive engine decides what the learner should practise next. It turns
// the mastery graph plus a chosen learning mode into an ordered, interleaved set
// of questions. The learning-science principles (retrieval, spacing,
// interleaving, desirable difficulty, progressive overload) live here, applied
// quietly rather than named in the UI.

export type LearningMode =
  | 'beginner'
  | 'fast'
  | 'interview'
  | 'project'
  | 'revision'
  | 'challenge';

export interface PooledQuestion {
  q: PracticeQuestion;
  topicId: string;
  topicTitle: string;
}

const RANK: Record<Difficulty, number> = {
  beginner: 1,
  easy: 2,
  medium: 3,
  hard: 4,
  expert: 5,
};

export const MODES: { id: LearningMode; title: string; blurb: string }[] = [
  { id: 'beginner', title: 'Beginner', blurb: 'Gentle, one concept at a time, easy first.' },
  { id: 'fast', title: 'Fast track', blurb: 'Skip the basics, move quickly through what you can unlock.' },
  { id: 'interview', title: 'Interview', blurb: 'Harder, interleaved questions like a real interview.' },
  { id: 'project', title: 'Project', blurb: 'Applied, multi-table questions that mimic real work.' },
  { id: 'revision', title: 'Revision', blurb: 'Bring back weak and forgotten concepts.' },
  { id: 'challenge', title: 'Challenge', blurb: 'The hardest unsolved questions, no hand-holding.' },
];

function pool(unlockedOnly: string[] | null): PooledQuestion[] {
  const out: PooledQuestion[] = [];
  for (const topic of allTopics) {
    if (topic.comingSoon) continue;
    if (unlockedOnly && !unlockedOnly.includes(topic.id)) continue;
    for (const q of topic.practice) {
      out.push({ q, topicId: topic.id, topicTitle: topic.title });
    }
  }
  return out;
}

// Interleave questions so consecutive items come from different concepts, which
// strengthens discrimination between concepts far better than blocking.
function interleave(items: PooledQuestion[]): PooledQuestion[] {
  const byTopic = new Map<string, PooledQuestion[]>();
  for (const item of items) {
    const list = byTopic.get(item.topicId) ?? [];
    list.push(item);
    byTopic.set(item.topicId, list);
  }
  const queues = [...byTopic.values()];
  const result: PooledQuestion[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const queue of queues) {
      const next = queue.shift();
      if (next) {
        result.push(next);
        added = true;
      }
    }
  }
  return result;
}

export function recommendMode(graph: LearnerGraph): LearningMode {
  const states = Object.values(graph.mastery);
  const started = states.filter((m) => m.state !== 'new');
  if (started.length === 0) return 'beginner';
  if (states.some((m) => m.state === 'forgotten')) return 'revision';
  const masteredShare = states.filter((m) => m.state === 'mastered').length / states.length;
  if (masteredShare > 0.6) return 'interview';
  return 'fast';
}

export function selectSmartQuestions(
  mode: LearningMode,
  graph: LearnerGraph,
  solved: Record<string, true>,
  limit = 10
): PooledQuestion[] {
  const unlocked = graph.unlocked;
  const unsolved = (item: PooledQuestion) => !solved[item.q.id];

  switch (mode) {
    case 'beginner': {
      // Easiest-first within unlocked concepts, ordered by concept then rank.
      const items = pool(unlocked)
        .filter(unsolved)
        .sort((a, b) => RANK[a.q.difficulty] - RANK[b.q.difficulty]);
      return items.slice(0, limit);
    }
    case 'fast': {
      // Desirable difficulty: skip the very easiest, interleave the rest.
      const items = interleave(
        pool(unlocked).filter((i) => unsolved(i) && RANK[i.q.difficulty] >= 2)
      );
      return items.slice(0, limit);
    }
    case 'interview': {
      const items = interleave(
        pool(unlocked).filter((i) => RANK[i.q.difficulty] >= 3)
      );
      return items.slice(0, limit);
    }
    case 'project': {
      // Application-heavy: prefer joins and aggregation, harder questions.
      const items = interleave(
        pool(unlocked).filter(
          (i) => ['joins', 'aggregation'].includes(i.topicId) && RANK[i.q.difficulty] >= 3
        )
      );
      return (items.length > 0 ? items : interleave(pool(unlocked).filter(unsolved))).slice(0, limit);
    }
    case 'revision': {
      // Retrieval of weak and forgotten concepts, regardless of solved status.
      const weakIds = new Set(
        Object.entries(graph.mastery)
          .filter(([, m]) => ['weak', 'forgotten'].includes(m.state))
          .map(([id]) => id)
      );
      const items = interleave(pool(unlocked).filter((i) => weakIds.has(i.topicId)));
      return items.slice(0, limit);
    }
    case 'challenge': {
      const items = interleave(
        pool(unlocked)
          .filter(unsolved)
          .filter((i) => RANK[i.q.difficulty] >= 4)
      );
      return (items.length > 0 ? items : interleave(pool(unlocked).filter(unsolved))).slice(0, limit);
    }
    default:
      return pool(unlocked).filter(unsolved).slice(0, limit);
  }
}
