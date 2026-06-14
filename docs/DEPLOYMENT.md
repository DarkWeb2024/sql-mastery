# Deployment

The app is a static site. It is deployed to GitHub Pages by a GitHub Actions
workflow on every push to `main`.

## How it works

`.github/workflows/deploy.yml` runs on each push to `main`:

1. Checks out the code and sets up Node 20.
2. Installs dependencies with `npm ci`.
3. Runs the test suite (`npm run test`).
4. Builds the production site (`npm run build`).
5. Uploads `dist` and deploys it to GitHub Pages.

If the tests fail, the deploy does not happen.

## The base path

The site is served from a project path, not the domain root, so Vite is
configured with `base: '/sql-mastery/'` for production builds (see
`vite.config.ts`). The app uses a hash router, so deep links such as
`#/playground` work without any server-side rewrite.

If you rename the repository, update `base` to match the new repository name,
otherwise the assets will 404.

## Enabling Pages (one-time)

In the repository, open Settings, then Pages, and set the source to
"GitHub Actions". After the next push to `main`, the workflow publishes the site
at:

```
https://<user>.github.io/sql-mastery/
```

## Local production preview

```bash
npm run build
npm run preview
```

## Other static hosts

The contents of `dist` can be served by any static host (Netlify, Cloudflare
Pages, and similar). If the host serves from the domain root, set `base` back to
`/`.
