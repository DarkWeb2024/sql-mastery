# Mizan

A practice-first platform for learning data and programming. "Mizan" means
balance and measure: the craft of weighing evidence and deciding well. SQL is
the first complete course, with more on the way. It pairs short theory with a
large amount of hands-on practice: an interactive knowledge tree, an IDE-style
practice workspace, an in-browser SQL playground, role-based missions, graded
questions, a certification exam, spaced-repetition review, and progress tracking.

The whole thing runs in the browser. SQL executes against a real SQLite database
compiled to WebAssembly, so there is no backend to run or pay for, and it can be
hosted on any static host. There are no accounts; progress is saved locally.

## Features

- Interactive roadmap of SQL topics with prerequisite ordering.
- HackerRank-style practice workspace with resizable, collapsible panels and
  autosaved drafts. Answers are checked by running your query and comparing the
  result to the canonical solution.
- In-browser SQL playground with a Monaco editor and a realistic sample dataset.
- A floating, draggable, dockable SQL command reference.
- Certification exam with a timer, randomised questions, and a downloadable
  certificate of completion.
- Learning depth: learning paths, skill radar, completion map, bookmarks,
  per-lesson markdown notes, and spaced-repetition review with weak-topic hints.
- Accessibility: keyboard navigation, ARIA, skip link, plus settings for text
  size, high contrast, reduced motion, and a colorblind-friendly palette.
- Light and dark themes, responsive from mobile to desktop.

See [CHANGELOG.md](CHANGELOG.md) for the full list of recent enhancements.

## Tech stack

React, TypeScript, Vite, Tailwind CSS, React Router, Zustand, React Flow,
react-resizable-panels, Monaco, sql.js (SQLite via WebAssembly), and jsPDF.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (by default http://localhost:5173).

## Scripts

- `npm run dev` - start the dev server.
- `npm run build` - type-check and build for production.
- `npm run preview` - serve the production build locally.
- `npm run test` - run the test suite (unit, components, and content integrity).

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Database](docs/DATABASE.md)
- [Adding content](docs/CONTENT_GUIDE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [User guide](docs/USER_GUIDE.md)

## A note on the certificate

The exam issues a "Certificate of Completion" with a verification ID. It is a
record of finishing the exam on this platform and does not represent any
external accreditation.
