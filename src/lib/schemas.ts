import { z } from 'zod';

export const SourceTypeSchema = z.enum(['official', 'editorial', 'community', 'analysis', 'verified-secondary']);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const SourceRefSchema = z.object({
  type: SourceTypeSchema,
  label: z.string().min(1),
  url: z.string().url(),
  verifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'verifiedAt must be YYYY-MM-DD'),
});
export type SourceRef = z.infer<typeof SourceRefSchema>;

export const PaperSchema = z.object({
  code: z.string().min(2).max(2),
  name: z.string().min(2),
  fullName: z.string().min(2),
});
export type Paper = z.infer<typeof PaperSchema>;

export const SubjectSchema = z.object({
  id: z.string().min(1),
  paper: z.string().min(2).max(2),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(10),
  topics: z.array(z.string().min(1)).min(1),
  sources: z.array(SourceRefSchema).default([]),
});
export type Subject = z.infer<typeof SubjectSchema>;

export const ResourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  provider: z.string().min(1),
  url: z.string().url(),
  paper: z.string().optional(),
  subject: z.string().optional(),
  type: z.enum(['Official', 'Book', 'Lecture', 'Notes', 'Practice', 'Tool', 'Reference', 'Community']),
  cost: z.enum(['Free', 'Freemium', 'Paid']),
  language: z.string().default('English'),
  why: z.string().min(10),
  lastChecked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['active', 'needs-review', 'archived']).default('active'),
});
export type ResourceItem = z.infer<typeof ResourceSchema>;

export const QuestionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['original', 'pyq-reference']),
  paper: z.string().min(2).max(2),
  subject: z.string().min(1),
  topic: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  year: z.number().int().min(1990).max(2030).optional(),
  marks: z.number().min(1).max(2).default(1),
  questionType: z.enum(['MCQ', 'MSQ', 'NAT']).default('MCQ'),
  question: z.string().min(10),
  options: z.array(z.string()).default([]),
  answer: z.string().min(1),
  explanation: z.string().min(10),
  concepts: z.array(z.string()).default([]),
  reviewStatus: z.enum(['draft', 'reviewed']).default('reviewed'),
  // v2 functional fields (all optional for backward compat)
  correctOptions: z.array(z.string()).optional(),
  tolerance: z.number().min(0).max(10).optional(),
  negativeMarks: z.number().min(0).max(2).optional(),
  sourceLabel: z.string().optional(),
  sourceUrl: z.string().url().optional(),
});
export type Question = z.infer<typeof QuestionSchema>;

export const TopicDetailSchema = z.object({
  id: z.string().min(1),
  paper: z.string().min(2).max(2),
  subjectSlug: z.string().min(1),
  subject: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(10),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  estimatedMinutes: z.number().int().min(5).max(600).default(60),
  subtopics: z.array(z.string()).default([]),
  intro: z.string().min(10),
  concept: z.string().min(10),
  explanation: z.string().min(10),
  example: z.string().min(10),
  formulas: z.array(z.string()).default([]),
  mistakes: z.array(z.string()).default([]),
  revisionNotes: z.array(z.string()).default([]),
  practiceQuestionIds: z.array(z.string()).default([]),
  pyqIds: z.array(z.string()).default([]),
  nextTopicId: z.string().optional(),
});
export type TopicDetail = z.infer<typeof TopicDetailSchema>;

export const FormulaSchema = z.object({
  id: z.string().min(1),
  paper: z.string().min(1),
  subject: z.string().min(1),
  topic: z.string().min(1),
  title: z.string().min(2),
  formula: z.string().min(1),
  note: z.string().min(1),
});
export type Formula = z.infer<typeof FormulaSchema>;

export const ExamDataSchema = z.object({
  exam: z.string(),
  edition: z.string(),
  organizingInstitute: z.string(),
  sourceUrl: z.string().url(),
  lastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  importantDates: z.object({
    registrationOpen: z.string(),
    regularRegistrationClose: z.string(),
    extendedRegistrationClose: z.string(),
    rectificationWindow: z.string(),
    cityAllotment: z.string(),
    examWindows: z.array(z.string()),
    resultDate: z.string(),
  }),
  notes: z.string(),
});
export type ExamData = z.infer<typeof ExamDataSchema>;
