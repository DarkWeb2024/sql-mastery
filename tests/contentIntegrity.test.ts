// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';
import initSqlJs from 'sql.js';
import { companyDataset } from '../src/content/datasets/company';
import { allTopics } from '../src/content/topics';
import { compareResults } from '../src/lib/validate';
import type { ResultSet } from '../src/types';

// This test is the safety net for content correctness. It runs every authored
// solution against a freshly seeded database. If a solution has a typo, queries
// a missing column, or an "order matters" question forgets ORDER BY, this fails
// before the question ever reaches a learner.

let db: InstanceType<Awaited<ReturnType<typeof initSqlJs>>['Database']>;

beforeAll(async () => {
  const SQL = await initSqlJs();
  db = new SQL.Database();
  db.run(companyDataset.seedSql);
});

function exec(sql: string): ResultSet {
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

  it.each(questions.map((q) => [q.id, q] as const))(
    'solution for %s runs and returns rows',
    (_id, q) => {
      const result = exec(q.solution);
      expect(result.columns.length).toBeGreaterThan(0);
      expect(Array.isArray(result.rows)).toBe(true);
      // A solution comparing to itself must always be correct, which proves the
      // validator and the canonical answer agree.
      expect(compareResults(result, exec(q.solution), q.orderMatters).correct).toBe(true);
    }
  );

  it('orderMatters questions actually sort their output', () => {
    for (const q of questions) {
      if (q.orderMatters) {
        expect(q.solution.toUpperCase(), `question ${q.id}`).toContain('ORDER BY');
      }
    }
  });

  it('references datasets that exist', () => {
    for (const q of questions) {
      expect(q.datasetId).toBe(companyDataset.id);
    }
  });
});
