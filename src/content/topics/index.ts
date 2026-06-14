import type { Topic } from '../../types';
import { basics } from './basics';
import { filtering } from './filtering';
import { aggregation } from './aggregation';
import { joins } from './joins';

// Fully authored topics for Phase 1.
const builtTopics: Topic[] = [basics, filtering, aggregation, joins];

// Placeholder nodes so the full roadmap is visible from day one. Adding real
// content later is just a matter of replacing the stub with a full module.
function stub(
  id: string,
  title: string,
  category: string,
  summary: string,
  prerequisites: string[]
): Topic {
  return {
    id,
    title,
    category,
    summary,
    prerequisites,
    comingSoon: true,
    theory: '',
    examples: [],
    commonMistakes: [],
    interviewQuestions: [],
    practice: [],
  };
}

const upcomingTopics: Topic[] = [
  stub('subqueries', 'Subqueries', 'Subqueries', 'Queries nested inside other queries.', ['joins']),
  stub('cte', 'Common Table Expressions', 'CTE', 'Name intermediate results with WITH.', ['subqueries']),
  stub('window', 'Window Functions', 'Window Functions', 'Ranking and running totals without collapsing rows.', ['cte']),
  stub('indexes', 'Indexes', 'Indexes', 'How indexes speed up lookups and what they cost.', ['window']),
  stub('views', 'Views', 'Views', 'Saved queries you can treat like tables.', ['cte']),
  stub('procedures', 'Stored Procedures', 'Procedures', 'Reusable server-side routines.', ['views']),
  stub('triggers', 'Triggers', 'Triggers', 'Run logic automatically on data changes.', ['procedures']),
  stub('optimization', 'Query Optimization', 'Optimization', 'Read query plans and tune slow queries.', ['indexes']),
  stub('analytics', 'Analytics SQL', 'Analytics SQL', 'Patterns for cohort, funnel, and time-series analysis.', ['window']),
  stub('interview', 'Interview SQL', 'Interview SQL', 'The question patterns that show up in interviews.', ['window']),
  stub('projects', 'Industry Projects', 'Industry Projects', 'End-to-end analytics on realistic datasets.', ['analytics']),
];

export const allTopics: Topic[] = [...builtTopics, ...upcomingTopics];

const byId = new Map(allTopics.map((t) => [t.id, t]));

export function getTopic(id: string): Topic | undefined {
  return byId.get(id);
}

export function isAvailable(topic: Topic): boolean {
  return !topic.comingSoon;
}
