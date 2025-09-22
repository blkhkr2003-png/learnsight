import { Timestamp } from 'firebase-admin/firestore';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  createdAt: Timestamp;
  profile: {
    grade?: string;
    timezone?: string;
    [key: string]: any;
  };
}

export interface Question {
  id: string;
  stem: string;
  type: 'mcq' | 'open' | 'numeric';
  choices?: Array<{ id: string; text: string }>;
  answer: string;
  difficulty: number; // 0-1 scale
  tags: string[];
  createdAt: Timestamp;
  subject?: string;
  skill?: string;
}

export interface StudentSkill {
  theta: number; // IRT ability parameter
  attempts: number;
  lastSeen: Timestamp;
  correctCount?: number;
  incorrectCount?: number;
}

export interface StudentSkills {
  skills: Record<string, StudentSkill>;
  updatedAt: Timestamp;
}

export interface Response {
  id: string;
  userId: string;
  questionId: string;
  submittedAt: Timestamp;
  durationMs: number;
  selected: string;
  correct: boolean;
  hintsUsed: number;
  score: number;
  skill?: string;
}

export interface PracticeQueue {
  userId: string;
  queue: string[]; // question IDs
  generatedAt: Timestamp;
  completedQuestions?: string[];
  currentIndex?: number;
}

export interface LLMCache {
  response: string;
  createdAt: Timestamp;
  ttlSeconds: number;
}

export interface AdaptiveConfig {
  targetDifficulty: number;
  difficultyRange: number;
  queueSize: number;
  includeRecentIncorrect: boolean;
}

export interface LearningFundamental {
  name: 'Listening' | 'Grasping' | 'Retention' | 'Application';
  score: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  weakAreas: string[];
  recommendations: string[];
}

export interface DiagnosticResult {
  userId: string;
  fundamentals: LearningFundamental[];
  overallScore: number;
  completedAt: Timestamp;
  responses: string[]; // response IDs
}