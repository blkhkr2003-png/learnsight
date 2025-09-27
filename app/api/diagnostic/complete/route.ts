// app/api/diagnostic/complete/route.ts
import { NextResponse } from "next/server";
import { computeScores } from "@/utils/scoring";
import { AdaptiveLearningEngine } from "@/utils/adaptive";
import admin from "@/lib/firebase-admin";
import type { Fundamental } from "@/types";

const db = admin.firestore();
const WEAK_THRESHOLD = 50;
const PRACTICE_QUESTION_COUNT = 3;
const STARTING_DIFFICULTY = 2;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptId, generatePractice = true } = body as {
      attemptId: string;
      generatePractice?: boolean;
    };

    if (!attemptId) {
      return NextResponse.json(
        { error: "attemptId is required" },
        { status: 400 }
      );
    }

    // 1. Compute scores
    const scores = await computeScores(attemptId);

    // 2. Optionally generate practice tasks
    let practiceSessions: any[] = [];

    if (generatePractice) {
      const weakFundamentals = Object.entries(scores)
        .filter(([_, val]) => val < WEAK_THRESHOLD)
        .map(([f]) => f as Fundamental);

      // ✅ Run practice session creation in parallel
      practiceSessions = await Promise.all(
        weakFundamentals.map(async (f) => {
          const qs = await AdaptiveLearningEngine.fetchDiagnosticQuestions({
            count: PRACTICE_QUESTION_COUNT,
            fundamentals: [f],
            startingDifficulty: STARTING_DIFFICULTY,
          });

          // You may also want to store only question IDs instead of full objects
          const newDoc = db.collection("practiceSessions").doc();
          await newDoc.set({
            attemptId, // link back to attempt
            fundamental: f,
            questions: qs, // or qs.map(q=>q.id)
            startTime: admin.firestore.FieldValue.serverTimestamp(),
            completed: false,
          });

          return { id: newDoc.id, fundamental: f, questions: qs };
        })
      );
    }

    return NextResponse.json({ scores, practiceSessions }, { status: 200 });
  } catch (err: any) {
    console.error("diagnostic/complete error", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
