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

export interface QuestionDoc {
  id?: string; // doc id
  question: string;
  difficulty: number; // 1..5
  choices?: string[];
  correctChoice?: number;
  fundamentals?: Partial<Record<Fundamental, number>>;
}

// A safe version of QuestionDoc to send to the frontend (no correct answers)
export type QuestionForClient = Omit<QuestionDoc, "correctChoice"> & {
  id: string;
};

export interface DiagnosticAttempt {
  id?: string;
  userId: string;
  startedAt: FirebaseFirestore.Timestamp;
  completedAt?: FirebaseFirestore.Timestamp;
  answers: {
    questionId: string;
    chosenIndex: number;
    correct: boolean;
  }[];
  aggregates?: Record<Fundamental, number>;
}

export interface PracticeTask {
  id: string;
  userId: string;
  fundamental: Fundamental;
  title: string;
  description: string;
  completed: boolean;
}
