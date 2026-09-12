import type { APIRoute } from 'astro';
import papers from '../../data/gate/2027/papers.json';
import cs from '../../data/subjects/cs.json';
import ec from '../../data/subjects/ec.json';
import ee from '../../data/subjects/ee.json';
import me from '../../data/subjects/me.json';
import ce from '../../data/subjects/ce.json';
import da from '../../data/subjects/da.json';
import resources from '../../data/resources/resources.json';
import questions from '../../data/questions/original.json';
import pyq from '../../data/questions/pyq.json';
import topics from '../../data/learn/topics.json';
import formulas from '../../data/formulas.json';

export const GET: APIRoute = async () => {
  interface PaperRow { code: string; name: string }
  interface SubjectRow { name: string; paper: string; description: string; topics: string[] }
  interface ResourceRow { title: string; provider: string; why: string }
  interface QuestionRow { paper: string; subject: string; topic: string; question: string; id: string; year?: number }
  interface TopicRow { id: string; paper: string; subjectSlug: string; slug: string; title: string; description: string }
  interface FormulaRow { id: string; title: string; subject: string; topic: string; formula: string }
  const paperRows = papers as unknown as PaperRow[];
  const csRows = cs as unknown as SubjectRow[];
  const ecRows = ec as unknown as SubjectRow[];
  const eeRows = ee as unknown as SubjectRow[];
  const meRows = me as unknown as SubjectRow[];
  const ceRows = ce as unknown as SubjectRow[];
  const daRows = da as unknown as SubjectRow[];
  const resourceRows = resources as unknown as ResourceRow[];
  const questionRows = [...(questions as unknown[]), ...(pyq as unknown[])] as unknown as QuestionRow[];
  const topicRows = topics as unknown as TopicRow[];
  const formulaRows = formulas as unknown as FormulaRow[];
  const docs: { title: string; url: string; kind: string; text: string }[] = [
    { title: 'Home — free GATE 2027 platform', url: '/', kind: 'page', text: 'free GATE 2027 preparation open source practice tools dashboard' },
    { title: 'GATE 2027 hub', url: '/gate-2027/', kind: 'guide', text: 'GATE 2027 IIT Madras overview dates papers syllabus pattern score rank PSU' },
    { title: 'Official information', url: '/gate-2027/official/', kind: 'official', text: 'official GATE 2027 links brochure syllabus dates' },
    { title: 'Important dates', url: '/gate-2027/important-dates/', kind: 'official', text: 'registration GOAPS admit card answer key result scorecard rectification exam' },
    { title: 'Syllabus guide', url: '/gate-2027/syllabus/', kind: 'guide', text: 'revised syllabus PDF RA robotics automation' },
    { title: 'Syllabus explorer', url: '/syllabus/', kind: 'tool', text: 'syllabus branch subject topic completion progress notes revision' },
    { title: 'Exam pattern', url: '/gate-2027/exam-pattern/', kind: 'guide', text: '100 marks aptitude MCQ MSQ NAT marking negative score rank PSU admission' },
    { title: 'Eligibility', url: '/gate-2027/eligibility/', kind: 'guide', text: 'eligibility degree final year brochure' },
    { title: 'Application guide', url: '/gate-2027/application/', kind: 'guide', text: 'GOAPS DigiLocker application photo signature' },
    { title: 'All papers', url: '/gate-2027/papers/', kind: 'guide', text: paperRows.map((p: PaperRow) => `${p.code} ${p.name}`).join(' ') },
    { title: 'Learn', url: '/learn/', kind: 'guide', text: 'topics subjects prerequisites lessons formulas mistakes' },
    { title: 'Practice', url: '/practice/', kind: 'tool', text: 'practice questions MCQ MSQ NAT explanations' },
    { title: 'Test engine', url: '/practice/test/', kind: 'tool', text: 'custom test timer palette negative marking analysis retry mock' },
    { title: 'Mock tests', url: '/mock/', kind: 'tool', text: 'full subject topic custom mock timed analysis' },
    { title: 'PYQ bank', url: '/pyq/', kind: 'guide', text: 'previous year questions PYQ year paper subject topic search' },
    { title: 'Dashboard', url: '/dashboard/', kind: 'tool', text: 'progress accuracy streak revision mistakes targets export' },
    { title: 'Revision center', url: '/revision/', kind: 'tool', text: 'revision queued saved formulas mistakes checklist' },
    { title: 'Tools', url: '/tools/', kind: 'tool', text: 'study planner revision mistake mock calculator converter percentage pomodoro formula marks random' },
    { title: 'Calculator', url: '/tools/calculator/', kind: 'tool', text: 'scientific calculator sqrt trig log' },
    { title: 'Unit converter', url: '/tools/unit-converter/', kind: 'tool', text: 'length mass temperature pressure energy power converter' },
    { title: 'Pomodoro', url: '/tools/pomodoro/', kind: 'tool', text: 'focus timer study sessions' },
    { title: 'Formula reference', url: '/tools/formula-reference/', kind: 'tool', text: 'formulas sheet waiting subnet carnot F1' },
    { title: 'Marks calculator', url: '/tools/marks-calculator/', kind: 'tool', text: 'GATE marks negative score calculator' },
    { title: 'Resources', url: '/resources/', kind: 'resource', text: 'free books lectures NPTEL notes' },
    { title: 'Beginner guide', url: '/guides/beginner/', kind: 'guide', text: 'beginner start preparation without coaching' },
    { title: 'Preparation guide', url: '/guides/preparation/', kind: 'guide', text: 'preparation strategy study plan revision' },
    { title: 'Study plan', url: '/guides/study-plan/', kind: 'guide', text: 'study plan weekly revision mocks' },
    { title: 'PYQ guide', url: '/guides/pyq-guide/', kind: 'guide', text: 'how to use PYQ topic-wise mistakes' },
  ];
  for (const p of paperRows) {
    docs.push({ title: `${p.code} — ${p.name}`, url: `/gate-2027/papers/${p.code.toLowerCase()}/`, kind: 'paper', text: `${p.code} ${p.name} syllabus practice` });
  }
  const groups: Record<string, SubjectRow[]> = { cs: csRows, ec: ecRows, ee: eeRows, me: meRows, ce: ceRows, da: daRows };
  for (const [slug, subs] of Object.entries(groups)) {
    docs.push({ title: `${slug.toUpperCase()} topics`, url: `/learn/${slug}/`, kind: 'subject-index', text: subs.map((s: SubjectRow) => s.name).join(' ') });
    for (const s of subs) {
      docs.push({ title: `${s.name} (${s.paper})`, url: `/learn/${slug}/`, kind: 'subject', text: `${s.name} ${s.description} ${s.topics.join(' ')}` });
      for (const t of s.topics) {
        docs.push({ title: `${s.name}: ${t}`, url: `/learn/${slug}/`, kind: 'topic', text: `${t} ${s.name}` });
      }
    }
  }
  for (const r of resourceRows) {
    docs.push({ title: r.title, url: '/resources/', kind: 'resource', text: `${r.title} ${r.provider} ${r.why}` });
  }
  for (const t of topicRows) {
    docs.push({ title: `${t.title} (${t.paper})`, url: `/learn/${t.paper.toLowerCase()}/${t.subjectSlug}/${t.slug}/`, kind: 'lesson', text: `${t.title} ${t.description}` });
  }
  for (const f of formulaRows) {
    docs.push({ title: `Formula: ${f.title}`, url: '/tools/formula-reference/', kind: 'formula', text: `${f.title} ${f.subject} ${f.topic} ${f.formula}` });
  }
  for (const q of questionRows) {
    const url = q.id.startsWith('pyq-') ? `/pyq/${q.id}/` : '/practice/test/?q=' + q.id;
    docs.push({ title: `${q.paper} ${q.year ? q.year + ' ' : ''}practice: ${q.topic}`, url, kind: q.id.startsWith('pyq-') ? 'pyq' : 'question', text: `${q.question} ${q.subject} ${q.topic}` });
  }
  return new Response(JSON.stringify(docs), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
};
