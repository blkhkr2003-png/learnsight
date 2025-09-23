// types/index.ts
export type Role = "student" | "teacher" | "parent" | "admin";

export interface UserDoc {
  uid: string;
  name: string;
  email: string;
  role: Role;
  isApproved?: boolean;
  createdAt?: any; // Firestore Timestamp | FieldValue | Date
  lastLogin?: any; // Firestore Timestamp | FieldValue | Date
}

export interface AdminUserDoc {
  uid: string;
  name: string;
  email: string;
  role: Role;
  isApproved: boolean;
  createdAt: FirebaseFirestore.Timestamp;
  lastLogin: FirebaseFirestore.Timestamp;
}

/* Learning models */
export type Fundamental =
  | "listening"
  | "grasping"
  | "retention"
  | "application";

export interface AnswerRecord {
  questionId: string;
  correct: boolean;
  difficulty: number;
  timestamp: FirebaseFirestore.Timestamp;
  fundamentals?: Partial<Record<Fundamental, number>>;
}

export interface DiagnosticSession {
  id?: string;
  userId: string;
  startedAt: FirebaseFirestore.Timestamp;
  endedAt?: FirebaseFirestore.Timestamp;
  answers: AnswerRecord[];
  aggregates?: Record<Fundamental, number>;
}

export interface Question {
  id: string;
  text: string;
  choices?: string[];
  correctChoice?: number;
  difficulty: number; // 1..5
  fundamentals?: Partial<Record<Fundamental, number>>;
}
