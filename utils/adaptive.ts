// /utils/adaptive.ts

export type FundamentalKey =
  | "listening"
  | "grasping"
  | "retention"
  | "application";

export interface LearningFundamental {
  name: "Listening" | "Grasping" | "Retention" | "Application";
  score: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  weakAreas: string[];
  recommendations: string[];
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  role: "student";
  fundamentals: LearningFundamental[];
  overallScore: number;
  practiceStreak: number;
  totalPracticeTime: number;
  lastActive: Date;
}

/**
 * DiagnosticQuestion is the *client-facing* shape used in mock generation / practice sessions.
 * difficulty here is a label. Real DB questions (QuestionDoc) use numeric difficulty 1..5.
 */
export interface DiagnosticQuestion {
  id: string;
  fundamental: LearningFundamental["name"];
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  timeLimit: number; // seconds
}

export interface PracticeSession {
  id: string;
  studentId: string;
  fundamental: LearningFundamental["name"];
  questions: DiagnosticQuestion[];
  startTime: Date;
  endTime?: Date;
  score?: number;
  completed: boolean;
}

/**
 * QuestionDoc represents the Firestore document shape for questions.
 * - difficulty is numeric 1..5 (so DB queries can be numeric).
 * - fundamentals map shows which fundamentals this question touches (weight > 0).
 */
export interface QuestionDoc {
  explanation: string;
  id?: string;
  question: string;
  options: string[];
  correctChoice?: number;
  difficulty: number; // 1..5
  fundamentals: Record<FundamentalKey, number>;
}

//  Client-safe question (no correctChoice)
export type QuestionForClient = Omit<QuestionDoc, "correctChoice"> & {
  id: string;
};

// Map numeric difficulty (1..5) -> label

export function numericToLabelDifficulty(
  n: number
): "easy" | "medium" | "hard" {
  if (n <= 2) return "easy";
  if (n <= 4) return "medium";
  return "hard";
}

// Map label difficulty -> representative numeric difficulty used for DB queries.
export function labelToNumericDifficulty(
  label: "easy" | "medium" | "hard"
): number {
  return label === "easy" ? 2 : label === "medium" ? 3 : 4;
}

// Adaptive learning algorithm
export class AdaptiveLearningEngine {
  static calculateDifficulty(
    studentScore: number,
    _fundamental?: LearningFundamental["name"]
  ): "easy" | "medium" | "hard" {
    if (studentScore < 40) return "easy";
    if (studentScore < 70) return "medium";
    return "hard";
  }

  // Convert score -> numeric starting difficulty for DB queries
  static calculateStartingDifficultyNumber(studentScore: number) {
    const label = this.calculateDifficulty(studentScore);
    return labelToNumericDifficulty(label);
  }

  /* Mock / demo practice question generator (client-side fallback / seed).
   * Replace with real DB or AI generator in production.
   */
  static generatePracticeQuestions(
    profile: StudentProfile,
    fundamental: LearningFundamental["name"],
    count = 5
  ): DiagnosticQuestion[] {
    const fundamentalData = profile.fundamentals.find(
      (f) => f.name === fundamental
    );
    const difficulty = this.calculateDifficulty(
      fundamentalData?.score || 0,
      fundamental
    );

    return Array.from({ length: count }, (_, i) => ({
      id: `q_${fundamental.toLowerCase()}_${i + 1}`,
      fundamental,
      difficulty,
      question: `${fundamental} practice question ${
        i + 1
      } (${difficulty} level)`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: `This tests your ${fundamental.toLowerCase()} skills at ${difficulty} level.`,
      timeLimit: difficulty === "easy" ? 30 : difficulty === "medium" ? 45 : 60,
    }));
  }

