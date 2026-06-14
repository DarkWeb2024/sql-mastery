# SQL Mastery

A practice-first platform for learning SQL from the basics through to advanced
topics. It pairs short theory with a large amount of hands-on practice: an
interactive roadmap, an in-browser SQL playground, graded practice questions, a
certification exam, and progress tracking.

The whole thing runs in the browser. SQL executes against a real SQLite database
compiled to WebAssembly, so there is no backend to run or pay for, and it can be
hosted on any static host.

## Features

- Interactive roadmap of SQL topics with prerequisite ordering.
- In-browser SQL playground with a Monaco editor and a realistic sample dataset.
- Graded practice questions across five difficulty levels. Answers are checked
  by running your query and comparing the result to the canonical solution.
- Certification exam with a timer, randomised questions, and a downloadable
  certificate of completion.
- Progress tracking: experience points, levels, a daily streak, achievements,
  and per-topic completion, all stored locally in the browser.
- Light and dark themes, responsive from mobile to desktop.

## Tech stack

React, TypeScript, Vite, Tailwind CSS, React Router, Zustand, React Flow,
Monaco, sql.js (SQLite via WebAssembly), and jsPDF.

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
