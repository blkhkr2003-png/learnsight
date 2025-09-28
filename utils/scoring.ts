// utils/scoring.ts
import admin, { adminDb } from "@/lib/firebase-admin";
import { AdaptiveLearningEngine } from "@/utils/adaptive";
import type { Fundamental, DiagnosticAttempt, QuestionDoc } from "@/types";

const FUNDAMENTALS: Fundamental[] = [
  "listening",
  "grasping",
  "retention",
  "application",
];

export async function computeScores(attemptId: string) {
  const attemptRef = adminDb.collection("diagnosticAttempts").doc(attemptId);
  const attemptSnap = await attemptRef.get();

  if (!attemptSnap.exists) throw new Error("Attempt not found");

  const attempt = attemptSnap.data() as DiagnosticAttempt;
  const questionIds = attempt.answers.map((a) => a.questionId);

  // ✅ Batch-fetch all questions
  const questionSnaps = await adminDb
    .collection("questions")
    .where(admin.firestore.FieldPath.documentId(), "in", questionIds)
    .get();

  const questions: QuestionDoc[] = questionSnaps.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as QuestionDoc),
  }));

  // ✅ Initialize scoring
  const scores: Record<Fundamental, number> = Object.fromEntries(
    FUNDAMENTALS.map((f) => [f, 0])
  ) as Record<Fundamental, number>;

  const counts: Record<Fundamental, number> = Object.fromEntries(
    FUNDAMENTALS.map((f) => [f, 0])
  ) as Record<Fundamental, number>;

  // ✅ Accumulate
  for (const answer of attempt.answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) continue;

    // Use helper to ensure valid fundamental
    const primaryFundamental = AdaptiveLearningEngine.mapFundamentalsToName(
      question.fundamentals || {}
    ).toLowerCase() as Fundamental;

    counts[primaryFundamental]++;
    if (answer.correct) scores[primaryFundamental]++;
  }

  // ✅ Normalize to percentage
  FUNDAMENTALS.forEach((f) => {
    scores[f] = counts[f] ? Math.round((scores[f] / counts[f]) * 100) : 0;
  });

  // ✅ Update attempt doc (including aggregates field)
  await attemptRef.update({
    scores,
    aggregates: scores, // optional – aligns with DiagnosticAttempt type
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return scores;
}
