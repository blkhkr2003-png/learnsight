// app/api/diagnostic/submit-answer/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import admin, { adminDb } from "@/lib/firebase-admin";
import type { DiagnosticAttempt, QuestionDoc } from "@/types";

const ATTEMPTS_COL = "diagnosticAttempts";
const QUESTIONS_COL = "questions";

// Request validation schema
const bodySchema = z.object({
  attemptId: z.string().min(1),
  questionId: z.string().min(1),
  chosenIndex: z.number().int().min(0),
});

export async function POST(req: Request) {
  try {
    // 1) validate incoming payload (runtime safe)
    const json = await req.json();
    const { attemptId, questionId, chosenIndex } = bodySchema.parse(json);

    // 2) Atomic transaction: fetch attempt + question, then update attempt.answers
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

      // 3) Basic business validations
      if (attempt.completedAt) {
        // Don't accept answers for completed attempts
        throw new Error("ATTEMPT_ALREADY_COMPLETED");
      }

      // Validate chosenIndex is within choices bounds (avoid invalid indices)
      const choicesLen = Array.isArray(question.choices)
        ? question.choices.length
        : 0;
      if (chosenIndex < 0 || chosenIndex >= choicesLen) {
        throw new Error("INVALID_CHOSEN_INDEX");
      }

      const correctChoice = question.correctChoice;

      // Prepare answer record (store small question meta for later analytics)
      const answerRecord = {
        questionId,
        chosenIndex,
        correct: chosenIndex === correctChoice,
        answeredAt: admin.firestore.Timestamp.now(),
        // store snapshot metadata for analytics (optional but helpful)
        difficulty: question.difficulty ?? null,
        fundamentals: question.fundamentals ?? null,
      };

      // Ensure attempt.answers is an array
      const prevAnswers = Array.isArray(attempt.answers)
        ? [...attempt.answers]
        : [];

      // If answer for this question already exists, update it; else push new
      const existingIndex = prevAnswers.findIndex(
        (a) => a.questionId === questionId
      );
      if (existingIndex >= 0) {
        prevAnswers[existingIndex] = {
          ...prevAnswers[existingIndex],
          ...answerRecord,
        };
      } else {
        prevAnswers.push(answerRecord);
      }

      // (Optional) Recompute simple score as percentage of correct answers so far
      const numCorrect = prevAnswers.filter((a) => a.correct).length;
      const score = prevAnswers.length
        ? Math.round((numCorrect / prevAnswers.length) * 100)
        : 0;

      // Write updated attempt back (atomic)
      tx.update(attemptRef, {
        answers: prevAnswers,
        score, // optional field; add to attempt doc for UI
        updatedAt: admin.firestore.Timestamp.now(),
      });

      return {
        correct: answerRecord.correct,
        score,
        answersCount: prevAnswers.length,
        answeredAt: answerRecord.answeredAt.toDate().toISOString(),
      };
    });

    // 4) Return structured success response
    return NextResponse.json({ status: "ok", ...result }, { status: 200 });
  } catch (err: any) {
    // 5) Friendly error mapping
    if (err && err.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request payload", details: err.errors },
        { status: 400 }
      );
    }

    switch (err?.message) {
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
          { error: "chosenIndex out of range for that question" },
          { status: 400 }
        );
      default:
        console.error("submit-answer error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
}
