# Architecture

## Overview

SQL Mastery is a single-page React application with no backend. Everything,
including SQL execution, happens in the browser. This keeps hosting free and
makes the app fast and private: a learner's progress never leaves their device.

```
Browser
  React app (Vite build)
    Router (hash based)
    Feature pages: roadmap, playground, topic, practice, dashboard, certificate
    Content (typed data): topics, datasets, tracks
    Engine: sql.js (SQLite compiled to WebAssembly)
    Progress store: Zustand persisted to localStorage
```

## Layers

### Content (`src/content`)

Topics, practice questions, datasets, and career tracks are plain typed data,
not components. A topic carries its theory, worked examples, common mistakes,
interview questions, and practice questions. A dataset carries the SQL needed to
create and populate its tables. Separating content from presentation means new
topics or whole new subjects can be added without touching the UI.

### Engine (`src/lib/sqlEngine.ts`)

Loads sql.js once, seeds a database per dataset, and runs queries. Databases are
cached by dataset id so repeated runs are cheap. The WebAssembly binary is
served as a static asset.

### Validation (`src/lib/validate.ts`)

Compares a learner's result against the expected result. The expected result is
produced by running the question's canonical solution through the same engine at
check time, so the answer can never drift from the data. Comparison ignores
column order and is forgiving about number formatting; row order only matters
when the question explicitly asks for sorting.

### Progress (`src/features/progress/store.ts`)

A Zustand store persisted to localStorage holds experience points, solved
questions, completed topics, the daily streak, and issued certificates. Level
and streak logic are pure functions, which keeps them easy to test.

### Routing and layout (`src/app`)

A hash router is used so deep links work on static hosts with no server
rewrites. The layout provides the navigation bar, the theme toggle, and the
live XP and streak indicators.

## Extensibility

The roadmap renders every topic, including ones that only have a stub. Adding
real content for a topic is a matter of filling in its module. Because content
is keyed by track, adding a new subject such as Python is the same pattern: new
content modules plus a new entry in the track registry, with no changes to the
engine, validation, or pages.
