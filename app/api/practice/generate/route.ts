import { NextResponse } from "next/server";
import admin from "@/lib/firebase-admin";
import { generatePracticeSessions, PracticeSession } from "@/utils/practice";
import type { Fundamental } from "@/types";

const db = admin.firestore();
const PRACTICE_QUESTION_COUNT = 5;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      studentId,
      fundamentals,
      attemptId,
      count = PRACTICE_QUESTION_COUNT,
    } = body as {
      studentId: string;
      fundamentals: Fundamental[];
      attemptId?: string;
      count?: number;
    };

    if (!studentId || !fundamentals?.length) {
      return NextResponse.json(
        { error: "studentId and fundamentals are required" },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch existing incomplete sessions in parallel
    const existingSessionsSnapshots = await Promise.all(
      fundamentals.map((f) =>
        db
          .collection("practiceSessions")
          .where("studentId", "==", studentId)
          .where("fundamental", "==", f)
          .where("completed", "==", false)
          .get()
      )
    );

    const existingSessions: PracticeSession[] = [];
    existingSessionsSnapshots.forEach((snap) => {
      snap.docs.forEach((doc) => {
        const data = doc.data() as Partial<PracticeSession>;
        existingSessions.push({
          id: doc.id,
          studentId: data.studentId!,
          fundamental: data.fundamental!,
          questions: data.questions || [],
          startTime: data.startTime ?? null,
          completed: data.completed ?? false,
          attemptId: data.attemptId,
        });
      });
    });

    // 2️⃣ Determine fundamentals that need new sessions
    const fundamentalsToGenerate = fundamentals.filter((f) => {
      const existing = existingSessions.find((s) => s.fundamental === f);
      return !existing || (existing.questions?.length || 0) === 0;
    });

    // 3️⃣ Generate new sessions for missing fundamentals
    let newSessions: PracticeSession[] = [];
    if (fundamentalsToGenerate.length) {
      newSessions = await generatePracticeSessions(
        studentId,
        fundamentalsToGenerate,
        count,
        attemptId
      );
    }

    // 4️⃣ Merge sessions, filter out any empty questions in existing sessions
    const allSessions = [
      ...existingSessions.filter((s) => (s.questions?.length || 0) > 0),
      ...newSessions,
    ];

    return NextResponse.json(
      { practiceSessions: allSessions },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("practice/generate error", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
