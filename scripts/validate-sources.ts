/** Validate source registry entries (official URLs well-formed, check dates present). */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';

const SourceEntry = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  authority: z.string().min(1),
  checkedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkedBy: z.string().min(1),
  notes: z.string().min(1),
});

const p = join(process.cwd(), 'data/provenance/sources.json');
if (!existsSync(p)) { console.error('Missing data/provenance/sources.json'); process.exit(1); }
const raw = JSON.parse(readFileSync(p, 'utf8'));
if (!Array.isArray(raw)) { console.error('sources.json must be an array'); process.exit(1); }
let bad = 0;
raw.forEach((e: unknown, i: number) => {
  const r = SourceEntry.safeParse(e);
  if (!r.success) { console.error(`sources[${i}]: ${r.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`).join('; ')}`); bad++; }
  else if (r.data.authority === 'official' && !r.data.url.includes('gate2027.iitm.ac.in')) {
    console.warn(`WARN sources[${i}] official URL not on gate2027.iitm.ac.in: ${r.data.url}`);
  }
});
if (bad) { console.error(`✖ validate:sources failed (${bad})`); process.exit(1); }
console.log(`✔ validate:sources passed (${raw.length} entries)`);
