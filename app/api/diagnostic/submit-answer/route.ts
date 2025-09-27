// app/api/diagnostic/submit-answer/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import admin, { adminDb } from "@/lib/firebase-admin";
import { verifyAuthHeader } from "@/lib/auth";
import type { DiagnosticAttempt, QuestionDoc } from "@/types";

const ATTEMPTS_COL = "diagnosticAttempts";
const QUESTIONS_COL = "questions";

// Schema validation
const bodySchema = z.object({
  attemptId: z.string().min(1),
  questionId: z.string().min(1),
  chosenIndex: z.number().int().min(0),
});

export async function POST(req: Request) {
  try {
    // 1) Validate + auth
    const json = await req.json();
    const { attemptId, questionId, chosenIndex } = bodySchema.parse(json);
    const uid = await verifyAuthHeader(req); // current user UID

    // 2) Transaction
    const result = await adminDb.runTransaction(async (tx) => {
      const attemptRef = adminDb.collection(ATTEMPTS_COL).doc(attemptId);
      const qRef = adminDb.collection(QUESTIONS_COL).doc(questionId);

      const [attemptSnap, qSnap] = await Promise.all([
        tx.get(attemptRef),
        tx.get(qRef),
      ]);

      if (!attemptSnap.exists) throw new Error("ATTEMPT_NOT_FOUND");
      if (!qSnap.exists) throw new Error("QUESTION_NOT_FOUND");

      const attempt = attemptSnap.data() as DiagnosticAttempt;
      const question = qSnap.data() as QuestionDoc;

      // Ownership check
      if (attempt.userId !== uid) {
        throw new Error("UNAUTHORIZED");
      }

      if (attempt.completedAt) throw new Error("ATTEMPT_ALREADY_COMPLETED");

      // Index check
      if (chosenIndex < 0 || chosenIndex >= (question.choices?.length ?? 0)) {
        throw new Error("INVALID_CHOSEN_INDEX");
      }

      const correct = chosenIndex === question.correctChoice;
      const answerRecord = {
        questionId,
        chosenIndex,
        correct,
        answeredAt: admin.firestore.Timestamp.now(),
        difficulty: question.difficulty ?? null,
        fundamentals: question.fundamentals ?? null,
      };

      // Ensure answers array
      const prevAnswers = Array.isArray(attempt.answers)
        ? [...attempt.answers]
        : [];

      // Update or insert
      const idx = prevAnswers.findIndex((a) => a.questionId === questionId);
      if (idx >= 0) {
        prevAnswers[idx] = { ...prevAnswers[idx], ...answerRecord };
      } else {
        prevAnswers.push(answerRecord);
      }

      const numCorrect = prevAnswers.filter((a) => a.correct).length;
      const score = Math.round((numCorrect / prevAnswers.length) * 100);

      // Auto-complete if expectedQuestionCount reached
      let completedAt: admin.firestore.Timestamp | null = null;
      if (
        attempt.expectedQuestionCount &&
        prevAnswers.length >= attempt.expectedQuestionCount
      ) {
        completedAt = admin.firestore.Timestamp.now();
      }

      tx.update(attemptRef, {
        answers: prevAnswers,
        score,
        updatedAt: admin.firestore.Timestamp.now(),
        ...(completedAt ? { completedAt } : {}),
      });

      // (Optional) Audit subcollection
      const auditRef = attemptRef.collection("events").doc();
      tx.set(auditRef, {
        type: "ANSWER_SUBMITTED",
        questionId,
        chosenIndex,
        correct,
        createdAt: admin.firestore.Timestamp.now(),
      });

      return {
        correct,
        score,
        answersCount: prevAnswers.length,
        completed: !!completedAt,
      };
    });

    return NextResponse.json({ status: "ok", ...result }, { status: 200 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid payload", details: err.errors },
        { status: 400 }
      );
    }

    switch (err.message) {
      case "MISSING_AUTH_HEADER":
      case "INVALID_AUTH_TOKEN":
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      case "UNAUTHORIZED":
        return NextResponse.json(
          { error: "Not your attempt" },
          { status: 403 }
        );
      case "ATTEMPT_NOT_FOUND":
        return NextResponse.json(
          { error: "Attempt not found" },
          { status: 404 }
        );
      case "QUESTION_NOT_FOUND":
        return NextResponse.json(
          { error: "Question not found" },
          { status: 404 }
        );
      case "ATTEMPT_ALREADY_COMPLETED":
        return NextResponse.json(
          { error: "Attempt already completed" },
          { status: 400 }
        );
      case "INVALID_CHOSEN_INDEX":
        return NextResponse.json(
          { error: "Chosen index out of range" },
          { status: 400 }
        );
      default:
        console.error("submit-answer error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
}
