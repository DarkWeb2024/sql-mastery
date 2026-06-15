// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';
import initSqlJs from 'sql.js';
import { datasets } from '../src/content/datasets';
import { missions } from '../src/content/missions';
import { getPattern } from '../src/content/patterns';
import { thinkingTags } from '../src/content/thinking';
import { compareResults } from '../src/lib/validate';
import type { ResultSet } from '../src/types';

// Missions are content, and like every other answer on the platform their step
// solutions are validated by execution before they can reach a learner.

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
  const out = dbs.get(datasetId)!.exec(sql);
  if (out.length === 0) return { columns: [], rows: [] };
  const last = out[out.length - 1];
  return { columns: last.columns, rows: last.values };
}

const steps = missions.flatMap((m) => m.steps.map((s) => [`${m.id}/${s.id}`, s] as const));

describe('mission content integrity', () => {
  it('every mission has steps and a decision prompt', () => {
    for (const m of missions) {
      expect(m.steps.length, `${m.id} has no steps`).toBeGreaterThan(0);
      expect(m.decisionPrompt.length).toBeGreaterThan(0);
    }
  });

  it('mission patterns and thinking tags resolve', () => {
    for (const m of missions) {
      for (const pid of m.patternIds) expect(getPattern(pid), `pattern ${pid}`).toBeTruthy();
      for (const t of m.thinkingTags) expect(thinkingTags[t], `tag ${t}`).toBeTruthy();
    }
  });

  it.each(steps)('step %s solution runs, returns rows, and is deterministic', (_id, step) => {
    const r = exec(step.datasetId, step.solution);
    expect(r.columns.length, `${step.id} returned no columns`).toBeGreaterThan(0);
    expect(r.rows.length, `${step.id} returned no rows`).toBeGreaterThan(0);
    expect(compareResults(r, exec(step.datasetId, step.solution), step.orderMatters).correct).toBe(true);
  });

  it('order-sensitive steps actually sort', () => {
    for (const [, step] of steps) {
      if (step.orderMatters) expect(step.solution.toUpperCase()).toContain('ORDER BY');
    }
  });
});
