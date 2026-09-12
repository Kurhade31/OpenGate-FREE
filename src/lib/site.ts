export const SITE_NAME = 'GATE Free Platform';
export const SITE_TAGLINE = 'Free, open-source GATE 2027 preparation — information, practice and tools.';
export const DEFAULT_SITE_URL = 'https://gate-free-platform.pages.dev';

export function siteUrl(): string {
  // Astro injects SITE at build time; fall back for tests / scripts.
  try {
    // @ts-expect-error - Astro global available at runtime
    const s = globalThis?.Astro?.site?.toString?.();
    if (s) return s.replace(/\/$/, '');
  } catch { /* ignore */ }
  if (typeof process !== 'undefined' && process.env?.SITE_URL) {
    return String(process.env.SITE_URL).replace(/\/$/, '');
  }
  return DEFAULT_SITE_URL;
}

export interface SeoProps {
  title: string;
  description: string;
  canonicalPath: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  updatedAt?: string;
}

export function canonicalUrl(path: string): string {
  const base = siteUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
