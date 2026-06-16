# Changelog

## Rebrand — Khwarizmi is now Mizan

The product is renamed from Khwarizmi to Mizan ("balance" and "measure": the
craft of weighing evidence and deciding well), which fits the platform's focus on
data, analysis, and judgment, and is easier globally. Visible identity only; the
repository and URL remain unchanged. New tagline: "Where data becomes decisions."

## Phase 7 (partial) — command palette, AI Navigator, display type

A first slice of the "feels like a learning OS" direction, chosen for high impact
and low risk. The larger Phase 7 items that carry real cost or reverse prior
decisions (rebrand, sidebar nav, color overhaul, homepage deletion, terminology
rename) are intentionally deferred pending the founder's call and a real-user test.

- **Command palette (Cmd/Ctrl+K):** global jump-to-anything across concepts,
  missions, patterns, SQL commands, and destinations, with a header Search
  affordance. The signature interaction of tools like Linear and Raycast.
- **Always-present AI Navigator:** the mentor is now a slide-in sidebar available
  from any page, not just its own route.
- **Display typography:** Space Grotesk for headings (Inter for body, JetBrains
  Mono for code) for a more editorial, premium feel.

All additive; existing features and 122 tests unchanged.

## Phase 6 — Design System V1 and a tree that feels alive

A product-experience pass, in response to the board's concern that the
architecture had outrun the experience. The brief was to stop the product feeling
static, page-oriented, and engineer-built. No learning systems were changed.

- **Design System V1:** semantic design tokens with a new signature warm-gold
  accent paired with the brand blue, an elevation scale (shadows replacing
  borders-everywhere), motion tokens, and canonical UI primitives (Button, Card,
  Badge, IconButton) to end ad-hoc styling.
- **Icons:** adopted lucide, removing the text-glyph chrome that made the product
  look unfinished.
- **Navigation simplified:** from eight flat links to four primary destinations
  (Tree, Missions, Practice, Progress) plus a More menu, with an icon-led header.
- **Motion baseline:** route-change transitions, an animated detail panel and
  menus, and a success microinteraction (the XP badge pulses when you earn
  points). All gated by reduced-motion.
- **The Knowledge Tree is now a spatial canvas, not an outline.** Pan and zoom
  the whole of SQL as one map; hovering a node lights up its dependencies;
  clicking focuses the camera and opens a detail panel without leaving the map;
  node colour and a mastery bar form a live heatmap; a minimap aids orientation.
  This also merges the old separate roadmap (now redirects to the tree).
- Loading states are now skeletons instead of a bare spinner.

Tests remain at 122 (this was an experience pass; the learning engine is
unchanged). Next: put a real learner through it.

## Phase 5 — Mission Framework V1 (from query practice to professional thinking)

Board-approved build after the strategy review. The shift: SQL stops being the
objective and becomes the tool. A mission puts the learner in a role, gives them
a real business problem, and walks them through investigate → decide → calibrate
→ reflect → keep an artifact.

- **Mission Framework V1**, a Product-Layer runtime that runs over content it
  never hardcodes: validated investigation steps, a decision phase, confidence
  calibration, a reflection phase, and an exportable portfolio artifact.
- **First mission:** *Data Analyst at an e-commerce retailer — "Revenue dropped
  12%."* Five validated steps drill from the headline number down to the root
  cause (a returning-customer retention problem in Electronics), then the learner
  recommends an action and defends it. New `ecommerce` revenue dataset.
- **Confidence calibration** (how confident, supporting evidence, what would
  change your mind, most fragile assumption) — training judgment under
  uncertainty, not just correctness.
- **Reflection** promoted toward a first-class step (why this approach,
  alternatives, assumptions, what if the data changed); answers are captured, not
  auto-graded.
- **Analytical Patterns** and **Thinking Tags** added as first-class, reusable
  vocabularies (period-over-period, segment contribution, root-cause drill-down;
  problem-framing, decomposition, elimination, confidence-calibration, and more)
  and surfaced on missions.
- **Portfolio artifact export:** a Markdown report of the investigation,
  decision, confidence, and reasoning the learner keeps and can show. Evidence of
  thinking, not a completion badge.
- Product Layer (runtime, reflection, calibration, tags, artifact) is designed to
  survive if every SQL lesson were deleted; SQL, datasets, and missions are the
  Content Layer. Tests: 122 (mission steps validated against the engine).

Explicitly not built (per board): additional domains, accounts/cloud, the
Decision Graph inference engine, more strategy memos. Next decision is to come
from observing a real learner, not theory.

## Phase 4 — content depth (the engine finally has road)

The platform had a strong learning engine but very little to learn from. This
release roughly triples the practice content and adds the highest-value
interview topics, so the adaptive engine, knowledge tree, and review system now
operate on real depth.

- New fully authored topics, each with theory, examples, common mistakes,
  interview questions, and a validated practice bank:
  - **Subqueries** (scalar, IN/EXISTS, correlated, subqueries in FROM) — 12 questions.
  - **Common Table Expressions** (WITH, multiple CTEs, recursive) — 10 questions.
  - **Window Functions** (OVER, PARTITION BY, RANK/ROW_NUMBER, LAG/LEAD, running
    totals, moving averages, ratios) — 12 questions.
