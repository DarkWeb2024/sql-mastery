import { allTopics } from '../content/topics';
import type { Topic } from '../types';
import { computeConceptMastery, type AttemptStat, type ConceptMastery } from './mastery';

// The knowledge graph turns the topics and their prerequisites into a structure
// the adaptive engine can reason over: which concepts are unlocked, which are
// the learner's weakest, and what they should study next.

export interface ConceptNode {
  id: string;
  title: string;
  category: string;
  prerequisites: string[];
  comingSoon: boolean;
}

export const concepts: ConceptNode[] = allTopics.map((t) => ({
  id: t.id,
  title: t.title,
  category: t.category,
  prerequisites: t.prerequisites,
  comingSoon: Boolean(t.comingSoon),
}));

const topicById = new Map<string, Topic>(allTopics.map((t) => [t.id, t]));

export interface LearnerGraph {
  mastery: Record<string, ConceptMastery>;
  /** Concepts whose prerequisites are sufficiently mastered to study now. */
  unlocked: string[];
}

const UNLOCK_THRESHOLD = 0.6;

export function buildLearnerGraph(
  attempts: Record<string, AttemptStat>,
  solved: Record<string, true>
): LearnerGraph {
  const mastery: Record<string, ConceptMastery> = {};

  for (const concept of concepts) {
    const topic = topicById.get(concept.id);
    const questionIds = topic ? topic.practice.map((q) => q.id) : [];
    mastery[concept.id] = computeConceptMastery({ questionIds, attempts, solved });
  }

  const unlocked = concepts
    .filter((c) => !c.comingSoon)
    .filter((c) => c.prerequisites.every((p) => (mastery[p]?.effective ?? 0) >= UNLOCK_THRESHOLD))
    .map((c) => c.id);

  return { mastery, unlocked };
}

// The single best concept to work on next: an unlocked concept that is not yet
// mastered, preferring forgotten ones (quick wins that restore decayed memory)
// and then the weakest. Returns null when everything available is mastered.
export function recommendConcept(graph: LearnerGraph): string | null {
  const candidates = graph.unlocked
    .map((id) => ({ id, m: graph.mastery[id] }))
    .filter(({ m }) => m.state !== 'mastered');

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    // Forgotten concepts first, then lowest effective mastery.
    const aForgot = a.m.state === 'forgotten' ? 0 : 1;
    const bForgot = b.m.state === 'forgotten' ? 0 : 1;
    if (aForgot !== bForgot) return aForgot - bForgot;
    return a.m.effective - b.m.effective;
  });

  return candidates[0].id;
}

export function weakConcepts(graph: LearnerGraph): ConceptNode[] {
  return concepts.filter(
    (c) => !c.comingSoon && ['weak', 'forgotten'].includes(graph.mastery[c.id]?.state)
  );
}
