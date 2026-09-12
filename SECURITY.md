# Security Policy

## Scope

Static-first open-source educational site. No backend, no accounts, no server-side user data in the MVP.

## Guarantees

- No secrets, API keys, or tokens in the repository or in browser code.
- No arbitrary HTML from contributors: content is reviewed Markdown/JSON; user notes stay in the user's own browser.
- External links use `rel="noopener"`; forms never post to third parties.
- Security headers ship via `public/_headers` (nosniff, DENY framing, strict referrer, minimal permissions, CSP).
- Lockfile (`package-lock.json`) is committed; dependencies are few (Astro, sitemap, Zod; Vitest/tsx dev-only).

## Reporting a vulnerability

Open a GitHub issue titled `[security]` with impact and reproduction steps, or contact the maintainer via the repository. Do not open PRs with exploit details. Expect acknowledgement within 7 days.

## Out of scope

Social-engineering claims, coaching-site impersonation reports (send to the impersonated org), and localStorage data on a user's own device.
