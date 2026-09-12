# Architecture

Static-first, no-backend MVP.

```
Browser → Cloudflare Pages (static HTML/CSS/JS islands + search-index.json)
        → localStorage/IndexedDB (planner, attempts, mistakes, bookmarks, revision)
Future (only on real need): Workers → D1/KV/R2
```

- Frontend: Astro 5 + TypeScript strict, minimal client JS, CSS variables, accessible primitives.
- Data: `data/gate/2027/*` (exam, papers, dates, exam-rules), `data/subjects/*.json`, `data/questions/original.json`, `data/resources/*`, `data/provenance/sources.json`, `data/changelog.json`. Validated with Zod; build fails on critical errors.
- SEO: `@astrojs/sitemap`, canonical, OG/Twitter, robots.txt, 404, JSON-LD on home.
- Tests: Vitest unit (planner, revision, scoring); validation scripts; link checker.
- CI: GitHub Actions (typecheck, validate:data, test, build) + content-validation + weekly link check.
