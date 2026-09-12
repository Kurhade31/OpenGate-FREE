# GATE Free Platform

Free, open-source, student-first GATE 2027 preparation platform. Static-first, no-backend MVP: official info, syllabus, papers, guides, original practice, PYQ navigation and local-first tools. No login required.

- Stack: Astro + TypeScript + Zod + Vitest, static output, Cloudflare Pages.
- Data: versioned JSON in `data/` with `lastVerified` + sources.
- Tools: planner, revision, mistake tracker, mock analyser — all localStorage, schema v1, export/import.

## Quick start

Requires Node 22.

```bash
npm install          # or npm ci (lockfile committed)
npm run dev          # http://localhost:4321
npm run typecheck
npm run lint
npm run validate:data
npm run validate:sources
npm run check:links
npm run test
npm run build        # static output → dist/
npm run preview
```

## Configuration

- `SITE_URL` (optional env): production canonical URL. Defaults to `https://gate-free-platform.pages.dev`. No other env vars; no secrets anywhere.
- Cloudflare Pages: preset Astro, build `npm run build`, output `dist`, production branch `main`, Node 22. Security/caching headers in `public/_headers`.

## Docs

`docs/architecture.md`, `docs/content-model.md`, `docs/deployment.md`, `docs/content-policy.md`, `docs/data-provenance.md`, `docs/source-verification.md`, `docs/maintenance.md`, `docs/roadmap.md`, `docs/contribution.md`. Plus `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`.

## Deployment (Cloudflare Pages)

1. Push to GitHub (`main`).
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect GitHub repo.
3. Framework preset: Astro. Build: `npm run build`. Output: `dist`. Production branch: `main`.
4. Deploy → platform URL → verify → Search Console → submit `/sitemap-index.xml`.

See `docs/deployment.md`, `docs/architecture.md`, `docs/content-policy.md`, `docs/data-provenance.md`.

## Status

Functional launch verified locally: 102 static pages, test engine (MCQ/MSQ/NAT + timer + analysis), mock center, PYQ bank + detail pages, 8 lessons, syllabus explorer, dashboard, revision center, 11 tools, search with suggestions. No fake counts, no placeholder buttons, no console-critical paths. Remaining manual steps: create GitHub repo + push, connect Cloudflare Pages, Search Console sitemap, optional domain later.

Independent student project — not affiliated with GATE / IIT Madras / IISc / IITs.
