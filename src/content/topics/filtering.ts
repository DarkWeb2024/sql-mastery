import type { Topic } from '../../types';

export const filtering: Topic = {
  id: 'filtering',
  title: 'AND, OR, NOT, IN, BETWEEN, LIKE',
  category: 'Filtering',
  summary: 'Combine conditions and match ranges, sets, and text patterns.',
  prerequisites: ['basics'],
  theory: `
## Combining conditions

\`AND\` requires both sides to be true, \`OR\` requires at least one, and \`NOT\`
inverts a condition.

\`\`\`sql
SELECT name FROM employees
WHERE department_id = 1 AND salary > 100000;
\`\`\`

Watch precedence: \`AND\` binds tighter than \`OR\`. Use parentheses to make intent
explicit when you mix them.

## Matching a set with IN

\`IN\` is a clean way to test membership instead of chaining many \`OR\` checks.

\`\`\`sql
SELECT name FROM employees WHERE department_id IN (1, 2);
\`\`\`

## Ranges with BETWEEN

\`BETWEEN a AND b\` is inclusive of both ends.

\`\`\`sql
SELECT name, price FROM products WHERE price BETWEEN 200 AND 1000;
\`\`\`

## Text patterns with LIKE

\`LIKE\` matches patterns: \`%\` is any run of characters and \`_\` is a single
character.

\`\`\`sql
SELECT name FROM products WHERE name LIKE '%License%';
\`\`\`
`,
  examples: [
    {
      sql: "SELECT name FROM customers WHERE country <> 'USA';",
      explanation: 'The <> operator (also written !=) keeps rows that are not the USA.',
    },
    {
      sql: 'SELECT name, price FROM products WHERE price BETWEEN 200 AND 1000;',
      explanation: 'BETWEEN includes both 200 and 1000.',
    },
    {
      sql: "SELECT name FROM employees WHERE department_id IN (2, 3);",
      explanation: 'Matches employees in either Sales or Marketing without repeating OR.',
    },
  ],
  commonMistakes: [
    'Mixing AND and OR without parentheses. AND is evaluated first, which can silently change the result.',
    'Expecting BETWEEN to be exclusive. It includes both boundary values.',
    'Forgetting that LIKE without a wildcard is just equality; you need % or _ to match patterns.',
  ],
  interviewQuestions: [
    {
      q: 'How is IN (1, 2, 3) related to OR?',
      a: 'It is shorthand for col = 1 OR col = 2 OR col = 3. It reads better and is easier to maintain.',
    },
    {
      q: 'What is the difference between % and _ in LIKE?',
      a: '% matches any number of characters including none, while _ matches exactly one character.',
    },
  ],
  practice: [
    {
      id: 'filtering-q1',
      difficulty: 'beginner',
      datasetId: 'company',
      statement: "Return all columns for orders whose status is 'completed'.",
      hints: ["Filter with WHERE status = 'completed'."],
      solution: "SELECT * FROM orders WHERE status = 'completed';",
    },
    {
      id: 'filtering-q2',
      difficulty: 'easy',
      datasetId: 'company',
      statement:
        'Return the name and department_id of employees who work in department 1 or department 2.',
      hints: ['Use IN (1, 2) instead of two OR conditions.'],
      solution: 'SELECT name, department_id FROM employees WHERE department_id IN (1, 2);',
    },
    {
      id: 'filtering-q3',
      difficulty: 'easy',
      datasetId: 'company',
      statement: 'Return the name and country of customers who are not located in the USA.',
      hints: ["Use <> 'USA' or NOT country = 'USA'."],
      solution: "SELECT name, country FROM customers WHERE country <> 'USA';",
    },
    {
      id: 'filtering-q4',
      difficulty: 'medium',
      datasetId: 'company',
      statement: 'Return the name and price of products priced between 200 and 1000 inclusive.',
      hints: ['BETWEEN includes both endpoints.'],
      solution: 'SELECT name, price FROM products WHERE price BETWEEN 200 AND 1000;',
    },
    {
      id: 'filtering-q5',
      difficulty: 'medium',
      datasetId: 'company',
      statement: "Return the name of products whose name contains the word 'License'.",
      hints: ["Use LIKE '%License%'."],
      solution: "SELECT name FROM products WHERE name LIKE '%License%';",
    },
    {
      id: 'filtering-q6',
      difficulty: 'hard',
      datasetId: 'company',
      statement:
        'Return the name and hire_date of employees hired during the year 2020, sorted by hire_date ascending.',
      orderMatters: true,
      hints: [
        "A date range like hire_date BETWEEN '2020-01-01' AND '2020-12-31' isolates the year.",
        'Sort with ORDER BY hire_date.',
      ],
      solution:
        "SELECT name, hire_date FROM employees WHERE hire_date BETWEEN '2020-01-01' AND '2020-12-31' ORDER BY hire_date;",
    },
  ],
};
