import type { Topic } from '../../types';

export const aggregation: Topic = {
  id: 'aggregation',
  title: 'Aggregations and GROUP BY',
  category: 'Aggregations',
  summary: 'Summarise rows with COUNT, SUM, AVG, MIN, MAX, then group and filter the groups.',
  prerequisites: ['filtering'],
  theory: `
## Aggregate functions

Aggregates collapse many rows into a single value: \`COUNT\`, \`SUM\`, \`AVG\`,
\`MIN\`, and \`MAX\`.

\`\`\`sql
SELECT COUNT(*) FROM employees;
SELECT AVG(salary) FROM employees;
\`\`\`

\`COUNT(*)\` counts rows; \`COUNT(column)\` counts non-null values in that column.

## Grouping with GROUP BY

\`GROUP BY\` splits rows into groups and runs the aggregate once per group.

\`\`\`sql
SELECT department_id, COUNT(*)
FROM employees
GROUP BY department_id;
\`\`\`

Every column in the SELECT that is not inside an aggregate must appear in the
\`GROUP BY\`.

## Filtering groups with HAVING

\`WHERE\` filters rows before grouping; \`HAVING\` filters the groups after the
aggregate is computed.

\`\`\`sql
SELECT department_id, COUNT(*)
FROM employees
GROUP BY department_id
HAVING COUNT(*) > 2;
\`\`\`
`,
  examples: [
    {
      sql: 'SELECT status, COUNT(*) FROM orders GROUP BY status;',
      explanation: 'One count per distinct status value.',
    },
    {
      sql: 'SELECT department_id, MAX(salary) FROM employees GROUP BY department_id;',
      explanation: 'The highest salary within each department.',
    },
    {
      sql: 'SELECT department_id, COUNT(*) FROM employees GROUP BY department_id HAVING COUNT(*) > 2;',
      explanation: 'Keeps only departments that have more than two employees.',
    },
  ],
  commonMistakes: [
    'Putting an aggregate in WHERE. Use HAVING to filter on an aggregate result.',
    'Selecting a non-aggregated column that is missing from GROUP BY.',
    'Confusing COUNT(*) with COUNT(column): the second ignores NULLs.',
  ],
  interviewQuestions: [
    {
      q: 'What is the difference between WHERE and HAVING?',
      a: 'WHERE filters individual rows before grouping. HAVING filters whole groups after the aggregate has been calculated. You often use both in one query.',
    },
    {
      q: 'When does COUNT(*) differ from COUNT(column)?',
      a: 'COUNT(*) counts all rows. COUNT(column) counts only rows where that column is not NULL, so they differ whenever the column has NULLs.',
    },
  ],
  practice: [
    {
      id: 'aggregation-q1',
      difficulty: 'beginner',
      datasetId: 'company',
      statement: 'Return the total number of employees.',
      hints: ['Use COUNT(*).'],
      solution: 'SELECT COUNT(*) FROM employees;',
    },
    {
      id: 'aggregation-q2',
      difficulty: 'easy',
      datasetId: 'company',
      statement: 'Return the average salary across all employees.',
      hints: ['Use AVG(salary).'],
      solution: 'SELECT AVG(salary) FROM employees;',
    },
    {
      id: 'aggregation-q3',
      difficulty: 'easy',
      datasetId: 'company',
      statement: 'Return each order status alongside how many orders have that status.',
      hints: ['Group by status and COUNT(*).'],
      solution: 'SELECT status, COUNT(*) FROM orders GROUP BY status;',
    },
    {
      id: 'aggregation-q4',
      difficulty: 'medium',
      datasetId: 'company',
      statement: 'Return each department_id with the number of employees in it.',
      hints: ['GROUP BY department_id.'],
      solution: 'SELECT department_id, COUNT(*) FROM employees GROUP BY department_id;',
    },
    {
      id: 'aggregation-q5',
      difficulty: 'medium',
      datasetId: 'company',
      statement: 'Return the department_id of departments that have more than two employees.',
      hints: ['Filter groups with HAVING COUNT(*) > 2.'],
      solution:
        'SELECT department_id FROM employees GROUP BY department_id HAVING COUNT(*) > 2;',
    },
    {
      id: 'aggregation-q6',
      difficulty: 'hard',
      datasetId: 'company',
      statement:
        'Return each department_id with its highest salary, ordered by that highest salary descending.',
      orderMatters: true,
      hints: ['Use MAX(salary) with GROUP BY department_id.', 'Order by the aggregated value.'],
      solution:
        'SELECT department_id, MAX(salary) AS top_salary FROM employees GROUP BY department_id ORDER BY top_salary DESC;',
    },
  ],
};
