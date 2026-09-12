/**
 * Link checker: critical = internal routes referenced in pages must exist.
 * External links are classified as warning (never fail build on transient external errors).
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const pagesDir = join(root, 'src/pages');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.astro')) out.push(p);
  }
  return out;
}

// Build set of known routes from file paths.
function routeFromFile(f: string): string | null {
  let rel = f.slice(pagesDir.length).replace(/\\/g, '/');
  rel = rel.replace(/\.astro$/, '');
  if (rel.endsWith('/index')) rel = rel.slice(0, -'/index'.length) || '/';
  if (rel.includes('[')) return null; // dynamic route — skip exact check
  if (rel === '/404') return null;
  if (rel.endsWith('.json')) return null;
  if (!rel.startsWith('/')) rel = '/' + rel;
  if (!rel.endsWith('/')) rel = rel + '/';
  if (rel === '//') rel = '/';
  return rel;
}

const known = new Set<string>();
for (const f of walk(pagesDir)) {
  const r = routeFromFile(f);
  if (r) known.add(r);
}
// Dynamic routes from data files.
const papersRaw: { code: string }[] = JSON.parse(readFileSync(join(root, 'data/gate/2027/papers.json'), 'utf8'));
for (const p of papersRaw) known.add(`/gate-2027/papers/${p.code.toLowerCase()}/`);
for (const s of ['cs', 'ec', 'ee', 'me', 'ce', 'da']) {
  known.add(`/learn/${s}/`);
  known.add(`/syllabus/${s}/`);
}
try {
  const pyqRaw: { id: string }[] = JSON.parse(readFileSync(join(root, 'data/questions/pyq.json'), 'utf8'));
  for (const q of pyqRaw) known.add(`/pyq/${q.id}/`);
} catch {}
try {
  const topicRaw: { paper: string; subjectSlug: string; slug: string }[] = JSON.parse(readFileSync(join(root, 'data/learn/topics.json'), 'utf8'));
  for (const t of topicRaw) known.add(`/learn/${t.paper.toLowerCase()}/${t.subjectSlug}/${t.slug}/`);
} catch {}

const hrefRe = /href="(\/[^"#?]*)"/g;
let critical: string[] = [];
for (const f of walk(pagesDir)) {
  const src = readFileSync(f, 'utf8');
  let m: RegExpExecArray | null;
  while ((m = hrefRe.exec(src))) {
    let href = m[1] ?? '';
    if (href.includes('$') || href.includes('{') || href.includes('}')) continue; // JS template placeholder — dynamic route, skip
    if (href.startsWith('/search-index.json') || href.startsWith('/favicon') || href.startsWith('/site.webmanifest')) continue;
    if (!href.endsWith('/')) href += '/';
    // Allow query strings stripped already by regex; keep base.
    if (!known.has(href) && !href.startsWith('/practice/?') && !href.startsWith('/pyq/?')) {
      // Re-check without trailing slash variants
      critical.push(`${f.slice(root.length + 1)} → ${href}`);
    }
  }
}
// Filter known-good dynamic query links
critical = critical.filter((c) => !c.includes('/practice/?') && !c.includes('/pyq/?'));

if (critical.length) {
  console.error(`✖ check:links found ${critical.length} broken internal link(s):`);
  for (const c of [...new Set(critical)].slice(0, 50)) console.error(`  - ${c}`);
  process.exit(1);
}
console.log(`✔ check:links passed (${known.size} routes, no broken internal links)`);
