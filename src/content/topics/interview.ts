import type { Topic } from '../../types';

export const interview: Topic = {
  id: 'interview',
  title: 'Interview SQL',
  category: 'Interview SQL',
  summary: 'The recurring question patterns that show up in real SQL interviews.',
  prerequisites: ['window', 'subqueries'],
  theory: `
## The patterns repeat

Most SQL interview questions are variations on a handful of patterns: the Nth
highest value, finding duplicates, the top row per group, comparing a row to a
related row, and computing a median. Recognising the pattern is most of the work.

## Nth highest

The classic: find the second highest salary. One clean way is the maximum below
the maximum.

\`\`\`sql
SELECT MAX(salary) FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);
\`\`\`

## Top row per group

Number the rows within each group and keep number one. This generalises to
"latest order per customer", "best month per region", and so on.

## Median

There is no MEDIAN in standard SQL, so you number the ordered rows and average
the middle one or two.
`,
  examples: [
    {
      sql: 'SELECT city FROM customers GROUP BY city HAVING COUNT(*) > 1;',
      explanation: 'Finding duplicates: cities shared by more than one customer.',
    },
    {
      sql: 'WITH r AS (SELECT department_id, name, salary, ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn FROM employees) SELECT department_id, name, salary FROM r WHERE rn = 1;',
      explanation: 'Top earner per department via ROW_NUMBER.',
    },
  ],
  commonMistakes: [
    'Using LIMIT 1 OFFSET 1 for "second highest" and breaking on ties; the max-below-max or DENSE_RANK approach is safer.',
    'Forgetting ties when ranking: choose ROW_NUMBER, RANK, or DENSE_RANK deliberately.',
    'Assuming a MEDIAN function exists; it does not in standard SQL.',
  ],
  interviewQuestions: [
    {
      q: 'How do you find the second highest value without LIMIT/OFFSET?',
      a: 'Take the maximum value strictly less than the overall maximum, or use DENSE_RANK and filter for rank 2.',
    },
    {
      q: 'How do you get the latest record per group?',
      a: 'ROW_NUMBER() OVER (PARTITION BY group ORDER BY time DESC) and keep row number 1.',
    },
  ],
  practice: [
    {
      id: 'interview-q1',
      difficulty: 'medium',
      datasetId: 'company',
      statement: 'Return the second highest salary among all employees as second_highest.',
      hints: ['The maximum salary strictly below the overall maximum.'],
      solution:
        'SELECT MAX(salary) AS second_highest FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);',
    },
    {
      id: 'interview-q2',
      difficulty: 'medium',
      datasetId: 'company',
      statement: 'Find the cities that are shared by more than one customer. Return the city.',
      hints: ['GROUP BY city with HAVING COUNT(*) > 1.'],
      solution: 'SELECT city FROM customers GROUP BY city HAVING COUNT(*) > 1;',
    },
    {
      id: 'interview-q3',
      difficulty: 'hard',
      datasetId: 'company',
      statement:
        'Return the top earner in each department: department_id, name, and salary, ordered by department_id.',
      orderMatters: true,
      hints: ['ROW_NUMBER within department ordered by salary descending, keep row 1.'],
      solution:
        'WITH r AS (SELECT department_id, name, salary, ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn FROM employees) SELECT department_id, name, salary FROM r WHERE rn = 1 ORDER BY department_id;',
    },
    {
      id: 'interview-q4',
      difficulty: 'hard',
      datasetId: 'company',
      statement:
        "Return each employee who has a manager, with their name and the gap between their salary and their manager's salary, smallest gap first. Label the columns name and gap.",
      orderMatters: true,
      hints: ['Self-join employees to itself on manager_id, then subtract salaries.'],
      solution:
        'SELECT e.name, e.salary - m.salary AS gap FROM employees e JOIN employees m ON e.manager_id = m.id ORDER BY gap;',
    },
    {
      id: 'interview-q5',
      difficulty: 'hard',
      datasetId: 'company',
      statement: 'Return the name of the department with the highest average salary.',
      hints: ['Join to departments, group, order by AVG(salary) descending, LIMIT 1.'],
      solution:
        'SELECT d.name FROM employees e JOIN departments d ON e.department_id = d.id GROUP BY d.id, d.name ORDER BY AVG(e.salary) DESC LIMIT 1;',
    },
    {
      id: 'interview-q6',
      difficulty: 'expert',
      datasetId: 'company',
      statement: 'Return the median employee salary as median.',
      hints: ['Number the salaries in order, then average the middle one or two rows.'],
      solution:
        'WITH r AS (SELECT salary, ROW_NUMBER() OVER (ORDER BY salary) AS rn, COUNT(*) OVER () AS n FROM employees) SELECT AVG(salary) AS median FROM r WHERE rn IN ((n + 1) / 2, (n + 2) / 2);',
    },
  ],
};
