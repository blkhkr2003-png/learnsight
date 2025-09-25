// /utils/adaptive.ts

import type { QuestionDoc, Fundamental, QuestionForClient } from "@/types";
import { adminDb } from "@/lib/firebase-admin";

export interface LearningFundamental {
  name: Capitalize<Fundamental>;
  score: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  weakAreas?: string[];
  recommendations?: string[];
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
  difficulty: number; // numeric 1..5
  question: string;
  options: string[];
  correctAnswer?: number;
  explanation?: string;
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

  /**
   * Convert QuestionDoc to client-friendly DiagnosticQuestion
   */
  static questionDocToDiagnosticQuestion(q: QuestionDoc): DiagnosticQuestion {
    const fundamental = AdaptiveLearningEngine.mapFundamentalsToName(
      q.fundamentals || {}
    );
    return {
      id: q.id || "unknown",
      fundamental,
      difficulty: q.difficulty,
      question: q.question,
      options: q.choices || [],
      correctAnswer: q.correctChoice,
      timeLimit: q.difficulty <= 2 ? 30 : q.difficulty <= 4 ? 45 : 60,
    };
  }

  /**
   * Pick the primary fundamental with the highest weight
   */
  static mapFundamentalsToName(
    map: Partial<Record<Fundamental, number>>
  ): LearningFundamental["name"] {
    const entries = Object.entries(map) as [Fundamental, number][];
    entries.sort((a, b) => b[1] - a[1]);
    const top = entries[0]?.[0] || "listening";
    return (top.charAt(0).toUpperCase() +
      top.slice(1)) as LearningFundamental["name"];
  }

  /**
   * Fetch adaptive diagnostic questions from Firestore
   * Balances fundamentals and difficulty (moved from db-admin.ts)
   */
  static async fetchDiagnosticQuestions({
    count = 6,
    startingDifficulty = 3,
    fundamentals,
  }: {
    count?: number;
    startingDifficulty?: number;
    fundamentals?: Fundamental[];
  } = {}): Promise<QuestionForClient[]> {
    const ALL: Fundamental[] = [
      "listening",
      "grasping",
      "retention",
      "application",
    ];
    const fundList = fundamentals?.length ? fundamentals : ALL;
    const perFund = Math.ceil(count / fundList.length);

    const picks: Map<string, QuestionDoc> = new Map();

    for (const f of fundList) {
      let found: FirebaseFirestore.QueryDocumentSnapshot[] = [];
      for (let delta = 0; delta <= 4 && found.length < perFund; delta++) {
        const ds: number[] = [];
        const low = startingDifficulty - delta;
        const high = startingDifficulty + delta;
        if (low >= 1) ds.push(low);
        if (high !== low && high <= 5) ds.push(high);

        for (const d of ds) {
          try {
            const snap = await adminDb
              .collection("questions")
              .where("difficulty", "==", d)
              .where(`fundamentals.${f}`, ">", 0)
              .limit(perFund * 5)
              .get();
            if (!snap.empty) found = found.concat(snap.docs);
          } catch (err) {
            console.warn("Partial fetch error", err);
          }
        }
      }

      const sampled = Array.from(new Set(found.map((d) => d.id)))
        .map((id) => found.find((doc) => doc.id === id)!)
        .slice(0, perFund);

      for (const s of sampled) {
        const q = s.data() as QuestionDoc;
        q.id = s.id;
        if (!picks.has(q.id)) picks.set(q.id, q);
      }

      if (picks.size >= count) break;
    }

    const out = Array.from(picks.values()).slice(0, count);
    return out.map((q) => this.questionDocToDiagnosticQuestion(q));
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
