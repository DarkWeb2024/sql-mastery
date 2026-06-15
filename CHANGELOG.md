# Changelog

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
