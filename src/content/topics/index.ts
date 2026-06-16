import type { Topic } from '../../types';
import { basics } from './basics';
import { filtering } from './filtering';
import { aggregation } from './aggregation';
import { joins } from './joins';
import { subqueries } from './subqueries';
import { cte } from './cte';
import { windowFunctions } from './window';
import { setops } from './setops';
import { analytics } from './analytics';
import { interview } from './interview';

// Fully authored topics.
const builtTopics: Topic[] = [
  basics,
  filtering,
  aggregation,
  joins,
  subqueries,
  cte,
  windowFunctions,
  setops,
  analytics,
  interview,
];

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
  stub('indexes', 'Indexes', 'Indexes', 'How indexes speed up lookups and what they cost.', ['window']),
  stub('views', 'Views', 'Views', 'Saved queries you can treat like tables.', ['cte']),
  stub('procedures', 'Stored Procedures', 'Procedures', 'Reusable server-side routines.', ['views']),
  stub('triggers', 'Triggers', 'Triggers', 'Run logic automatically on data changes.', ['procedures']),
  stub('optimization', 'Query Optimization', 'Optimization', 'Read query plans and tune slow queries.', ['indexes']),
];

export const allTopics: Topic[] = [...builtTopics, ...upcomingTopics];

const byId = new Map(allTopics.map((t) => [t.id, t]));

export function getTopic(id: string): Topic | undefined {
  return byId.get(id);
}

export function isAvailable(topic: Topic): boolean {
  return !topic.comingSoon;
}
