// app/api/diagnostic/start-attempt/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import admin from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const ref = await adminDb.collection("diagnosticAttempts").add({
      userId,
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      answers: [],
    });

    return NextResponse.json({ attemptId: ref.id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
