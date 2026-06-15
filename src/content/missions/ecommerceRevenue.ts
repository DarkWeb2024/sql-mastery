import type { Mission } from './types';

// Role-based mission: the learner acts as a data analyst investigating a revenue
// drop. SQL is the instrument; the objective is to locate the cause, recommend an
// action, calibrate confidence, and reflect. Every step's solution is validated
// against the ecommerce dataset by the mission-integrity test.
export const ecommerceRevenue: Mission = {
  id: 'ecommerce-revenue-drop',
  role: 'Data Analyst',
  company: 'an e-commerce retailer',
  title: 'Revenue dropped 12 percent',
  context:
    'You are the data analyst at an online retailer. The VP of Sales messages you: "Revenue fell about 12% from May to June. I need to know why before the board meeting on Friday, and what we should do about it." You have a revenue_facts table with monthly revenue by category and customer_type. Investigate, find the cause, and make a recommendation.',
  technicalConcepts: ['aggregation', 'filtering', 'window'],
  patternIds: ['period-over-period', 'segment-contribution', 'root-cause-drilldown'],
  thinkingTags: [
    'problem-framing',
    'decomposition',
    'comparative-analysis',
    'elimination',
    'communication',
  ],
  decisionPrompt:
    'Based on your investigation, what is the most likely cause of the revenue drop, and what single action do you recommend the company take first? State the cause, the recommendation, and the reasoning that connects them.',
  steps: [
    {
      id: 'step-total',
      kind: 'investigation',
      prompt:
        'Confirm the problem. Return total revenue per month, earliest month first, as month and total.',
      datasetId: 'ecommerce',
      orderMatters: true,
      hint: 'GROUP BY month and SUM(revenue), ordered by month.',
      solution:
        'SELECT month, SUM(revenue) AS total FROM revenue_facts GROUP BY month ORDER BY month;',
      insight: 'Total revenue fell from 100000 in May to 88000 in June. The 12% drop is real.',
    },
    {
      id: 'step-pct',
      kind: 'analysis',
      prompt:
        'Quantify it. Return each month, its total, and the percent change from the previous month rounded to one decimal, as month, total, and pct_change, earliest first.',
      datasetId: 'ecommerce',
      orderMatters: true,
      hint: 'Aggregate per month in a CTE, then use LAG over month for the previous total.',
      solution:
        'WITH m AS (SELECT month, SUM(revenue) AS total FROM revenue_facts GROUP BY month) SELECT month, total, ROUND(100.0 * (total - LAG(total) OVER (ORDER BY month)) / LAG(total) OVER (ORDER BY month), 1) AS pct_change FROM m ORDER BY month;',
      insight: 'June is down 12.0%. Now find which part of the business moved.',
    },
    {
      id: 'step-by-category',
      kind: 'investigation',
      prompt:
        'Break it down. Return revenue by category and month, as category, month, total, ordered by category then month.',
      datasetId: 'ecommerce',
      orderMatters: true,
      hint: 'GROUP BY category, month.',
      solution:
        'SELECT category, month, SUM(revenue) AS total FROM revenue_facts GROUP BY category, month ORDER BY category, month;',
      insight: 'Three categories rose slightly. Electronics fell sharply. That is the suspect.',
    },
    {
      id: 'step-category-change',
      kind: 'analysis',
      prompt:
        'Rank the movers. Return each category and its June-minus-May change as category and change, smallest (most negative) first.',
      datasetId: 'ecommerce',
      orderMatters: true,
      hint: 'Use CASE inside SUM to pivot May and June into columns, then subtract.',
      solution:
        "WITH c AS (SELECT category, SUM(CASE WHEN month = '2023-05' THEN revenue ELSE 0 END) AS may, SUM(CASE WHEN month = '2023-06' THEN revenue ELSE 0 END) AS jun FROM revenue_facts GROUP BY category) SELECT category, jun - may AS change FROM c ORDER BY change;",
      insight: 'Electronics dropped 15000 while every other category gained. The drop is one category.',
    },
    {
      id: 'step-electronics-segment',
      kind: 'analysis',
      prompt:
        'Drill into Electronics. Return Electronics revenue by customer_type and month, as customer_type, month, total, ordered by customer_type then month.',
      datasetId: 'ecommerce',
      orderMatters: true,
      hint: "Filter to category = 'Electronics', then GROUP BY customer_type, month.",
      solution:
        "SELECT customer_type, month, SUM(revenue) AS total FROM revenue_facts WHERE category = 'Electronics' GROUP BY customer_type, month ORDER BY customer_type, month;",
      insight:
        'New-customer Electronics revenue held (15000 to 14000). Returning-customer revenue collapsed (25000 to 11000). This is a retention problem in Electronics, not a demand problem.',
    },
  ],
};
