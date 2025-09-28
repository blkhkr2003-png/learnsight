// app/api/diagnostic/complete/route.ts
import { NextResponse } from "next/server";
import { computeScores } from "@/utils/scoring";
import { generatePracticeSessions, PracticeSession } from "@/utils/practice";
import admin from "@/lib/firebase-admin";
import type { Fundamental } from "@/types";

const db = admin.firestore();
const WEAK_THRESHOLD = 70;
const PRACTICE_QUESTION_COUNT = 5;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      attemptId,
      studentId,
      generatePractice = true,
    } = body as {
      attemptId: string;
      studentId: string;
      generatePractice?: boolean;
    };

    if (!attemptId || !studentId) {
      return NextResponse.json(
        { error: "attemptId and studentId are required" },
        { status: 400 }
      );
    }

    // 1️⃣ Compute scores
    const scores = await computeScores(attemptId);

    // 2️⃣ Determine weak fundamentals
    const weakFundamentals = Object.entries(scores)
      .filter(([_, val]) => val < WEAK_THRESHOLD)
      .map(([f]) => f as Fundamental);

    // 3️⃣ Optionally generate practice sessions
    let practiceSessions: PracticeSession[] = [];
    if (generatePractice && weakFundamentals.length > 0) {
      practiceSessions = await generatePracticeSessions(
        studentId,
        weakFundamentals,
        PRACTICE_QUESTION_COUNT,
        attemptId
      );
    }

    // 4️⃣ Update attempt doc with only the fields not updated by computeScores
    await db.collection("diagnosticAttempts").doc(attemptId).update({
      weakFundamentals,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 5️⃣ Return all to frontend
    return NextResponse.json(
      { scores, weakFundamentals, practiceSessions },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("diagnostic/complete error", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
