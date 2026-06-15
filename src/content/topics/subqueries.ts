import type { Topic } from '../../types';

export const subqueries: Topic = {
  id: 'subqueries',
  title: 'Subqueries',
  category: 'Subqueries',
  summary: 'Use the result of one query inside another to answer layered questions.',
  prerequisites: ['joins'],
  theory: `
## What a subquery is

A subquery is a query nested inside another query. The inner query runs first and
its result feeds the outer query. This lets you compare each row against a
computed value, such as an average, or test membership in another result set.

## Scalar subqueries

A scalar subquery returns a single value and can be used anywhere a value is
expected.

\`\`\`sql
SELECT name FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
\`\`\`

## IN, NOT IN, and EXISTS

\`IN\` tests membership in a set returned by a subquery. \`EXISTS\` checks whether a
correlated subquery returns any row at all, which is often faster for "is there
at least one match" questions.

\`\`\`sql
SELECT name FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
\`\`\`

## Correlated subqueries

A correlated subquery references a column from the outer query, so it is
re-evaluated for each outer row. It is the tool for "compare each row to a group
it belongs to".

\`\`\`sql
SELECT name FROM employees e
WHERE salary > (
  SELECT AVG(salary) FROM employees e2
  WHERE e2.department_id = e.department_id
);
\`\`\`

## Subqueries in FROM

A subquery can stand in for a table, which is handy for aggregating an aggregate.
`,
  examples: [
    {
      sql: 'SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders);',
      explanation: 'Customers that appear at least once in the orders table.',
    },
    {
      sql: 'SELECT AVG(c) FROM (SELECT COUNT(*) AS c FROM employees GROUP BY department_id);',
      explanation: 'Average employees per department, by averaging the per-department counts.',
    },
  ],
  commonMistakes: [
    'NOT IN with a subquery that can return NULL: a single NULL makes the whole condition return no rows. Filter NULLs or use NOT EXISTS.',
    'Using a scalar subquery that returns more than one row where a single value is expected.',
    'Reaching for a correlated subquery when a join would be clearer and faster.',
  ],
  interviewQuestions: [
    {
      q: 'What is the difference between a correlated and a non-correlated subquery?',
      a: 'A non-correlated subquery is independent and runs once. A correlated subquery references the outer query and is evaluated once per outer row.',
    },
    {
      q: 'When would you prefer EXISTS over IN?',
      a: 'EXISTS can stop at the first match and avoids the NULL pitfalls of NOT IN, so it is often preferred for existence checks, especially with large or nullable sets.',
    },
  ],
  practice: [
    {
      id: 'subqueries-q1',
      difficulty: 'beginner',
      datasetId: 'company',
      statement: 'Return the names of employees who earn more than the average salary of all employees.',
      hints: ['Use a scalar subquery for the average.', 'Compare salary against it in WHERE.'],
      solution: 'SELECT name FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);',
    },
    {
      id: 'subqueries-q2',
      difficulty: 'easy',
      datasetId: 'company',
      statement: 'Return the names of customers who have placed at least one order, using a subquery with IN.',
      hints: ['The inner query returns customer ids from orders.'],
      solution: 'SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders);',
    },
    {
      id: 'subqueries-q3',
      difficulty: 'easy',
      datasetId: 'company',
      statement: 'Return the names of customers who have never placed an order.',
      hints: ['NOT IN against the customer ids that appear in orders works here.'],
      solution: 'SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders);',
    },
    {
      id: 'subqueries-q4',
      difficulty: 'medium',
      datasetId: 'company',
      statement: 'Return the names of employees who are not anyone\'s manager.',
      hints: ['Collect the non-null manager_id values, then exclude those employee ids.'],
      solution:
        'SELECT name FROM employees WHERE id NOT IN (SELECT manager_id FROM employees WHERE manager_id IS NOT NULL);',
    },
    {
      id: 'subqueries-q5',
      difficulty: 'medium',
      datasetId: 'company',
      statement: 'Return the names of customers who have placed an order, using EXISTS.',
      hints: ['Correlate the inner query on customer_id.'],
      solution:
        'SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);',
    },
    {
      id: 'subqueries-q6',
      difficulty: 'medium',
      datasetId: 'company',
      statement: 'Return the name of the highest paid employee using a subquery for the maximum salary.',
      hints: ['Compare salary to (SELECT MAX(salary) ...).'],
      solution: 'SELECT name FROM employees WHERE salary = (SELECT MAX(salary) FROM employees);',
    },
    {
      id: 'subqueries-q7',
      difficulty: 'medium',
      datasetId: 'company',
      statement:
        'Return the average number of employees per department by averaging the per-department counts.',
      hints: ['Put a GROUP BY count query in the FROM clause, then average its column.'],
      solution:
        'SELECT AVG(c) FROM (SELECT COUNT(*) AS c FROM employees GROUP BY department_id);',
    },
    {
      id: 'subqueries-q8',
      difficulty: 'medium',
      datasetId: 'company',
      statement: 'Return the name of the customer who has placed the most orders.',
      hints: ['Find the customer_id with the highest count, then look up the name.'],
      solution:
        'SELECT name FROM customers WHERE id = (SELECT customer_id FROM orders GROUP BY customer_id ORDER BY COUNT(*) DESC LIMIT 1);',
    },
    {
      id: 'subqueries-q9',
      difficulty: 'hard',
      datasetId: 'company',
      statement:
        'Return the names of employees who earn more than the average salary of their own department.',
      hints: ['Use a correlated subquery that filters on the outer row\'s department_id.'],
      solution:
        'SELECT name FROM employees e WHERE salary > (SELECT AVG(salary) FROM employees e2 WHERE e2.department_id = e.department_id);',
    },
    {
      id: 'subqueries-q10',
      difficulty: 'hard',
      datasetId: 'company',
      statement:
        'Return the names of products priced above the average price within their own category.',
      hints: ['Correlate the average on category.'],
      solution:
        'SELECT name FROM products p WHERE price > (SELECT AVG(price) FROM products p2 WHERE p2.category = p.category);',
    },
    {
      id: 'subqueries-q11',
      difficulty: 'hard',
      datasetId: 'company',
      statement: 'Return the name of the department that has the most employees.',
      hints: ['A subquery can find the department_id with the largest count.'],
      solution:
        'SELECT name FROM departments WHERE id = (SELECT department_id FROM employees GROUP BY department_id ORDER BY COUNT(*) DESC LIMIT 1);',
    },
    {
      id: 'subqueries-q12',
      difficulty: 'expert',
      datasetId: 'company',
      statement: 'Return the second highest salary among all employees.',
      hints: ['Take the max salary that is below the overall maximum.'],
      solution:
        'SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);',
    },
  ],
};
