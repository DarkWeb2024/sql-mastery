# Test report

## Automated tests

Run with `npm run test` (Vitest). Latest run: 43 tests across 4 files, all
passing.

| Area                | File                                | What it covers                                                                 |
|---------------------|-------------------------------------|--------------------------------------------------------------------------------|
| Result comparison   | `src/lib/validate.test.ts`          | Unordered and ordered matching, column and row count mismatches, numbers, NULL |
| Progress logic      | `src/lib/progressLogic.test.ts`     | Streak date math and the level curve                                           |
| Components          | `src/components/components.test.tsx`| ResultGrid rendering (errors, rows, NULL) and the markdown renderer            |
| Content integrity   | `tests/contentIntegrity.test.ts`    | Every practice solution runs against real SQLite and agrees with the validator |

The content-integrity test is the main correctness guard. It seeds the real
database and runs all 23 authored solutions, checks that each returns rows,
checks that "order matters" questions actually sort, and confirms question ids
are unique and datasets exist. A typo in any solution fails the build.

## Type checking

`npm run build` runs `tsc` with strict mode before bundling. No type errors.

## Production build

`npm run build` succeeds. The SQLite WebAssembly binary is emitted as a hashed
asset and the production base path is `/sql-mastery/`.

## Manual verification (browser)

Verified on a running dev server:

- Roadmap renders all topic nodes with prerequisite edges and "coming soon"
  markers; clicking an available node opens its lesson.
- Playground executes a real query against the seeded database and shows the
  correct rows.
- Practice: solving a question is detected as correct, awards experience points,
  and persists to localStorage.
- Certificate page renders the exam intro with the name field and start control.
- Light and dark themes both apply; layout holds at mobile width.
- No console errors during the flows above.

## Known limitations

- Monaco editor assets load from a CDN, so the editor needs network access on
  first load.
- The leaderboard from the original brief is deferred because it requires a
  shared backend; progress is per-device by design.
- Certificate verification is local to the device that took the exam, since
  there is no server to store records centrally.
