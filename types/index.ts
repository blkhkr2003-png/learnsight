// types/index.ts
export type Role = "student" | "teacher" | "parent" | "admin";

export interface UserDoc {
  uid: string;
  name: string;
  email: string;
  role: Role;
  teacherId?: string; // For students: the uid of their teacher
  classId?: string; // For teachers: the class they teach, for students: the class they belong to
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
    difficulty?: number;
    fundamentals?: Partial<Record<Fundamental, number>>;
  }[];
  expectedQuestionCount?: number; // ✅ add this
  aggregates?: Record<Fundamental, number>;
  lastServedQuestionId?: string; // ✅ NEW
}

export interface PracticeTask {
  id: string;
  userId: string;
  fundamental: Fundamental;
  title: string;
  description: string;
  completed: boolean;
}

export interface StudentDashboardData {
  name: string;
  lastDiagnostic: Date | null;
  fundamentals: {
    listening: number;
    grasping: number;
    retention: number;
    application: number;
  };
  recentPractices: {
    id: string;
    title?: string;
    completed: boolean;
    score?: number;
  }[];
  completedPractices: number;
  totalPractices: number;

  // New fields
  overallProgress?: number; // e.g., percentage 0-100
  practiceStreak?: number; // consecutive days
  recommendations?: string[]; // list of recommendations
  lastAttemptId?: string; // latest diagnostic attempt id
}

export interface PracticeSessionDoc {
  id: string;
  studentId: string;
  fundamental: Fundamental;
  completed: boolean;
  startTime: any; // Timestamp
  score?: number;
  title?: string;
}
