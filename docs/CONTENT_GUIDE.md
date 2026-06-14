# Adding content

Content is data, not code. You can add topics and questions without touching any
component.

## Add a practice question

Open the topic module in `src/content/topics` and add an entry to its `practice`
array:

```ts
{
  id: 'joins-q7',            // unique across the whole app
  difficulty: 'medium',     // beginner | easy | medium | hard | expert
  datasetId: 'company',
  statement: 'Plain-English description of what to return.',
  hints: ['First nudge.', 'Second nudge.'],
  solution: 'SELECT ...;',  // the canonical, correct query
  orderMatters: true,       // include only when the answer must be sorted
  notes: 'Optional performance or alternative-solution discussion.',
}
```

You do not write the expected output by hand. The app runs your `solution` to
produce the expected result, and the content-integrity test runs every solution
to make sure it executes and is internally consistent. If `orderMatters` is
true, the test also checks that the solution contains an `ORDER BY`.

After adding a question, run `npm run test`. A failure means the solution has a
typo or the question is inconsistent.

## Turn a "coming soon" topic into a real one

1. Create a module in `src/content/topics`, for example `subqueries.ts`,
   exporting a full `Topic` (summary, theory, examples, common mistakes,
   interview questions, and practice).
2. Replace the matching `stub(...)` entry in `src/content/topics/index.ts` with
   an import of your module.

The roadmap, topic page, practice runner, and certification exam pick it up
automatically.

## Add a new dataset

Add a file to `src/content/datasets` exporting a `Dataset` with `seedSql`, then
register it in the `datasets` map. Questions reference it through `datasetId`.

## Add a new subject (for example Python)

The same content shape and track registry support entirely new subjects. Add the
topic modules and a new entry in `src/content/tracks.ts`. The engine, validation,
and pages do not change. SQL execution is specific to the SQL subject; a new
subject would supply its own execution approach behind the same question flow.
