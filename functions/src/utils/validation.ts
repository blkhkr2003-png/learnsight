import { z } from 'zod';

export const UserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1),
  role: z.enum(['student', 'teacher', 'parent', 'admin']),
  profile: z.object({
    grade: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
});

export const QuestionSchema = z.object({
  stem: z.string().min(1),
  type: z.enum(['mcq', 'open', 'numeric']),
  choices: z.array(z.object({
    id: z.string(),
    text: z.string(),
  })).optional(),
  answer: z.string(),
  difficulty: z.number().min(0).max(1),
  tags: z.array(z.string()),
  subject: z.string().optional(),
  skill: z.string().optional(),
});

export const ResponseSchema = z.object({
  questionId: z.string(),
  selected: z.string(),
  durationMs: z.number().min(0),
  hintsUsed: z.number().min(0).default(0),
});

export const PracticeGenerateSchema = z.object({
  skills: z.array(z.string()).optional(),
  difficulty: z.number().min(0).max(1).optional(),
  count: z.number().min(1).max(50).default(10),
});

export const LLMExplainSchema = z.object({
  questionId: z.string(),
  userAnswer: z.string().optional(),
  includeHint: z.boolean().default(false),
});

export const QueryQuestionsSchema = z.object({
  tags: z.array(z.string()).optional(),
  difficulty: z.number().min(0).max(1).optional(),
  difficultyRange: z.number().min(0).max(1).default(0.2),
  limit: z.number().min(1).max(100).default(20),
  skill: z.string().optional(),
  subject: z.string().optional(),
});