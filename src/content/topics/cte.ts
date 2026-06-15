import type { Topic } from '../../types';

export const cte: Topic = {
  id: 'cte',
  title: 'Common Table Expressions',
  category: 'CTE',
  summary: 'Name intermediate results with WITH to write clear, layered queries.',
  prerequisites: ['subqueries'],
  theory: `
## WITH: naming a result

A Common Table Expression (CTE) names a query so you can refer to it like a
table. It turns a deeply nested query into a readable, top-to-bottom story.

\`\`\`sql
WITH dept_counts AS (
  SELECT department_id, COUNT(*) AS c
  FROM employees
  GROUP BY department_id
)
SELECT department_id FROM dept_counts WHERE c > 2;
\`\`\`

## Multiple CTEs

You can define several CTEs in one WITH, separated by commas, and each can build
on the previous ones. This is the clean alternative to stacking subqueries.

## Recursive CTEs

A recursive CTE refers to itself. It has an anchor member and a recursive member
joined by UNION ALL, and it is the standard way to generate sequences or walk
hierarchies.

\`\`\`sql
WITH RECURSIVE nums(n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM nums WHERE n < 5
)
SELECT n FROM nums ORDER BY n;
\`\`\`
`,
  examples: [
    {
      sql: 'WITH oc AS (SELECT customer_id, COUNT(*) AS c FROM orders GROUP BY customer_id) SELECT AVG(c) FROM oc;',
      explanation: 'A CTE computes per-customer order counts, then the outer query averages them.',
    },
    {
      sql: 'WITH RECURSIVE nums(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM nums WHERE n < 10) SELECT SUM(n) FROM nums;',
      explanation: 'A recursive CTE generates 1..10 and the outer query sums them.',
    },
  ],
  commonMistakes: [
    'Forgetting that a CTE only exists for the single statement that follows it.',
    'Writing a recursive CTE with no terminating condition, which never stops.',
    'Using a CTE purely for a value that a simple subquery would express more directly.',
  ],
  interviewQuestions: [
    {
      q: 'How does a CTE differ from a subquery?',
      a: 'They are often interchangeable, but a CTE is named and can be referenced multiple times and chained, which makes complex queries far more readable. Recursive logic specifically needs a recursive CTE.',
    },
    {
      q: 'What are the two parts of a recursive CTE?',
      a: 'An anchor member that produces the starting rows, and a recursive member that references the CTE and is combined with UNION ALL until it returns no new rows.',
    },
  ],
  practice: [
    {
      id: 'cte-q1',
      difficulty: 'easy',
      datasetId: 'company',
      statement: 'Using a CTE for the average salary, return the names of employees who earn above it.',
      hints: ['Define the average in a WITH, then join or cross-reference it.'],
      solution:
        'WITH avg_s AS (SELECT AVG(salary) AS a FROM employees) SELECT name FROM employees, avg_s WHERE salary > a;',
    },
    {
      id: 'cte-q2',
      difficulty: 'easy',
      datasetId: 'company',
      statement: 'Using a CTE of per-department counts, return the department_ids that have more than two employees.',
      hints: ['First build the counts CTE, then filter it.'],
      solution:
        'WITH dc AS (SELECT department_id, COUNT(*) AS c FROM employees GROUP BY department_id) SELECT department_id FROM dc WHERE c > 2;',
    },
    {
      id: 'cte-q3',
      difficulty: 'medium',
      datasetId: 'company',
      statement:
        'Using a CTE of per-customer order counts, return each customer name and count for customers with more than one order.',
      hints: ['Join the CTE back to customers for the name.'],
      solution:
        'WITH oc AS (SELECT customer_id, COUNT(*) AS c FROM orders GROUP BY customer_id) SELECT cu.name, oc.c FROM oc JOIN customers cu ON cu.id = oc.customer_id WHERE oc.c > 1;',
    },
    {
      id: 'cte-q4',
      difficulty: 'medium',
      datasetId: 'company',
      statement: 'Return the average number of orders per ordering customer using a CTE.',
      hints: ['Average the per-customer counts produced by the CTE.'],
      solution:
        'WITH oc AS (SELECT customer_id, COUNT(*) AS c FROM orders GROUP BY customer_id) SELECT AVG(c) FROM oc;',
    },
    {
      id: 'cte-q5',
      difficulty: 'medium',
      datasetId: 'company',
      statement:
        'Return the engineering team (department 1) name and salary, highest salary first, using a CTE.',
      orderMatters: true,
      hints: ['Filter to department 1 in the CTE, then order in the outer query.'],
      solution:
        'WITH eng AS (SELECT name, salary FROM employees WHERE department_id = 1) SELECT name, salary FROM eng ORDER BY salary DESC;',
    },
    {
      id: 'cte-q6',
      difficulty: 'hard',
      datasetId: 'company',
      statement:
        'Using a CTE, return each product name and its total revenue (price times quantity), the three highest first. Label the revenue column revenue.',
      orderMatters: true,
      hints: ['Aggregate revenue per product in the CTE, then order and limit.'],
      solution:
        'WITH rev AS (SELECT p.name AS name, SUM(oi.quantity * p.price) AS revenue FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id, p.name) SELECT name, revenue FROM rev ORDER BY revenue DESC LIMIT 3;',
    },
    {
      id: 'cte-q7',
      difficulty: 'hard',
      datasetId: 'company',
      statement:
        'Using a CTE of the maximum salary per department, return the name and salary of the top earner in each department.',
      hints: ['Join employees to the per-department maximum on both department and salary.'],
      solution:
        'WITH dept_max AS (SELECT department_id, MAX(salary) AS m FROM employees GROUP BY department_id) SELECT e.name, e.salary FROM employees e JOIN dept_max dm ON e.department_id = dm.department_id AND e.salary = dm.m;',
    },
    {
      id: 'cte-q8',
      difficulty: 'hard',
      datasetId: 'company',
      statement:
        'Using a CTE of per-customer order counts, return the names of customers whose order count is above the average order count.',
      hints: ['Reference the CTE twice: once for rows, once for the average.'],
      solution:
        'WITH oc AS (SELECT customer_id, COUNT(*) AS c FROM orders GROUP BY customer_id) SELECT cu.name FROM oc JOIN customers cu ON cu.id = oc.customer_id WHERE oc.c > (SELECT AVG(c) FROM oc);',
    },
    {
      id: 'cte-q9',
      difficulty: 'expert',
      datasetId: 'company',
      statement: 'Use a recursive CTE to return the numbers 1 through 5, one per row, in order.',
      orderMatters: true,
      hints: ['Anchor with SELECT 1, recurse with n + 1 while n < 5.'],
      solution:
        'WITH RECURSIVE nums(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM nums WHERE n < 5) SELECT n FROM nums ORDER BY n;',
    },
    {
      id: 'cte-q10',
      difficulty: 'expert',
      datasetId: 'company',
      statement: 'Use a recursive CTE to return the sum of the numbers 1 through 10.',
      hints: ['Generate 1..10 recursively, then SUM in the outer query.'],
      solution:
        'WITH RECURSIVE nums(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM nums WHERE n < 10) SELECT SUM(n) FROM nums;',
    },
  ],
};
