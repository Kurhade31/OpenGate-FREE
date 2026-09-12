/**
 * Content + data validation. Fails the build on critical errors.
 * Run: npm run validate:data
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { ExamDataSchema, FormulaSchema, PaperSchema, QuestionSchema, ResourceSchema, SubjectSchema, TopicDetailSchema } from '../src/lib/schemas';

const root = process.cwd();
let errors: string[] = [];
let warnings: string[] = [];

function readJSON<T>(rel: string, schema: z.ZodTypeAny, label: string): T | null {
  const p = join(root, rel);
  if (!existsSync(p)) { errors.push(`Missing ${label}: ${rel}`); return null; }
  try {
    const raw = JSON.parse(readFileSync(p, 'utf8'));
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      errors.push(`Invalid ${label} ${rel}: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
      return null;
    }
    return parsed.data as T;
  } catch (e) {
    errors.push(`Unreadable ${label} ${rel}: ${(e as Error).message}`);
    return null;
  }
}

function readJSONArray<T>(rel: string, item: z.ZodTypeAny, label: string): T[] {
  const p = join(root, rel);
  if (!existsSync(p)) { errors.push(`Missing ${label}: ${rel}`); return []; }
  try {
    const raw = JSON.parse(readFileSync(p, 'utf8'));
    if (!Array.isArray(raw)) { errors.push(`${label} ${rel} must be an array`); return []; }
    const out: T[] = [];
    raw.forEach((entry: unknown, i: number) => {
      const r = item.safeParse(entry);
      if (!r.success) errors.push(`Invalid ${label}[${i}] ${rel}: ${r.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`).join('; ')}`);
      else out.push(r.data as T);
    });
    return out;
  } catch (e) {
    errors.push(`Unreadable ${label} ${rel}: ${(e as Error).message}`);
    return [];
  }
}

// 1. Exam data
readJSON('data/gate/2027/exam.json', ExamDataSchema, 'exam data');

// 2. Papers (30 expected)
const papers = readJSONArray('data/gate/2027/papers.json', PaperSchema, 'papers');
if (papers.length !== 30) errors.push(`papers.json must contain 30 papers, found ${papers.length}`);
{
  const codes = papers.map((p) => (p as { code: string }).code);
  const dupes = codes.filter((c, i) => codes.indexOf(c) !== i);
  if (dupes.length) errors.push(`Duplicate paper codes: ${[...new Set(dupes)].join(', ')}`);
  for (const must of ['CS', 'EC', 'EE', 'ME', 'CE', 'DA', 'RA']) {
    if (!codes.includes(must)) errors.push(`Missing required paper ${must}`);
  }
}

// 3. Subjects per paper
for (const f of ['cs', 'ec', 'ee', 'me', 'ce', 'da']) {
  const subs = readJSONArray(`data/subjects/${f}.json`, SubjectSchema, `subjects/${f}`);
  if (!subs.length) errors.push(`No subjects in data/subjects/${f}.json`);
  const slugs = subs.map((s) => (s as { slug: string }).slug);
  if (new Set(slugs).size !== slugs.length) errors.push(`Duplicate slugs in subjects/${f}.json`);
  for (const s of subs as { description: string; topics: string[]; name: string }[]) {
    if (s.description.length < 10) errors.push(`Subject ${s.name} description too short`);
    if (!s.topics.length) errors.push(`Subject ${s.name} has no topics`);
  }
}

// 4. Questions (original + pyq-reference, shared id space must be unique)
const questions = readJSONArray('data/questions/original.json', QuestionSchema, 'questions');
const pyqs = readJSONArray('data/questions/pyq.json', QuestionSchema, 'pyq');
const allQs = [...questions, ...pyqs] as { id: string; questionType: string; options: string[]; answer: string; correctOptions?: string[] }[];
{
  const ids = allQs.map((q) => q.id);
  if (new Set(ids).size !== ids.length) errors.push('Duplicate question ids across original+pyq');
  for (const q of allQs) {
    if ((q.questionType === 'MCQ' || q.questionType === 'MSQ') && q.options.length < 2) {
      errors.push(`Question ${q.id} (${q.questionType}) needs ≥2 options`);
    }
    if (q.questionType === 'MCQ' && !q.options.includes(q.answer)) {
      warnings.push(`Question ${q.id} MCQ answer not exactly matching an option (case-sensitive check)`);
    }
    if (q.questionType === 'MSQ' && !(q.correctOptions ?? []).length) {
      errors.push(`Question ${q.id} MSQ needs correctOptions`);
    }
  }
  // practice ids referenced by topics must exist
  try {
    const topicsRaw = JSON.parse(readFileSync(join(root, 'data/learn/topics.json'), 'utf8')) as { id: string; practiceQuestionIds: string[]; pyqIds: string[] }[];
    const idSet = new Set(ids);
    for (const t of topicsRaw) {
      for (const pid of [...(t.practiceQuestionIds ?? []), ...(t.pyqIds ?? [])]) {
        if (!idSet.has(pid)) errors.push(`Topic ${t.id} references missing question ${pid}`);
      }
    }
  } catch (e) { errors.push(`topics.json check failed: ${(e as Error).message}`); }
}

// 4b. Learn topics + formulas
const topics = readJSONArray('data/learn/topics.json', TopicDetailSchema, 'topics');
{
  const ids = topics.map((t) => (t as { id: string }).id);
  if (new Set(ids).size !== ids.length) errors.push('Duplicate topic ids');
}
readJSONArray('data/formulas.json', FormulaSchema, 'formulas');

// 5. Resources
const resources = readJSONArray('data/resources/resources.json', ResourceSchema, 'resources');
for (const r of resources as { url: string; title: string }[]) {
  try { new URL(r.url); } catch { errors.push(`Resource "${r.title}" has invalid URL`); }
}

// 6. Provenance
if (!existsSync(join(root, 'data/provenance/sources.json'))) errors.push('Missing data/provenance/sources.json');

// 7. Required routes (launch readiness)
const requiredPages = [
  'src/pages/index.astro', 'src/pages/gate-2027/index.astro', 'src/pages/gate-2027/official/index.astro',
  'src/pages/gate-2027/syllabus/index.astro', 'src/pages/gate-2027/exam-pattern/index.astro',
  'src/pages/gate-2027/important-dates/index.astro', 'src/pages/gate-2027/eligibility/index.astro',
  'src/pages/gate-2027/application/index.astro', 'src/pages/gate-2027/papers/index.astro',
  'src/pages/learn/index.astro', 'src/pages/practice/index.astro', 'src/pages/practice/test/index.astro',
  'src/pages/mock/index.astro', 'src/pages/pyq/index.astro',
  'src/pages/syllabus/index.astro', 'src/pages/dashboard/index.astro', 'src/pages/revision/index.astro',
  'src/pages/tools/index.astro', 'src/pages/resources/index.astro', 'src/pages/about/index.astro',
  'src/pages/contribute/index.astro', 'src/pages/report-error/index.astro', 'src/pages/privacy/index.astro',
  'src/pages/terms/index.astro', 'src/pages/changelog/index.astro', 'src/pages/search/index.astro',
  'src/pages/404.astro',
];
for (const p of requiredPages) if (!existsSync(join(root, p))) errors.push(`Missing required page: ${p}`);
if (!existsSync(join(root, 'public/robots.txt'))) errors.push('Missing public/robots.txt (SEO requirement)');

// Report
for (const w of warnings) console.warn(`WARN: ${w}`);
if (errors.length) {
  console.error(`\n✖ validate:data failed with ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
} else {
  console.log(`✔ validate:data passed (papers=${papers.length}, questions=${questions.length}+pyq=${pyqs.length}, topics=${topics.length}, resources=${resources.length}${warnings.length ? `, warnings=${warnings.length}` : ''})`);
}
