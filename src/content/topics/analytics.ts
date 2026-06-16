import type { Topic } from '../../types';

export const analytics: Topic = {
  id: 'analytics',
  title: 'Analytics SQL',
  category: 'Analytics SQL',
  summary: 'Turn raw rows into the metrics a business actually reads: trends, growth, and shares.',
  prerequisites: ['window'],
  theory: `
## From rows to metrics

Analytics SQL is mostly aggregation and window functions applied with intent.
The recurring shapes are running totals, period-over-period growth, share of
total, and ranking within a group.

## Running totals and growth

A windowed \`SUM\` ordered by time gives a cumulative metric; \`LAG\` gives the
previous period so you can compute growth.

\`\`\`sql
WITH m AS (SELECT month, SUM(amount) AS revenue FROM sales GROUP BY month)
SELECT month, revenue,
       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
             / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct
FROM m ORDER BY month;
\`\`\`

## Share of total

Divide a group's value by the windowed total to get its contribution.

\`\`\`sql
SELECT region, SUM(amount) AS total,
       ROUND(100.0 * SUM(amount) / SUM(SUM(amount)) OVER (), 1) AS pct
FROM sales GROUP BY region;
\`\`\`
`,
  examples: [
    {
      sql: 'WITH m AS (SELECT month, SUM(amount) AS revenue FROM sales GROUP BY month) SELECT month, revenue, SUM(revenue) OVER (ORDER BY month) AS cumulative FROM m ORDER BY month;',
      explanation: 'Monthly revenue with a running cumulative total.',
    },
  ],
  commonMistakes: [
    'Integer division: divide by 100.0 not 100 so the percentage keeps its decimals.',
    'Computing growth without ordering the window by time, which makes LAG meaningless.',
    'Forgetting that the first period has no previous row, so growth is NULL there.',
  ],
  interviewQuestions: [
    {
      q: 'How do you compute month-over-month growth in SQL?',
      a: 'Aggregate per month, then use LAG over an ordered window to get the previous month and compute the percentage change.',
    },
    {
      q: 'How do you compute each group\'s share of the overall total?',
      a: 'Divide the group aggregate by a windowed aggregate with an empty OVER (), which spans all rows.',
    },
  ],
  practice: [
    {
      id: 'analytics-q1',
      difficulty: 'medium',
      datasetId: 'sales',
      statement: 'Return each month, its total revenue, and a running cumulative total, earliest first. Label them month, revenue, cumulative.',
      orderMatters: true,
      hints: ['Aggregate per month in a CTE, then SUM(revenue) OVER (ORDER BY month).'],
      solution:
        'WITH m AS (SELECT month, SUM(amount) AS revenue FROM sales GROUP BY month) SELECT month, revenue, SUM(revenue) OVER (ORDER BY month) AS cumulative FROM m ORDER BY month;',
    },
    {
      id: 'analytics-q2',
      difficulty: 'medium',
      datasetId: 'sales',
      statement: 'Return each month, its total revenue, and the month-over-month growth as a percentage rounded to one decimal. Label them month, revenue, growth_pct.',
      orderMatters: true,
      hints: ['LAG the previous month total, then compute the percent change with 100.0.'],
      solution:
        'WITH m AS (SELECT month, SUM(amount) AS revenue FROM sales GROUP BY month) SELECT month, revenue, ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month)) / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct FROM m ORDER BY month;',
    },
    {
      id: 'analytics-q3',
      difficulty: 'hard',
      datasetId: 'sales',
      statement: "Return each region, its total revenue, and its share of all revenue as a percentage rounded to one decimal, ordered by region. Label them region, total, pct.",
      orderMatters: true,
      hints: ['Divide the region total by SUM(...) OVER () for the share.'],
      solution:
        'WITH r AS (SELECT region, SUM(amount) AS total FROM sales GROUP BY region) SELECT region, total, ROUND(100.0 * total / SUM(total) OVER (), 1) AS pct FROM r ORDER BY region;',
    },
    {
      id: 'analytics-q4',
      difficulty: 'hard',
      datasetId: 'company',
      statement: 'Return the number of employees hired each year and a cumulative headcount over the years, earliest year first. Label them yr, hires, cumulative.',
      orderMatters: true,
      hints: ['Group by the year part of hire_date with substr(hire_date, 1, 4), then a running SUM.'],
      solution:
        'WITH h AS (SELECT substr(hire_date, 1, 4) AS yr, COUNT(*) AS hires FROM employees GROUP BY substr(hire_date, 1, 4)) SELECT yr, hires, SUM(hires) OVER (ORDER BY yr) AS cumulative FROM h ORDER BY yr;',
    },
    {
      id: 'analytics-q5',
      difficulty: 'hard',
      datasetId: 'sales',
      statement: 'Rank the regions by their average sale amount, highest first. Return region, the rounded average as avg_amount, and the rank as rnk, ordered by rnk.',
      orderMatters: true,
      hints: ['RANK() OVER (ORDER BY AVG(amount) DESC) with GROUP BY region.'],
      solution:
        'SELECT region, ROUND(AVG(amount), 0) AS avg_amount, RANK() OVER (ORDER BY AVG(amount) DESC) AS rnk FROM sales GROUP BY region ORDER BY rnk;',
    },
    {
      id: 'analytics-q6',
      difficulty: 'expert',
      datasetId: 'sales',
      statement: "Return each region's single best month by total revenue: region, month, and total, ordered by region.",
      orderMatters: true,
      hints: ['Aggregate by region and month, then ROW_NUMBER within region ordered by total descending, keep the first.'],
      solution:
        'WITH rm AS (SELECT region, month, SUM(amount) AS total, ROW_NUMBER() OVER (PARTITION BY region ORDER BY SUM(amount) DESC) AS rn FROM sales GROUP BY region, month) SELECT region, month, total FROM rm WHERE rn = 1 ORDER BY region;',
    },
  ],
};
