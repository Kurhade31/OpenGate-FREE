import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Production URL: replaced with the actual Cloudflare Pages URL after first deploy.
// Start with the platform-provided URL; add a custom domain later (see docs/deployment.md).
const SITE = process.env.SITE_URL ?? 'https://gate-free-platform.pages.dev';

export default defineConfig({
  site: SITE,
  output: 'static',
  integrations: [sitemap()],
});
