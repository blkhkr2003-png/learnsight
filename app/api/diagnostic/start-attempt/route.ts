// app/api/diagnostic/start-attempt/route.ts
import { NextResponse } from "next/server";
import admin from "@/lib/firebase-admin";
import { createDiagnosticAttempt } from "@/lib/db-admin";
import type { DiagnosticAttempt } from "@/types";

export async function POST(req: Request) {
  try {
    const { userId } = (await req.json()) as { userId?: string };

    // Validate input
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Current timestamp from Firestore
    const now = admin.firestore.Timestamp.now();

    // Build a DiagnosticAttempt skeleton (no questions yet)
    const attempt: Omit<DiagnosticAttempt, "id"> = {
      userId: userId,
      startedAt: now,
      completedAt: undefined,
      answers: [], // initially empty for adaptive test
    };

    // Save to Firestore
    const attemptId = await createDiagnosticAttempt(attempt);

    // Respond with the attempt
    return NextResponse.json(
      {
        attempt: { id: attemptId, ...attempt },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("start-attempt error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
