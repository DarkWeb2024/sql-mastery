import { useMemo } from 'react';
import { useProgress, levelFromXp } from '../progress/store';
import { buildLearnerGraph, weakConcepts } from '../../lib/knowledgeGraph';
import { concepts } from '../../lib/knowledgeGraph';
import type { LearnerProfile } from '../../lib/ai/types';

// Assembles the learner profile the mentor uses to personalise its answers, from
// the same progress data that drives the rest of the platform.
export function useMentorProfile(currentTopic?: string): LearnerProfile {
  const xp = useProgress((s) => s.xp);
  const attempts = useProgress((s) => s.attempts);
  const solved = useProgress((s) => s.solved);
  const goal = useProgress((s) => s.goal);

  return useMemo(() => {
    const graph = buildLearnerGraph(attempts, solved);
    const weak = weakConcepts(graph).map((c) => c.title);
    const mastered = concepts
      .filter((c) => graph.mastery[c.id]?.state === 'mastered')
      .map((c) => c.title);
    return {
      level: levelFromXp(xp).level,
      weakConcepts: weak,
      masteredConcepts: mastered,
      currentTopic,
      goal: goal || undefined,
    };
  }, [xp, attempts, solved, goal, currentTopic]);
}
