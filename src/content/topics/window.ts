import type { Topic } from '../../types';

export const windowFunctions: Topic = {
  id: 'window',
  title: 'Window Functions',
  category: 'Window Functions',
  summary: 'Rank, compare across rows, and build running totals without collapsing rows.',
  prerequisites: ['aggregation', 'cte'],
  theory: `
## Windows keep your rows

A normal aggregate with GROUP BY collapses rows into one per group. A window
function computes across a set of rows but keeps every row, adding the computed
value as a new column. The window is defined by \`OVER (...)\`.

\`\`\`sql
SELECT rep, amount, SUM(amount) OVER () AS total FROM sales;
\`\`\`

## PARTITION BY

\`PARTITION BY\` restarts the window for each group, like a per-group calculation
that still returns every row.

\`\`\`sql
SELECT region, rep, AVG(amount) OVER (PARTITION BY region) AS region_avg
FROM sales;
\`\`\`

## Ranking

\`ROW_NUMBER\` gives a unique number, \`RANK\` leaves gaps after ties, and
\`DENSE_RANK\` does not. They need an \`ORDER BY\` inside the window.

\`\`\`sql
SELECT rep, SUM(amount) AS total,
       RANK() OVER (ORDER BY SUM(amount) DESC) AS rnk
FROM sales GROUP BY rep;
\`\`\`

## LAG, LEAD, and running totals

\`LAG\` and \`LEAD\` read a value from a previous or next row, perfect for
month-over-month change. Adding \`ORDER BY\` to a windowed \`SUM\` produces a running
total.
`,
  examples: [
    {
      sql: 'SELECT region, rep, SUM(amount) AS total, ROW_NUMBER() OVER (PARTITION BY region ORDER BY SUM(amount) DESC) AS rn FROM sales GROUP BY region, rep;',
      explanation: 'Numbers the reps within each region from highest to lowest total.',
    },
    {
      sql: 'SELECT month, amount, amount - LAG(amount) OVER (ORDER BY month) AS change FROM sales WHERE rep = \'Ava\';',
      explanation: 'Month-over-month change for one rep using LAG.',
    },
  ],
  commonMistakes: [
    'Forgetting ORDER BY inside the window for ranking or running totals; the result is then undefined or not cumulative.',
    'Mixing window functions and GROUP BY incorrectly: window functions run after aggregation.',
    'Expecting a window function in WHERE; filter on it in an outer query or CTE instead.',
  ],
  interviewQuestions: [
    {
      q: 'What is the difference between RANK, DENSE_RANK, and ROW_NUMBER?',
      a: 'ROW_NUMBER always increments by one. RANK gives tied rows the same rank then skips numbers. DENSE_RANK gives ties the same rank without skipping.',
    },
    {
      q: 'How do you compute a running total in SQL?',
      a: 'Use a windowed SUM with an ORDER BY, for example SUM(amount) OVER (ORDER BY month), which accumulates from the first row to the current one.',
    },
  ],
  practice: [
    {
      id: 'window-q1',
      difficulty: 'easy',
      datasetId: 'sales',
      statement:
        'Return rep, month, amount, and the total of all sales as a column called total, on every row.',
      hints: ['An empty OVER () window spans all rows.'],
      solution: 'SELECT rep, month, amount, SUM(amount) OVER () AS total FROM sales;',
    },
    {
      id: 'window-q2',
      difficulty: 'medium',
      datasetId: 'sales',
      statement:
        'Return each region, rep, and their average monthly amount across the whole region as region_avg.',
      hints: ['PARTITION BY region.'],
      solution:
        'SELECT region, rep, AVG(amount) OVER (PARTITION BY region) AS region_avg FROM sales;',
    },
    {
      id: 'window-q3',
      difficulty: 'medium',
      datasetId: 'sales',
      statement:
        'Return each rep with their total sales and their overall rank by total sales, highest first. Label the rank rnk and order by it.',
      orderMatters: true,
      hints: ['Aggregate per rep, then RANK() OVER (ORDER BY SUM(amount) DESC).'],
      solution:
        'SELECT rep, SUM(amount) AS total, RANK() OVER (ORDER BY SUM(amount) DESC) AS rnk FROM sales GROUP BY rep ORDER BY rnk;',
    },
    {
      id: 'window-q4',
      difficulty: 'hard',
      datasetId: 'sales',
      statement:
        'Within each region, number the reps from highest to lowest total sales. Return region, rep, total, and the number as rn, ordered by region then rn.',
      orderMatters: true,
      hints: ['PARTITION BY region ORDER BY SUM(amount) DESC with ROW_NUMBER().'],
      solution:
        'SELECT region, rep, SUM(amount) AS total, ROW_NUMBER() OVER (PARTITION BY region ORDER BY SUM(amount) DESC) AS rn FROM sales GROUP BY region, rep ORDER BY region, rn;',
    },
    {
      id: 'window-q5',
      difficulty: 'hard',
      datasetId: 'sales',
      statement:
        'For the North region, return each month, that month\'s total amount, and a running total over months. Label them month, amt, and running, ordered by month.',
      orderMatters: true,
      hints: ['Aggregate the region by month in a CTE, then SUM(amt) OVER (ORDER BY month).'],
      solution:
        "WITH m AS (SELECT month, SUM(amount) AS amt FROM sales WHERE region = 'North' GROUP BY month) SELECT month, amt, SUM(amt) OVER (ORDER BY month) AS running FROM m ORDER BY month;",
    },
    {
      id: 'window-q6',
      difficulty: 'hard',
      datasetId: 'sales',
      statement:
        'For the West region, return each month, its total amount, and the change from the previous month using LAG. Label them month, amt, and change, ordered by month.',
      orderMatters: true,
      hints: ['LAG(amt) OVER (ORDER BY month) gives the previous month.'],
      solution:
        "WITH m AS (SELECT month, SUM(amount) AS amt FROM sales WHERE region = 'West' GROUP BY month) SELECT month, amt, amt - LAG(amt) OVER (ORDER BY month) AS change FROM m ORDER BY month;",
    },
    {
      id: 'window-q7',
      difficulty: 'hard',
      datasetId: 'sales',
      statement:
        'Return each rep\'s single best month: rep, month, and amount for the month with their highest amount, ordered by rep.',
      orderMatters: true,
      hints: ['ROW_NUMBER per rep ordered by amount desc, then keep row number 1.'],
      solution:
        'WITH r AS (SELECT rep, month, amount, ROW_NUMBER() OVER (PARTITION BY rep ORDER BY amount DESC) AS rn FROM sales) SELECT rep, month, amount FROM r WHERE rn = 1 ORDER BY rep;',
    },
    {
      id: 'window-q8',
      difficulty: 'expert',
      datasetId: 'sales',
      statement:
        'Return each region, rep, their total, and their share of the region total as a rounded percentage called pct (one decimal), ordered by region then rep.',
      orderMatters: true,
      hints: ['Total per rep in a CTE, then 100.0 * total / SUM(total) OVER (PARTITION BY region).'],
      solution:
        'WITH t AS (SELECT region, rep, SUM(amount) AS total FROM sales GROUP BY region, rep) SELECT region, rep, total, ROUND(100.0 * total / SUM(total) OVER (PARTITION BY region), 1) AS pct FROM t ORDER BY region, rep;',
    },
    {
      id: 'window-q9',
      difficulty: 'medium',
      datasetId: 'company',
      statement:
        'Return each employee name, salary, and the highest salary in their department as dept_max.',
      hints: ['MAX(salary) OVER (PARTITION BY department_id).'],
      solution:
        'SELECT name, salary, MAX(salary) OVER (PARTITION BY department_id) AS dept_max FROM employees;',
    },
    {
      id: 'window-q10',
      difficulty: 'hard',
      datasetId: 'company',
      statement:
        'Rank employees by salary within their department, highest first. Return name, department_id, salary, and the rank as rnk, ordered by department_id then rnk.',
      orderMatters: true,
      hints: ['RANK() OVER (PARTITION BY department_id ORDER BY salary DESC).'],
      solution:
        'SELECT name, department_id, salary, RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk FROM employees ORDER BY department_id, rnk;',
    },
    {
      id: 'window-q11',
      difficulty: 'expert',
      datasetId: 'sales',
      statement:
        'For the South region, return each month, its total amount, and a running average of the monthly totals rounded to a whole number. Label them month, amt, and run_avg, ordered by month.',
      orderMatters: true,
      hints: ['AVG(amt) OVER (ORDER BY month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).'],
      solution:
        "WITH m AS (SELECT month, SUM(amount) AS amt FROM sales WHERE region = 'South' GROUP BY month) SELECT month, amt, ROUND(AVG(amt) OVER (ORDER BY month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 0) AS run_avg FROM m ORDER BY month;",
    },
    {
      id: 'window-q12',
      difficulty: 'medium',
      datasetId: 'sales',
      statement:
        'For rep Ava, return each month, the amount, and the next month\'s amount using LEAD, as month, amount, and next_month, ordered by month.',
      orderMatters: true,
      hints: ['LEAD(amount) OVER (ORDER BY month).'],
      solution:
        "SELECT month, amount, LEAD(amount) OVER (ORDER BY month) AS next_month FROM sales WHERE rep = 'Ava' ORDER BY month;",
    },
  ],
};
