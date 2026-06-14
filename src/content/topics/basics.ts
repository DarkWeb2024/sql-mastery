import type { Topic } from '../../types';

export const basics: Topic = {
  id: 'basics',
  title: 'SELECT, WHERE, ORDER BY, LIMIT',
  category: 'Basics',
  summary: 'Read rows and columns, filter them, sort them, and limit how many come back.',
  prerequisites: [],
  theory: `
## Reading data with SELECT

Every SQL query starts by choosing what to read. \`SELECT\` lists the columns you
want and \`FROM\` names the table they come from.

\`\`\`sql
SELECT name, salary FROM employees;
\`\`\`

Use \`SELECT *\` to return every column. It is convenient while exploring, but in
real code you usually name the columns you need so the result stays stable when
the table changes.

## Filtering with WHERE

\`WHERE\` keeps only the rows that match a condition.

\`\`\`sql
SELECT name FROM employees WHERE salary > 100000;
\`\`\`

Text values are wrapped in single quotes (\`'USA'\`), numbers are not.

## Sorting with ORDER BY

\`ORDER BY\` sorts the result. \`ASC\` is ascending (the default) and \`DESC\` is
descending.

\`\`\`sql
SELECT name, salary FROM employees ORDER BY salary DESC;
\`\`\`

## Limiting rows with LIMIT

\`LIMIT\` caps how many rows come back, which is how you build "top N" lists when
combined with \`ORDER BY\`.

\`\`\`sql
SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3;
\`\`\`
`,
  examples: [
    {
      sql: "SELECT name, city FROM customers WHERE country = 'USA';",
      explanation: 'Returns only the customers whose country is the USA.',
    },
    {
      sql: 'SELECT DISTINCT category FROM products;',
      explanation: 'DISTINCT removes duplicate rows so each category appears once.',
    },
    {
      sql: 'SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3;',
      explanation: 'Sort highest salary first, then keep only the first three rows.',
    },
  ],
  commonMistakes: [
    'Using double quotes for text values. SQLite treats "USA" as an identifier; use single quotes \'USA\'.',
    'Expecting ORDER BY to apply before LIMIT is understood: LIMIT takes the rows after sorting, so order first, then limit.',
    'Comparing text with = and forgetting it is case sensitive for data values.',
  ],
  interviewQuestions: [
    {
      q: 'What is the difference between SELECT * and naming columns explicitly?',
      a: 'SELECT * returns every column, which is handy for exploring but fragile in production because the result changes if the table changes. Naming columns keeps the output stable and usually faster to read.',
    },
    {
      q: 'Does ORDER BY run before or after WHERE?',
      a: 'WHERE filters rows first, then ORDER BY sorts whatever survived the filter, and LIMIT is applied last.',
    },
  ],
  practice: [
    {
      id: 'basics-q1',
      difficulty: 'beginner',
      datasetId: 'company',
      statement: 'Select every column for all employees.',
      hints: ['Use SELECT * to return all columns.'],
      solution: 'SELECT * FROM employees;',
    },
    {
      id: 'basics-q2',
      difficulty: 'easy',
      datasetId: 'company',
      statement: 'Return the name of every customer located in the country USA.',
      hints: ["Filter with WHERE country = 'USA'.", 'Only select the name column.'],
      solution: "SELECT name FROM customers WHERE country = 'USA';",
    },
    {
      id: 'basics-q3',
      difficulty: 'easy',
      datasetId: 'company',
      statement: 'Return the name and salary of employees who earn more than 100000.',
      hints: ['Use a numeric comparison in WHERE.', 'Numbers are written without quotes.'],
      solution: 'SELECT name, salary FROM employees WHERE salary > 100000;',
    },
    {
      id: 'basics-q4',
      difficulty: 'medium',
      datasetId: 'company',
      statement:
        'Return the name and salary of the three highest paid employees, highest salary first.',
      orderMatters: true,
      hints: ['Sort with ORDER BY salary DESC.', 'Use LIMIT to keep only three rows.'],
      solution: 'SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3;',
    },
    {
      id: 'basics-q5',
      difficulty: 'medium',
      datasetId: 'company',
      statement: 'Return the list of distinct product categories.',
      hints: ['DISTINCT removes duplicate values.'],
      solution: 'SELECT DISTINCT category FROM products;',
    },
  ],
};
