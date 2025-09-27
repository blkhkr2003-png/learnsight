// utils/practice.ts
import { AdaptiveLearningEngine, DiagnosticQuestion } from "@/utils/adaptive";
import admin from "@/lib/firebase-admin";
import type { Fundamental } from "@/types";

export interface PracticeSession {
  id: string;
  studentId: string;
  fundamental: Fundamental;
  questions: DiagnosticQuestion[];
  startTime: FirebaseFirestore.Timestamp | null; // serverTimestamp not resolved yet
  completed: boolean;
  attemptId?: string; // optional link to the diagnostic attempt
}

const db = admin.firestore();

/**
 * Generate practice sessions for weak fundamentals.
 *
 * @param studentId - ID of the student
 * @param weakFundamentals - Fundamentals to generate practice for
 * @param count - Number of questions per fundamental
 * @param attemptId - Optional link to diagnostic attempt
 */
export async function generatePracticeSessions(
  studentId: string,
  weakFundamentals: Fundamental[],
  count = 5,
  attemptId?: string
): Promise<PracticeSession[]> {
  if (!weakFundamentals.length) return [];

  // Fetch all questions in parallel
  const questionSets = await Promise.all(
    weakFundamentals.map((f) =>
      AdaptiveLearningEngine.fetchDiagnosticQuestions({
        count,
        fundamentals: [f],
        startingDifficulty: 2,
      })
    )
  );

  // Prepare batch write
  const batch = db.batch();
  const sessions: PracticeSession[] = [];

  weakFundamentals.forEach((f, idx) => {
    const questions = questionSets[idx] as DiagnosticQuestion[];
    const ref = db.collection("practiceSessions").doc();

    const data = {
      studentId,
      fundamental: f,
      questions: questions.map((q) => q.id), // only IDs
      startTime: admin.firestore.FieldValue.serverTimestamp(),
      completed: false,
      ...(attemptId ? { attemptId } : {}),
    };

    batch.set(ref, data);

    sessions.push({
      id: ref.id,
      studentId,
      fundamental: f,
      questions,
      startTime: null, // serverTimestamp will populate in Firestore
      completed: false,
      attemptId,
    });
  });

  await batch.commit();

  return sessions;
}
