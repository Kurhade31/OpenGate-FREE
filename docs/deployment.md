# Deployment (Cloudflare Pages)

Preferred production target (static-first, free tier suitable for MVP).

1. Create a public GitHub repo (e.g. `gate-free-platform`), push `main`.
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git → select repo.
3. Settings: Framework preset `Astro`, Build command `npm run build`, Output `dist`, Production branch `main`, Node 22.
4. Deploy. You get `https://<project>.pages.dev`.
5. Verify: `/`, `/sitemap-index.xml`, `/robots.txt`, `/search-index.json`, one paper page, one tool.
6. Google Search Console → add property → submit sitemap → inspect key URLs.
7. Custom domain later (only when useful): Pages → Custom domains → add `www` + apex.

Rollbacks: Pages deployments list → rollback. Code: `git revert`. Never edit production manually.
