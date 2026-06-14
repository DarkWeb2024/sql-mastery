# Changelog

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
