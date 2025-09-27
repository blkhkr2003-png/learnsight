// app/api/student/[id]/radar/route.ts
import { NextResponse } from "next/server";
import admin from "@/lib/firebase-admin";

const db = admin.firestore();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // 👈 params is async now
) {
  try {
    const { id } = await params; // 👈 await required
    const studentId = id;
    // ✅ Get latest diagnostic attempt for this student
    const attemptsSnap = await db
      .collection("diagnosticAttempts")
      .where("userId", "==", studentId)
      .orderBy("startedAt", "desc")
      .limit(1)
      .get();

    if (attemptsSnap.empty) {
      return NextResponse.json(
        { error: "No diagnostic attempts found" },
        { status: 404 }
      );
    }

    const latestAttempt = attemptsSnap.docs[0].data();

    // Prefer 'aggregates' if available, otherwise 'scores'
    const scores = latestAttempt.aggregates || latestAttempt.scores || {};

    // ✅ Format for radar chart
    const radarData = Object.entries(scores).map(([fundamental, value]) => ({
      fundamental,
      score: value,
    }));

    return NextResponse.json({ radarData }, { status: 200 });
  } catch (err: any) {
    console.error("student radar error", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
