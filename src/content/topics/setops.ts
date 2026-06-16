import type { Topic } from '../../types';

export const setops: Topic = {
  id: 'setops',
  title: 'Set Operations',
  category: 'Set Operations',
  summary: 'Combine the rows of two queries with UNION, INTERSECT, and EXCEPT.',
  prerequisites: ['joins'],
  theory: `
## Stacking results

Set operations combine the rows of two SELECTs that have the same columns. Unlike
a join, which adds columns side by side, these stack rows on top of each other.

## UNION and UNION ALL

\`UNION\` returns the combined rows with duplicates removed; \`UNION ALL\` keeps
every row, including duplicates, and is faster because it does not de-duplicate.

\`\`\`sql
SELECT city FROM customers
UNION
SELECT location FROM departments;
\`\`\`

## INTERSECT and EXCEPT

\`INTERSECT\` returns only rows present in both queries. \`EXCEPT\` returns rows in
the first query that are not in the second.

\`\`\`sql
SELECT city FROM customers
INTERSECT
SELECT location FROM departments;
\`\`\`

Both sides must have the same number of columns and compatible types, and the
column names come from the first query.
`,
  examples: [
    {
      sql: 'SELECT city FROM customers UNION SELECT location FROM departments;',
      explanation: 'Every distinct place that is either a customer city or an office location.',
    },
    {
      sql: 'SELECT city FROM customers EXCEPT SELECT location FROM departments;',
      explanation: 'Customer cities where the company has no office.',
    },
  ],
  commonMistakes: [
    'Mismatched column counts or types between the two queries.',
    'Using UNION when UNION ALL is intended, paying for de-duplication you do not need.',
    'Expecting EXCEPT to be symmetric: A EXCEPT B is not the same as B EXCEPT A.',
  ],
  interviewQuestions: [
    {
      q: 'What is the difference between UNION and UNION ALL?',
      a: 'UNION removes duplicate rows from the combined result; UNION ALL keeps them all and is faster because it skips the de-duplication step.',
    },
    {
      q: 'How would you find rows in one set but not another?',
      a: 'Use EXCEPT (or a LEFT JOIN with an IS NULL check on the right side).',
    },
  ],
  practice: [
    {
      id: 'setops-q1',
      difficulty: 'easy',
      datasetId: 'company',
      statement: 'Return every distinct place that is either a customer city or a department location, as a single column.',
      hints: ['UNION two single-column SELECTs.'],
      solution: 'SELECT city FROM customers UNION SELECT location FROM departments;',
    },
    {
      id: 'setops-q2',
      difficulty: 'medium',
      datasetId: 'company',
      statement: 'Return the places that are BOTH a customer city and a department location.',
      hints: ['INTERSECT keeps only rows in both queries.'],
      solution: 'SELECT city FROM customers INTERSECT SELECT location FROM departments;',
    },
    {
      id: 'setops-q3',
      difficulty: 'medium',
      datasetId: 'company',
      statement: 'Return the customer cities where the company has no office (no department located there).',
      hints: ['EXCEPT returns rows in the first query not present in the second.'],
      solution: 'SELECT city FROM customers EXCEPT SELECT location FROM departments;',
    },
    {
      id: 'setops-q4',
      difficulty: 'medium',
      datasetId: 'company',
      statement:
        "Return a single name column listing employees in department 1 together with all employees who earn more than 120000. Remove duplicates.",
      hints: ['UNION two SELECTs that each return a name.'],
      solution:
        'SELECT name FROM employees WHERE department_id = 1 UNION SELECT name FROM employees WHERE salary > 120000;',
    },
    {
      id: 'setops-q5',
      difficulty: 'medium',
      datasetId: 'company',
      statement:
        'List all department locations and all customer cities in one column, keeping duplicates.',
      hints: ['UNION ALL keeps every row, including duplicates.'],
      solution: 'SELECT location FROM departments UNION ALL SELECT city FROM customers;',
    },
    {
      id: 'setops-q6',
      difficulty: 'hard',
      datasetId: 'company',
      statement:
        'Return product categories that appear in the products table combined with the distinct order statuses, all in one column, duplicates removed.',
      hints: ['UNION the category column with the status column.'],
      solution: 'SELECT category FROM products UNION SELECT status FROM orders;',
    },
  ],
};
