// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';
import initSqlJs from 'sql.js';
import { datasets } from '../src/content/datasets';
import { allTopics } from '../src/content/topics';
import { compareResults } from '../src/lib/validate';
import type { ResultSet } from '../src/types';

// This test is the safety net for content correctness. It seeds every dataset
// and runs each authored solution against the dataset that question targets. If a
// solution has a typo, queries a missing column, or an "order matters" question
// forgets ORDER BY, this fails before the question ever reaches a learner.

type Db = InstanceType<Awaited<ReturnType<typeof initSqlJs>>['Database']>;
const dbs = new Map<string, Db>();

beforeAll(async () => {
  const SQL = await initSqlJs();
  for (const id of Object.keys(datasets)) {
    const db = new SQL.Database();
    db.run(datasets[id].seedSql);
    dbs.set(id, db);
  }
});

function exec(datasetId: string, sql: string): ResultSet {
  const db = dbs.get(datasetId)!;
  const out = db.exec(sql);
  if (out.length === 0) return { columns: [], rows: [] };
  const last = out[out.length - 1];
  return { columns: last.columns, rows: last.values };
}

const built = allTopics.filter((t) => !t.comingSoon);
const questions = built.flatMap((t) => t.practice);

describe('practice content integrity', () => {
  it('has at least one question per built topic', () => {
    for (const topic of built) {
      expect(topic.practice.length, `topic ${topic.id} has no questions`).toBeGreaterThan(0);
    }
  });

  it('uses unique question ids', () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('references datasets that exist', () => {
    for (const q of questions) {
      expect(Object.keys(datasets), `question ${q.id}`).toContain(q.datasetId);
    }
  });

  it.each(questions.map((q) => [q.id, q] as const))(
    'solution for %s runs and is deterministic',
    (_id, q) => {
      const result = exec(q.datasetId, q.solution);
      expect(result.columns.length, `question ${q.id} returned no columns`).toBeGreaterThan(0);
      expect(Array.isArray(result.rows)).toBe(true);
      // A solution comparing to itself must always be correct, which proves the
      // validator and the canonical answer agree and that the query is stable.
      expect(compareResults(result, exec(q.datasetId, q.solution), q.orderMatters).correct).toBe(true);
    }
  );

  it('orderMatters questions actually sort their output', () => {
    for (const q of questions) {
      if (q.orderMatters) {
        expect(q.solution.toUpperCase(), `question ${q.id}`).toContain('ORDER BY');
      }
    }
  });
});
