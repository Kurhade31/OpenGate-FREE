# Content model

All content is versioned JSON in `data/`, validated with Zod (`src/lib/schemas.ts`); the build fails on critical errors (`npm run validate:data`).

## Types

- **Exam** (`data/gate/2027/exam.json`): edition, organiser, `sourceUrl`, `lastVerified`, important dates. Never hard-code dates in UI.
- **Paper** (`data/gate/2027/papers.json`): exactly 30 entries, 2-letter codes incl. RA.
- **Subject** (`data/subjects/*.json`): id, paper, name, slug, description, topics[], sources[].
- **TopicDetail** (`data/learn/topics.json`): intro, concept, explanation, example, formulas[], mistakes[], revisionNotes[], practiceQuestionIds[], pyqIds[], nextTopicId — the lesson template.
- **Question** (`data/questions/original.json`, `pyq.json`): MCQ/MSQ/NAT, options, answer (+correctOptions/tolerance), marks, negativeMarks, explanation, concepts, sourceLabel/sourceUrl. `pyq-reference` entries are representative drills, not verbatim copies.
- **Resource** (`data/resources/*.json`): title, provider, url, paper/subject, type, cost, why, lastChecked, status.
- **Formula** (`data/formulas.json`): paper/subject/topic, title, formula, note.
- **Source** (`data/provenance/sources.json`): id, url, authority, checkedAt, checkedBy, notes.
- **Changelog** (`data/changelog.json` + `CHANGELOG.md`).

## Relationships

Paper → Subject → TopicDetail → Questions (practice + PYQ) → Resources/Formulas. Lessons link next-topic; syllabus rows link learn/practice/PYQ — the knowledge graph.

## Local student data (browser only)

`gf-*` / `gatefree.v1.*` keys: topics, important, revision, notes, bookmarks, mistakes-v2, activity, streak, targets, sessions, mocks, planner. Schema v1, export/import/reset on `/dashboard/`. See `src/lib/progress.ts`, `src/lib/storage.ts`.
