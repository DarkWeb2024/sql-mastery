import { describe, expect, it } from 'vitest';
import { sqlTree } from '../content/tree';
import { allTopics } from '../content/topics';
import { computeTreeState } from './treeState';

function findNode(id: string) {
  const stack = [sqlTree.root];
  while (stack.length) {
    const n = stack.pop()!;
    if (n.id === id) return n;
    n.children?.forEach((c) => stack.push(c));
  }
  return undefined;
}

describe('computeTreeState', () => {
  it('marks content-backed nodes available and unbuilt nodes planned for a new learner', () => {
    const states = computeTreeState(sqlTree.root, {}, {});
    expect(states.get('select')?.status).toBe('available');
    expect(states.get('select')?.hasContent).toBe(true);
    // Window functions now have content but are gated behind prerequisites.
    expect(states.get('window')?.hasContent).toBe(true);
    expect(states.get('window')?.status).toBe('locked');
    // Indexes has no practice content yet, so it stays planned.
    expect(states.get('indexes')?.status).toBe('planned');
  });

  it('rolls completion up to the SELECT node when its topic is solved', () => {
    const basics = allTopics.find((t) => t.id === 'basics')!;
    const solved: Record<string, true> = {};
    const attempts: Record<string, { attempts: number; correct: number; lastAt?: string }> = {};
    for (const q of basics.practice) {
      solved[q.id] = true;
      attempts[q.id] = { attempts: 1, correct: 1, lastAt: '2026-06-14' };
    }
    const states = computeTreeState(sqlTree.root, attempts, solved);
    const select = states.get('select')!;
    expect(select.completion).toBe(100);
    expect(['completed', 'mastered']).toContain(select.status);
  });

  it('every node in the tree has a computed state', () => {
    const states = computeTreeState(sqlTree.root, {}, {});
    const ids: string[] = [];
    const walk = (n: typeof sqlTree.root) => {
      ids.push(n.id);
      n.children?.forEach(walk);
    };
    walk(sqlTree.root);
    for (const id of ids) expect(states.has(id)).toBe(true);
    expect(findNode('group-by')).toBeDefined();
  });
});
