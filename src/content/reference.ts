export interface ReferenceEntry {
  command: string;
  category: string;
  syntax: string;
  explanation: string;
  example: string;
  commonMistakes: string[];
  miniExercise: string;
}

// A quick-access library of the core SQL commands. It powers the dockable
// reference window and feeds the flashcard deck. Kept as plain data so it is
// easy to extend.
export const reference: ReferenceEntry[] = [
  {
    command: 'SELECT',
    category: 'Basics',
    syntax: 'SELECT column1, column2 FROM table;',
    explanation: 'Reads columns from a table. Use * for every column while exploring.',
    example: 'SELECT name, salary FROM employees;',
    commonMistakes: ['Selecting * in production code where the column set should be stable.'],
    miniExercise: 'Select the name and city of every customer.',
  },
  {
    command: 'WHERE',
    category: 'Filtering',
    syntax: 'SELECT ... FROM table WHERE condition;',
    explanation: 'Keeps only the rows that match a condition. Text uses single quotes.',
    example: "SELECT name FROM customers WHERE country = 'USA';",
    commonMistakes: ['Using double quotes for text values; SQLite reads them as identifiers.'],
    miniExercise: 'Return employees who earn more than 100000.',
  },
  {
    command: 'ORDER BY',
    category: 'Basics',
    syntax: 'SELECT ... FROM table ORDER BY column [ASC|DESC];',
    explanation: 'Sorts the result. ASC is the default; DESC sorts high to low.',
    example: 'SELECT name, salary FROM employees ORDER BY salary DESC;',
    commonMistakes: ['Expecting a sort without ORDER BY; row order is otherwise not guaranteed.'],
    miniExercise: 'List products from most to least expensive.',
  },
  {
    command: 'GROUP BY',
    category: 'Aggregation',
    syntax: 'SELECT col, AGG(x) FROM table GROUP BY col;',
    explanation: 'Splits rows into groups and runs an aggregate once per group.',
    example: 'SELECT status, COUNT(*) FROM orders GROUP BY status;',
    commonMistakes: ['Selecting a non-aggregated column that is not in GROUP BY.'],
    miniExercise: 'Count how many employees are in each department.',
  },
  {
    command: 'HAVING',
    category: 'Aggregation',
    syntax: 'SELECT col, AGG(x) FROM table GROUP BY col HAVING AGG(x) > n;',
    explanation: 'Filters groups after aggregation, unlike WHERE which filters rows before.',
    example: 'SELECT department_id, COUNT(*) FROM employees GROUP BY department_id HAVING COUNT(*) > 2;',
    commonMistakes: ['Putting an aggregate in WHERE instead of HAVING.'],
    miniExercise: 'Find departments with more than two employees.',
  },
  {
    command: 'INNER JOIN',
    category: 'Joins',
    syntax: 'SELECT ... FROM a JOIN b ON a.key = b.key;',
    explanation: 'Returns rows that have a match in both tables.',
    example: 'SELECT e.name, d.name FROM employees e JOIN departments d ON e.department_id = d.id;',
    commonMistakes: ['Forgetting the ON clause, which produces a cross join.'],
    miniExercise: 'Pair each order with the name of its customer.',
  },
  {
    command: 'LEFT JOIN',
    category: 'Joins',
    syntax: 'SELECT ... FROM a LEFT JOIN b ON a.key = b.key;',
    explanation: 'Keeps every row from the left table, filling missing right-side columns with NULL.',
    example: 'SELECT c.name, COUNT(o.id) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id;',
    commonMistakes: ['Counting * instead of the right-side key, which counts unmatched rows as 1.'],
    miniExercise: 'List every customer with their order count, including those with none.',
  },
  {
    command: 'DISTINCT',
    category: 'Basics',
    syntax: 'SELECT DISTINCT column FROM table;',
    explanation: 'Removes duplicate rows from the result.',
    example: 'SELECT DISTINCT category FROM products;',
    commonMistakes: ['Assuming DISTINCT applies to one column when it applies to the whole row.'],
    miniExercise: 'List the distinct countries customers come from.',
  },
  {
    command: 'COUNT / SUM / AVG',
    category: 'Aggregation',
    syntax: 'SELECT COUNT(*), SUM(col), AVG(col) FROM table;',
    explanation: 'Aggregate functions that summarise many rows into one value.',
    example: 'SELECT AVG(salary) FROM employees;',
    commonMistakes: ['Confusing COUNT(*) with COUNT(col); the latter ignores NULLs.'],
    miniExercise: 'Find the average product price.',
  },
  {
    command: 'LIMIT',
    category: 'Basics',
    syntax: 'SELECT ... ORDER BY col DESC LIMIT n;',
    explanation: 'Caps the number of rows returned, used with ORDER BY for top-N lists.',
    example: 'SELECT name FROM employees ORDER BY salary DESC LIMIT 3;',
    commonMistakes: ['Using LIMIT without ORDER BY and expecting a meaningful top-N.'],
    miniExercise: 'Return the five most recent orders.',
  },
];

export const referenceCategories = Array.from(new Set(reference.map((r) => r.category)));