- New **Regional sales** dataset (region, rep, month, amount) purpose-built for
  window-function practice, alongside the existing company dataset. Datasets are
  now a registry so more can be added easily.
- These topics were previously "coming soon" stubs in the knowledge tree; they
  now show live status, completion, and mastery like every other built topic, and
  flow into Smart Practice, spaced-repetition review, and the certification exam
  automatically.
- The content-integrity test now seeds every dataset and validates all 34 new
  solutions against the correct one. Total tests: 112.

## Phase 3 — adaptive mastery engine, knowledge tree, and AI mentor

Built on top of Phase 2 with no existing feature removed and saved progress
preserved (store migrated to version 3 by merging in new fields).

### Interactive Knowledge Tree (the new centrepiece)

- A complete, hierarchical SQL syllabus from foundations through querying,
  aggregation, joins, subqueries, CTEs, window functions, set operations,
  database design, indexes, transactions, procedures, optimization, analytics,
  warehousing, interview prep, and projects.
- Every node shows live status (planned, locked, available, in progress,
  completed, mastered, needs revision, forgotten), completion and mastery
  percentages, difficulty, estimated time, interview importance, and its
  prerequisites. Status is shown by both colour and label.
- Expandable and collapsible branches; built nodes link straight to their lesson
  and practice. Future subjects (Python, Pandas, and more) render as locked
  sibling trees so the structure is a learning operating system, not one course.

### Adaptive mastery engine (deterministic, free, offline)

- A per-concept mastery model with a forgetting curve, so knowledge can be new,
  learning, weak, mastered, or forgotten over time.
- A knowledge graph over the topic prerequisites that drives unlocks and a
  next-best recommendation.
- Smart Practice with six modes (Beginner, Fast track, Interview, Project,
  Revision, Challenge) that apply retrieval, spacing, interleaving, and desirable
  difficulty quietly; the platform suggests the right mode automatically.

### AI mentor (optional, pluggable)

- An always-available offline mentor grounded in the platform's own lessons,
  plus optional hosted models (Gemini Flash, Groq) via a bring-your-own-key
  setting and a task-aware router. A hosted failure degrades to offline.
- AI question generation validates every generated query by running it against
  the real database and rejects anything broken or non-deterministic.
- The mentor is personalised with the learner's mastery profile and goal.

### Analytics, certification, accessibility

- Dashboard now shows mastery score, interview readiness, retention, and
  learning velocity from the mastery model.
- Certificates capture a competency breakdown and skills demonstrated, shown on
  the public verification page.
- Added a dyslexia-friendly text option to the accessibility settings.

### Docs and tests

- New `docs/CLOUD_SETUP.md` covering the optional AI keys and the Supabase /
  PostHog cloud layer (off by default; requires your own accounts).
- Tests grew to 78, covering the mastery model, adaptive selection, tree state,
  analytics, and the AI router.

## Phase 2 — Khwarizmi

A large set of additive upgrades. No existing feature was removed and saved
progress from before this release still loads (the progress store migrates by
merging in the new fields with safe defaults).

### Rebrand and multi-course

- Rebranded the product to Khwarizmi, after Al-Khwarizmi, with a new geometric
  star mark and updated page title, meta, and Open Graph tags.
- Repositioned as a multi-subject platform. New landing page at `/` and a course
  catalog at `/courses`. SQL is the complete course; Python, Java, and a working
  with AI course are shown as coming soon.
- The SQL roadmap moved to `/roadmap`; all previous routes still work.

### Practice experience

- Rebuilt practice into a resizable, HackerRank-style IDE layout: question,
  constraints, schema, and hints on the left; the editor on the right; results
  on the bottom. Panels resize and collapse, and their sizes are remembered.
- Drafts autosave per question and restore when you return.
- Questions can be bookmarked.

### SQL command reference

- Added a floating command reference window that is draggable, resizable, can be
  minimised, maximised, and pinned on top, with keyboard movement and Escape to
  close. Each command shows syntax, an explanation, an example, common mistakes,
  and a mini exercise.

### Accessibility (target WCAG 2.2 AA)

- Skip-to-content link, semantic landmarks, ARIA labels on navigation, dialogs,
  switches, and tables, and a visible focus ring for keyboard users.
- A settings panel for text size, high-contrast mode, reduced motion, and a
  colorblind-friendly palette. Reduced motion also follows the OS preference.

### Learning depth

- Learning paths page grouping topics by goal (Foundations, Analyst, Engineer).
- Dashboard skill radar by category, a topic completion map, an accuracy metric,
  and a recent-activity feed.
- Per-lesson markdown notes and a bookmarks page for saved lessons and questions.
- Spaced-repetition review built from lessons and the command reference, with a
  weak-topic recommendation list driven by practice accuracy.

### Performance and SEO

- Route-level code splitting with lazy loading and loading states. The former
  single large bundle is now split into per-route and per-vendor chunks (React,
  React Flow, sql.js, and the PDF library load only where needed).
- Added meta and Open Graph tags and a robots file.

### Testing

- Test count grew from 43 to 57: spaced-repetition scheduler, accuracy, the
  reference window, the landing page, and automated accessibility checks
  (vitest-axe) on the landing page and reference window, alongside the existing
  content-integrity and validation suites.
