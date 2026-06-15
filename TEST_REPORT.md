# Test report

## Automated tests

Run with `npm run test` (Vitest). Latest run: 78 tests across 12 files, all
passing. Phase 3 added coverage for the mastery model (`src/lib/mastery.test.ts`),
the adaptive engine (`src/lib/adaptive.test.ts`), tree state derivation
(`src/lib/treeState.test.ts`), learning analytics (`src/lib/analytics.test.ts`),
and the AI mentor router and offline provider (`src/lib/ai/ai.test.ts`).

| Area                | File                                          | What it covers                                                                 |
|---------------------|-----------------------------------------------|--------------------------------------------------------------------------------|
| Result comparison   | `src/lib/validate.test.ts`                    | Unordered and ordered matching, column and row count mismatches, numbers, NULL |
| Progress logic      | `src/lib/progressLogic.test.ts`               | Streak date math, the level curve, and the accuracy metric                     |
| Spaced repetition   | `src/lib/srs.test.ts`                         | Scheduler intervals, ease floor, resets on a miss, and due dates               |
| Components          | `src/components/components.test.tsx`          | ResultGrid rendering (errors, rows, NULL) and the markdown renderer            |
| Reference window    | `src/features/reference/ReferenceWindow.test.tsx` | Opens, switches command, closes, and passes an axe accessibility check    |
| Landing page        | `src/features/landing/LandingPage.test.tsx`   | Renders brand and courses, and passes an axe accessibility check               |
| Content integrity   | `tests/contentIntegrity.test.ts`              | Every practice solution runs against real SQLite and agrees with the validator |

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

- Landing page renders with the Khwarizmi brand and multi-course catalog.
- Roadmap renders all topic nodes with prerequisite edges and "coming soon"
  markers; clicking an available node opens its lesson.
- Playground executes a real query against the seeded database and shows the
  correct rows.
- Practice IDE: resizable panels render with question, schema, editor, and
  results; solving a question is detected as correct, awards experience points,
  records the attempt for accuracy, autosaves the draft, and persists to
  localStorage.
- Command reference window opens with all controls (pin, minimise, maximise,
  close) and switches the selected command.
- Settings apply live: high-contrast class is added and the font size changes;
  preferences persist.
- Certificate page renders the exam intro with the name field and start control.
- Existing saved progress still loads after the store migration.
- Light and dark themes both apply; layout holds at mobile width.
- No console errors during the flows above.

## Known limitations

- Monaco editor assets load from a CDN, so the editor needs network access on
  first load.
- The leaderboard from the original brief is deferred because it requires a
  shared backend; progress is per-device by design.
- Certificate verification is local to the device that took the exam, since
  there is no server to store records centrally.
