import { allTopics } from '../content/topics';
import type { TreeNode } from '../content/tree';
import { buildLearnerGraph } from './knowledgeGraph';
import type { AttemptStat } from './mastery';

// Derives the live state of every tree node from the mastery model: how complete
// and how mastered it is, and which of the seven node states it is in. Branch
// nodes roll up the built content beneath them so a section reflects real
// progress, not just whether it was opened.

export type NodeStatus =
  | 'planned' // no content yet
  | 'locked' // prerequisites not met
  | 'available' // ready to start
  | 'in-progress'
  | 'completed' // all questions solved
  | 'mastered' // solved and retained
  | 'needs-revision' // weak
  | 'forgotten'; // decayed from a high level

export interface NodeComputed {
  status: NodeStatus;
  completion: number; // 0..100
  mastery: number; // 0..100
  totalQuestions: number;
  solvedQuestions: number;
  hasContent: boolean;
}

const builtTopicIds = new Set(allTopics.filter((t) => !t.comingSoon).map((t) => t.id));
const topicTotals = new Map<string, number>(
  allTopics.map((t) => [t.id, t.practice.length])
);

function collectTopicIds(node: TreeNode, acc = new Set<string>()): Set<string> {
  if (node.topicId && builtTopicIds.has(node.topicId)) acc.add(node.topicId);
  node.children?.forEach((c) => collectTopicIds(c, acc));
  return acc;
}

export function computeTreeState(
  root: TreeNode,
  attempts: Record<string, AttemptStat>,
  solved: Record<string, true>
): Map<string, NodeComputed> {
  const graph = buildLearnerGraph(attempts, solved);
  const result = new Map<string, NodeComputed>();

  // Per-topic solved counts for rollups.
  const solvedByTopic = new Map<string, number>();
  for (const topic of allTopics) {
    if (topic.comingSoon) continue;
    solvedByTopic.set(topic.id, topic.practice.filter((q) => solved[q.id]).length);
  }

  // Pass 1: completion and mastery numbers for every node.
  function pass1(node: TreeNode): NodeComputed {
    const topicIds = [...collectTopicIds(node)];
    let total = 0;
    let solvedCount = 0;
    let masterySum = 0;
    let masteryWeight = 0;

    for (const id of topicIds) {
      const t = topicTotals.get(id) ?? 0;
      total += t;
      solvedCount += solvedByTopic.get(id) ?? 0;
      const m = graph.mastery[id];
      if (m) {
        masterySum += m.effective * t;
        masteryWeight += t;
      }
    }

    const hasContent = total > 0;
    const completion = hasContent ? Math.round((solvedCount / total) * 100) : 0;
    const mastery = masteryWeight > 0 ? Math.round((masterySum / masteryWeight) * 100) : 0;

    const computed: NodeComputed = {
      status: 'planned',
      completion,
      mastery,
      totalQuestions: total,
      solvedQuestions: solvedCount,
      hasContent,
    };
    result.set(node.id, computed);
    node.children?.forEach(pass1);
    return computed;
  }
  pass1(root);

  // Helper to read a topic's qualitative state for forgotten/weak signals.
  function nodeConceptStates(node: TreeNode): string[] {
    return [...collectTopicIds(node)].map((id) => graph.mastery[id]?.state).filter(Boolean) as string[];
  }

  // Pass 2: status, using prerequisite completion computed in pass 1.
  function pass2(node: TreeNode) {
    const computed = result.get(node.id)!;
    if (computed.hasContent) {
      const prereqs = node.prerequisites ?? [];
      const locked = prereqs.some((pid) => {
        const pre = result.get(pid);
        return pre && pre.hasContent && pre.completion === 0;
      });
      const states = nodeConceptStates(node);
      if (locked) computed.status = 'locked';
      else if (states.includes('forgotten')) computed.status = 'forgotten';
      else if (computed.mastery >= 80 && computed.completion >= 100) computed.status = 'mastered';
      else if (computed.completion >= 100) computed.status = 'completed';
      else if (states.includes('weak') && computed.completion > 0) computed.status = 'needs-revision';
      else if (computed.completion > 0 || computed.solvedQuestions > 0) computed.status = 'in-progress';
      else computed.status = 'available';
    } else {
      computed.status = 'planned';
    }
    node.children?.forEach(pass2);
  }
  pass2(root);

  return result;
}

export const STATUS_LABEL: Record<NodeStatus, string> = {
  planned: 'Coming soon',
  locked: 'Locked',
  available: 'Ready to start',
  'in-progress': 'In progress',
  completed: 'Completed',
  mastered: 'Mastered',
  'needs-revision': 'Needs revision',
  forgotten: 'Forgotten',
};
