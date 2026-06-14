import type { Topic } from '../../types';

export const joins: Topic = {
  id: 'joins',
  title: 'INNER JOIN and LEFT JOIN',
  category: 'Joins',
  summary: 'Combine rows from related tables, and decide what happens when a match is missing.',
  prerequisites: ['aggregation'],
  theory: `
## Why joins exist

Data is split across tables to avoid repetition. An order stores a
\`customer_id\`, not the whole customer. A join stitches the related rows back
together using that key.

## INNER JOIN

An \`INNER JOIN\` returns only rows that have a match on both sides.

\`\`\`sql
SELECT e.name, d.name AS department
FROM employees e
INNER JOIN departments d ON e.department_id = d.id;
\`\`\`

Table aliases (\`e\`, \`d\`) keep the query short and make it clear which table a
column comes from.

## LEFT JOIN

A \`LEFT JOIN\` keeps every row from the left table even when the right table has
no match; the missing columns come back as NULL. This is how you find "customers
with no orders" or include zero counts.

\`\`\`sql
SELECT c.name, COUNT(o.id) AS order_count
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name;
\`\`\`

Count \`o.id\` rather than \`*\` so customers without orders count as 0, not 1.

## Self join

A table can join to itself, for example to pair an employee with their manager
from the same \`employees\` table.
`,
  examples: [
    {
      sql: 'SELECT o.id, c.name FROM orders o INNER JOIN customers c ON o.customer_id = c.id;',
      explanation: 'Each order paired with the name of the customer who placed it.',
    },
    {
      sql: 'SELECT c.name, COUNT(o.id) AS orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id, c.name;',
      explanation: 'Every customer, including those with zero orders thanks to the LEFT JOIN.',
    },
  ],
  commonMistakes: [
    'Forgetting the ON clause, which produces a cross join of every row against every row.',
    'Using COUNT(*) with a LEFT JOIN, which counts the unmatched row as 1 instead of 0.',
    'Ambiguous column names when both tables share a column; qualify them with an alias.',
  ],
  interviewQuestions: [
    {
      q: 'What is the difference between INNER JOIN and LEFT JOIN?',
      a: 'INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table and fills missing right-side columns with NULL.',
    },
    {
      q: 'How do you find rows in one table with no match in another?',
      a: 'LEFT JOIN the second table and keep rows where its key is NULL, for example WHERE o.id IS NULL.',
    },
  ],
  practice: [
    {
      id: 'joins-q1',
      difficulty: 'beginner',
      datasetId: 'company',
      statement:
        "Return each employee's name and their department name. Label the department column 'department'.",
      hints: ['INNER JOIN employees to departments on department_id = departments.id.'],
      solution:
        'SELECT e.name, d.name AS department FROM employees e INNER JOIN departments d ON e.department_id = d.id;',
    },
    {
      id: 'joins-q2',
      difficulty: 'easy',
      datasetId: 'company',
      statement:
        "Return each order's id and the name of the customer who placed it. Label the customer column 'customer'.",
      hints: ['Join orders to customers on customer_id.'],
      solution:
        'SELECT o.id, c.name AS customer FROM orders o INNER JOIN customers c ON o.customer_id = c.id;',
    },
    {
      id: 'joins-q3',
      difficulty: 'medium',
      datasetId: 'company',
      statement:
        "Return every customer's name and how many orders they have placed, including customers with no orders. Label the count 'order_count'.",
      hints: [
        'Use a LEFT JOIN so customers without orders still appear.',
        'COUNT(o.id) so a missing order counts as 0.',
      ],
      solution:
        'SELECT c.name, COUNT(o.id) AS order_count FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id, c.name;',
    },
    {
      id: 'joins-q4',
      difficulty: 'medium',
      datasetId: 'company',
      statement:
        "Return each product's name and its total revenue across all order items, where revenue is price times quantity. Label it 'revenue'.",
      hints: [
        'Join order_items to products on product_id.',
        'SUM(oi.quantity * p.price) grouped by product.',
      ],
      solution:
        'SELECT p.name, SUM(oi.quantity * p.price) AS revenue FROM products p INNER JOIN order_items oi ON oi.product_id = p.id GROUP BY p.id, p.name;',
    },
    {
      id: 'joins-q5',
      difficulty: 'hard',
      datasetId: 'company',
      statement:
        "Return the name of the department with the highest average salary, along with that average. Label the columns 'department' and 'avg_salary'.",
      orderMatters: true,
      hints: [
        'Join employees to departments, group by department.',
        'Order by the average descending and LIMIT 1.',
      ],
      solution:
        'SELECT d.name AS department, AVG(e.salary) AS avg_salary FROM employees e INNER JOIN departments d ON e.department_id = d.id GROUP BY d.id, d.name ORDER BY avg_salary DESC LIMIT 1;',
    },
    {
      id: 'joins-q6',
      difficulty: 'expert',
      datasetId: 'company',
      statement:
        "Return each employee's name and their manager's name. Employees without a manager should still appear with a NULL manager. Label the columns 'employee' and 'manager'.",
      hints: [
        'Join employees to itself using two aliases.',
        'Use a LEFT JOIN so top-level employees are not dropped.',
      ],
      solution:
        'SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;',
    },
  ],
};
