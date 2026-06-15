import type { Difficulty } from '../types';

// The knowledge tree is the backbone of the platform: a complete, hierarchical
// map of what a professional SQL practitioner actually knows, with dependencies
// between concepts. It is intentionally subject-agnostic so Python, Pandas, and
// other domains can be added as sibling trees later without redesigning anything.
//
// A node may carry a `topicId` linking it to real lesson/practice content. Many
// fine-grained nodes share the topicId of the broader lesson that teaches them;
// nodes with neither content nor children are upcoming and render as planned.

export type InterviewImportance = 'low' | 'medium' | 'high';

export interface TreeNode {
  id: string;
  title: string;
  blurb?: string;
  difficulty?: Difficulty;
  estMinutes?: number;
  interviewImportance?: InterviewImportance;
  /** ids of nodes that should be learned first. */
  prerequisites?: string[];
  /** links this node to a real topic with practice, when one exists. */
  topicId?: string;
  children?: TreeNode[];
}

export interface SubjectTree {
  id: string;
  title: string;
  status: 'available' | 'coming-soon';
  root: TreeNode;
}

// The full SQL syllabus. Structure mirrors how the skill is actually built up,
// from database concepts through querying, aggregation, joins, and on to the
// advanced and career-track material.
const sqlRoot: TreeNode = {
  id: 'sql',
  title: 'SQL',
  children: [
    {
      id: 'foundations',
      title: 'SQL Foundations',
      blurb: 'How relational databases are organised.',
      difficulty: 'beginner',
      estMinutes: 40,
      interviewImportance: 'medium',
      children: [
        { id: 'db-concepts', title: 'Database concepts', difficulty: 'beginner', estMinutes: 10, interviewImportance: 'medium' },
        { id: 'tables', title: 'Tables', difficulty: 'beginner', estMinutes: 6, interviewImportance: 'medium', prerequisites: ['db-concepts'] },
        { id: 'rows-columns', title: 'Rows and columns', difficulty: 'beginner', estMinutes: 6, interviewImportance: 'low', prerequisites: ['tables'] },
        { id: 'data-types', title: 'Data types', difficulty: 'beginner', estMinutes: 8, interviewImportance: 'medium', prerequisites: ['tables'] },
        { id: 'primary-keys', title: 'Primary keys', difficulty: 'beginner', estMinutes: 8, interviewImportance: 'high', prerequisites: ['tables'] },
        { id: 'foreign-keys', title: 'Foreign keys', difficulty: 'easy', estMinutes: 8, interviewImportance: 'high', prerequisites: ['primary-keys'] },
      ],
    },
    {
      id: 'querying',
      title: 'Querying Data',
      blurb: 'Reading, filtering, and ordering data.',
      difficulty: 'beginner',
      estMinutes: 90,
      interviewImportance: 'high',
      prerequisites: ['foundations'],
      children: [
        {
          id: 'select',
          title: 'SELECT',
          topicId: 'basics',
          difficulty: 'beginner',
          estMinutes: 30,
          interviewImportance: 'high',
          prerequisites: ['rows-columns'],
          children: [
            { id: 'basic-select', title: 'Basic SELECT', topicId: 'basics', difficulty: 'beginner', estMinutes: 8, interviewImportance: 'high' },
            { id: 'distinct', title: 'DISTINCT', topicId: 'basics', difficulty: 'easy', estMinutes: 6, interviewImportance: 'medium' },
            { id: 'aliases', title: 'Aliases', topicId: 'basics', difficulty: 'easy', estMinutes: 5, interviewImportance: 'medium' },
            { id: 'expressions', title: 'Expressions', topicId: 'basics', difficulty: 'easy', estMinutes: 6, interviewImportance: 'medium' },
          ],
        },
        {
          id: 'where',
          title: 'WHERE',
          topicId: 'filtering',
          difficulty: 'easy',
          estMinutes: 35,
          interviewImportance: 'high',
          prerequisites: ['select'],
          children: [
            { id: 'comparison-operators', title: 'Comparison operators', topicId: 'filtering', difficulty: 'easy', estMinutes: 6, interviewImportance: 'high' },
            { id: 'logical-operators', title: 'Logical operators', topicId: 'filtering', difficulty: 'easy', estMinutes: 6, interviewImportance: 'high' },
            { id: 'between', title: 'BETWEEN', topicId: 'filtering', difficulty: 'easy', estMinutes: 4, interviewImportance: 'medium' },
            { id: 'in-op', title: 'IN', topicId: 'filtering', difficulty: 'easy', estMinutes: 4, interviewImportance: 'medium' },
            { id: 'like', title: 'LIKE', topicId: 'filtering', difficulty: 'easy', estMinutes: 5, interviewImportance: 'medium' },
            { id: 'null-handling', title: 'NULL handling', topicId: 'filtering', difficulty: 'medium', estMinutes: 8, interviewImportance: 'high' },
          ],
        },
        { id: 'order-by', title: 'ORDER BY', topicId: 'basics', difficulty: 'beginner', estMinutes: 8, interviewImportance: 'high', prerequisites: ['select'] },
        { id: 'limit', title: 'LIMIT', topicId: 'basics', difficulty: 'beginner', estMinutes: 5, interviewImportance: 'medium', prerequisites: ['order-by'] },
      ],
    },
    {
      id: 'aggregation',
      title: 'Aggregation',
      blurb: 'Summarising data into groups.',
      topicId: 'aggregation',
      difficulty: 'medium',
      estMinutes: 60,
      interviewImportance: 'high',
      prerequisites: ['where'],
      children: [
        { id: 'count', title: 'COUNT', topicId: 'aggregation', difficulty: 'easy', estMinutes: 6, interviewImportance: 'high' },
        { id: 'sum-avg', title: 'SUM and AVG', topicId: 'aggregation', difficulty: 'easy', estMinutes: 6, interviewImportance: 'high' },
        { id: 'min-max', title: 'MIN and MAX', topicId: 'aggregation', difficulty: 'easy', estMinutes: 5, interviewImportance: 'medium' },
        { id: 'group-by', title: 'GROUP BY', topicId: 'aggregation', difficulty: 'medium', estMinutes: 12, interviewImportance: 'high', prerequisites: ['count'] },
        { id: 'having', title: 'HAVING', topicId: 'aggregation', difficulty: 'medium', estMinutes: 10, interviewImportance: 'high', prerequisites: ['group-by'] },
      ],
    },
    {
      id: 'joins',
      title: 'Joins',
      blurb: 'Combining rows from related tables.',
      topicId: 'joins',
      difficulty: 'medium',
      estMinutes: 80,
      interviewImportance: 'high',
      prerequisites: ['aggregation', 'foreign-keys'],
      children: [
        { id: 'inner-join', title: 'INNER JOIN', topicId: 'joins', difficulty: 'medium', estMinutes: 12, interviewImportance: 'high' },
        { id: 'left-join', title: 'LEFT JOIN', topicId: 'joins', difficulty: 'medium', estMinutes: 12, interviewImportance: 'high', prerequisites: ['inner-join'] },
        { id: 'right-join', title: 'RIGHT JOIN', difficulty: 'medium', estMinutes: 8, interviewImportance: 'medium', prerequisites: ['left-join'] },
        { id: 'full-join', title: 'FULL JOIN', difficulty: 'medium', estMinutes: 8, interviewImportance: 'medium', prerequisites: ['left-join'] },
        { id: 'cross-join', title: 'CROSS JOIN', difficulty: 'medium', estMinutes: 6, interviewImportance: 'low', prerequisites: ['inner-join'] },
        { id: 'self-join', title: 'SELF JOIN', topicId: 'joins', difficulty: 'hard', estMinutes: 12, interviewImportance: 'high', prerequisites: ['inner-join'] },
        { id: 'multi-join', title: 'Multi-table joins', difficulty: 'hard', estMinutes: 14, interviewImportance: 'high', prerequisites: ['inner-join'] },
      ],
    },
    {
      id: 'subqueries',
      title: 'Subqueries',
      blurb: 'Queries nested inside queries.',
      topicId: 'subqueries',
      difficulty: 'hard',
      estMinutes: 50,
      interviewImportance: 'high',
      prerequisites: ['joins'],
      children: [
        { id: 'scalar-subquery', title: 'Scalar subqueries', topicId: 'subqueries', difficulty: 'medium', estMinutes: 10, interviewImportance: 'medium' },
        { id: 'in-subquery', title: 'IN / EXISTS subqueries', topicId: 'subqueries', difficulty: 'hard', estMinutes: 12, interviewImportance: 'high' },
        { id: 'correlated-subquery', title: 'Correlated subqueries', topicId: 'subqueries', difficulty: 'hard', estMinutes: 14, interviewImportance: 'high', prerequisites: ['in-subquery'] },
      ],
    },
    {
      id: 'cte',
      title: 'Common Table Expressions',
      blurb: 'Naming intermediate results with WITH.',
      topicId: 'cte',
      difficulty: 'hard',
      estMinutes: 45,
      interviewImportance: 'high',
      prerequisites: ['subqueries'],
      children: [
        { id: 'basic-cte', title: 'Basic CTEs', topicId: 'cte', difficulty: 'hard', estMinutes: 12, interviewImportance: 'high' },
        { id: 'recursive-cte', title: 'Recursive CTEs', topicId: 'cte', difficulty: 'expert', estMinutes: 18, interviewImportance: 'medium', prerequisites: ['basic-cte'] },
      ],
    },
    {
      id: 'window',
      title: 'Window Functions',
      blurb: 'Ranking and running totals without collapsing rows.',
      topicId: 'window',
      difficulty: 'expert',
      estMinutes: 70,
      interviewImportance: 'high',
      prerequisites: ['aggregation', 'order-by', 'cte'],
      children: [
        { id: 'over-partition', title: 'OVER and PARTITION BY', topicId: 'window', difficulty: 'hard', estMinutes: 14, interviewImportance: 'high' },
        { id: 'ranking', title: 'ROW_NUMBER, RANK, DENSE_RANK', topicId: 'window', difficulty: 'hard', estMinutes: 14, interviewImportance: 'high', prerequisites: ['over-partition'] },
        { id: 'lag-lead', title: 'LAG and LEAD', topicId: 'window', difficulty: 'expert', estMinutes: 14, interviewImportance: 'high', prerequisites: ['over-partition'] },
        { id: 'running-totals', title: 'Running totals and moving averages', topicId: 'window', difficulty: 'expert', estMinutes: 16, interviewImportance: 'medium', prerequisites: ['over-partition'] },
      ],
    },
    {
      id: 'set-ops',
      title: 'Set Operations',
      blurb: 'UNION, INTERSECT, and EXCEPT.',
      difficulty: 'medium',
      estMinutes: 25,
      interviewImportance: 'medium',
      prerequisites: ['querying'],
      children: [
        { id: 'union', title: 'UNION and UNION ALL', difficulty: 'medium', estMinutes: 10, interviewImportance: 'medium' },
        { id: 'intersect-except', title: 'INTERSECT and EXCEPT', difficulty: 'medium', estMinutes: 10, interviewImportance: 'low' },
      ],
    },
    {
      id: 'data-modeling',
      title: 'Database Design',
      blurb: 'Designing schemas that scale.',
      difficulty: 'hard',
      estMinutes: 80,
      interviewImportance: 'high',
      prerequisites: ['foundations'],
      children: [
        { id: 'normalization', title: 'Normalization', difficulty: 'hard', estMinutes: 18, interviewImportance: 'high' },
        { id: 'relationships', title: 'Relationships and cardinality', difficulty: 'medium', estMinutes: 12, interviewImportance: 'high' },
        { id: 'ddl', title: 'CREATE, ALTER, DROP', difficulty: 'medium', estMinutes: 12, interviewImportance: 'medium' },
        { id: 'constraints', title: 'Constraints', difficulty: 'medium', estMinutes: 12, interviewImportance: 'medium' },
        { id: 'dml', title: 'INSERT, UPDATE, DELETE', difficulty: 'easy', estMinutes: 12, interviewImportance: 'medium' },
      ],
    },
    {
      id: 'views',
      title: 'Views',
      blurb: 'Saved queries you can treat like tables.',
      difficulty: 'medium',
      estMinutes: 25,
      interviewImportance: 'medium',
      prerequisites: ['joins'],
    },
    {
      id: 'indexes',
      title: 'Indexes',
      blurb: 'How indexes speed up lookups and what they cost.',
      difficulty: 'hard',
      estMinutes: 40,
      interviewImportance: 'high',
      prerequisites: ['data-modeling', 'where'],
    },
    {
      id: 'transactions',
      title: 'Transactions',
      blurb: 'ACID, commits, rollbacks, and isolation.',
      difficulty: 'hard',
      estMinutes: 45,
      interviewImportance: 'high',
      prerequisites: ['dml'],
      children: [
        { id: 'acid', title: 'ACID properties', difficulty: 'medium', estMinutes: 12, interviewImportance: 'high' },
        { id: 'isolation-levels', title: 'Isolation levels', difficulty: 'expert', estMinutes: 18, interviewImportance: 'high', prerequisites: ['acid'] },
      ],
    },
    {
      id: 'procedures',
      title: 'Stored Procedures and Triggers',
      blurb: 'Server-side routines and automatic actions.',
      difficulty: 'expert',
      estMinutes: 50,
      interviewImportance: 'medium',
      prerequisites: ['views', 'dml'],
      children: [
        { id: 'stored-procedures', title: 'Stored procedures', difficulty: 'expert', estMinutes: 20, interviewImportance: 'medium' },
        { id: 'triggers', title: 'Triggers', difficulty: 'expert', estMinutes: 20, interviewImportance: 'low', prerequisites: ['stored-procedures'] },
      ],
    },
    {
      id: 'optimization',
      title: 'Query Optimization',
      blurb: 'Reading query plans and tuning slow queries.',
      difficulty: 'expert',
      estMinutes: 60,
      interviewImportance: 'high',
      prerequisites: ['indexes', 'joins'],
      children: [
        { id: 'query-plans', title: 'Reading EXPLAIN plans', difficulty: 'expert', estMinutes: 20, interviewImportance: 'high' },
        { id: 'tuning', title: 'Tuning techniques', difficulty: 'expert', estMinutes: 22, interviewImportance: 'high', prerequisites: ['query-plans'] },
      ],
    },
    {
      id: 'analytics-sql',
      title: 'Analytics SQL',
      blurb: 'Cohorts, funnels, and time-series patterns.',
      difficulty: 'expert',
      estMinutes: 70,
      interviewImportance: 'high',
      prerequisites: ['window'],
    },
    {
      id: 'warehousing',
      title: 'Data Warehousing SQL',
      blurb: 'Star schemas, facts, and dimensions.',
      difficulty: 'expert',
      estMinutes: 60,
      interviewImportance: 'medium',
      prerequisites: ['data-modeling', 'analytics-sql'],
    },
    {
      id: 'interview-sql',
      title: 'Interview Preparation',
      blurb: 'The patterns that show up in real interviews.',
      difficulty: 'hard',
      estMinutes: 90,
      interviewImportance: 'high',
      prerequisites: ['window', 'subqueries'],
    },
    {
      id: 'projects',
      title: 'Industry Projects',
      blurb: 'End-to-end analytics on realistic datasets.',
      difficulty: 'expert',
      estMinutes: 240,
      interviewImportance: 'high',
      prerequisites: ['analytics-sql', 'joins'],
    },
  ],
};

export const sqlTree: SubjectTree = { id: 'sql', title: 'SQL', status: 'available', root: sqlRoot };

// Future subjects render as locked trees, establishing the "learning operating
// system" direction without pretending to be ready.
export const subjectTrees: SubjectTree[] = [
  sqlTree,
  { id: 'python', title: 'Python', status: 'coming-soon', root: { id: 'python', title: 'Python' } },
  { id: 'pandas', title: 'Pandas', status: 'coming-soon', root: { id: 'pandas', title: 'Pandas' } },
  { id: 'stats', title: 'Statistics', status: 'coming-soon', root: { id: 'stats', title: 'Statistics' } },
  { id: 'ml', title: 'Machine Learning', status: 'coming-soon', root: { id: 'ml', title: 'Machine Learning' } },
];

// Flattens the tree to a list of leaf-ish learnable nodes (those carrying a
// topicId or with no children), useful for counting and lookups.
export function flattenLearnable(node: TreeNode, acc: TreeNode[] = []): TreeNode[] {
  if (!node.children || node.children.length === 0) {
    acc.push(node);
  } else {
    if (node.topicId) acc.push(node);
    node.children.forEach((c) => flattenLearnable(c, acc));
  }
  return acc;
}