  /* Update an in-memory StudentProfile after a practice session.
  Note: this DOES NOT persist to DB; write the returned profile to Firestore yourself.
   */
  static updateStudentProfile(
    profile: StudentProfile,
    sessionResults: PracticeSession
  ): StudentProfile {
    const updatedFundamentals = profile.fundamentals.map((fundamental) => {
      if (fundamental.name === sessionResults.fundamental) {
        const newScore = Math.round(
          (fundamental.score + (sessionResults.score || 0)) / 2
        );
        return {
          ...fundamental,
          score: newScore,
          level: (newScore < 40
            ? "Beginner"
            : newScore < 70
            ? "Intermediate"
            : "Advanced") as LearningFundamental["level"],
        };
      }
      return fundamental;
    });

    return {
      ...profile,
      fundamentals: updatedFundamentals,
      overallScore: Math.round(
        updatedFundamentals.reduce((sum, f) => sum + f.score, 0) /
          updatedFundamentals.length
      ),
      practiceStreak: profile.practiceStreak + 1,
      lastActive: new Date(),
    };
  }
}

/* -------------------------
   Micro-level adaptive picker (selectNextQuestion)
   - Input: array of QuestionDoc (DB shape, numeric difficulties)
   - lastDifficulty: numeric 1..5
   - answeredCorrectly: boolean
   - excludedIds: optional to prevent repeats
   ------------------------- */

export function selectNextQuestion(
  questions: QuestionDoc[],
  lastDifficulty: number,
  answeredCorrectly: boolean,
  excludedIds: Set<string> | string[] = []
): QuestionDoc | null {
  const exclude =
    excludedIds instanceof Set ? excludedIds : new Set(excludedIds);
  // Decide the initial target difficulty
  let target = answeredCorrectly
    ? Math.min(lastDifficulty + 1, 5)
    : Math.max(lastDifficulty - 1, 1);

  // Helper to pick a random question at difficulty d that is not excluded
  const availableAt = (d: number) =>
    questions.filter((q) => q.difficulty === d && !exclude.has(q.id || ""));

  // Try exact target first
  let avail = availableAt(target);
  if (avail.length > 0) {
    return avail[Math.floor(Math.random() * avail.length)];
  }

  // Widen the search window (delta increases)
  for (let delta = 1; delta <= 4; delta++) {
    const lower = Math.max(1, target - delta);
    const upper = Math.min(5, target + delta);

    avail = availableAt(lower);
    if (avail.length > 0)
      return avail[Math.floor(Math.random() * avail.length)];

    avail = availableAt(upper);
    if (avail.length > 0)
      return avail[Math.floor(Math.random() * avail.length)];
  }

  // No candidate found
  return null;
}

/* -------------------------
   Small helpers to adapt between DB QuestionDoc and client DiagnosticQuestion
   ------------------------- */

/**
 * Convert a DB QuestionDoc to a DiagnosticQuestion (client-facing).
 * This strips correctChoice (so you don't expose answers) and maps numeric difficulty -> labeled difficulty.
 */
export function questionDocToDiagnosticQuestion(
  q: QuestionDoc
): DiagnosticQuestion {
  return {
    id: q.id || "unknown",
    fundamental: mapFundamentalsToName(q.fundamentals) || "Listening",
    difficulty: numericToLabelDifficulty(q.difficulty),
    question: q.question,
    options: q.options,
    correctAnswer: q.correctChoice ?? 0,
    explanation: q.explanation ?? "",
    timeLimit:
      numericToLabelDifficulty(q.difficulty) === "easy"
        ? 30
        : numericToLabelDifficulty(q.difficulty) === "medium"
        ? 45
        : 60,
  };
}

/**
 * A very simple heuristic: pick the fundamental with highest non-zero weight in fundamentals map.
 * Adjust to your schema (if you store a primaryFundamental field in DB, prefer that).
 */
export function mapFundamentalsToName(
  map: Record<FundamentalKey, number>
): LearningFundamental["name"] {
  const entries = Object.entries(map) as [FundamentalKey, number][];
  entries.sort((a, b) => b[1] - a[1]); // descending by weight
  const top = entries[0][0];
  switch (top) {
    case "listening":
      return "Listening";
    case "grasping":
      return "Grasping";
    case "retention":
      return "Retention";
    default:
      return "Application";
  }
}
