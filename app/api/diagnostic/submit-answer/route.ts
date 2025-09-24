// app/api/diagnostic/submit-answer/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import admin from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { attemptId, questionId, chosenIndex, correct } = await req.json();

    const ref = adminDb.collection("diagnosticAttempts").doc(attemptId);
    await ref.update({
      answers: admin.firestore.FieldValue.arrayUnion({
        questionId,
        chosenIndex,
        correct,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
