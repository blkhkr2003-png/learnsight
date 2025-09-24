// app/api/diagnostic/next-question/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { selectNextQuestion, QuestionDoc } from "@/utils/adaptive"; // ✅ use adaptive's type

export async function POST(req: Request) {
  try {
    const {
      lastDifficulty = 1,
      answeredCorrectly = true,
      excludedIds = [],
    } = (await req.json()) || {};

    // fetch all questions from Firestore
    const snapshot = await adminDb.collection("questions").get();
    const questions: QuestionDoc[] = snapshot.docs.map((doc) => {
      const data = doc.data() as QuestionDoc; // now matches adaptive.ts type
      return { id: doc.id, ...data };
    });

    const next = selectNextQuestion(
      questions,
      lastDifficulty,
      answeredCorrectly,
      new Set(excludedIds)
    );

    if (!next) {
      return NextResponse.json(
        { message: "No more questions available" },
        { status: 404 }
      );
    }

    return NextResponse.json(next, { status: 200 });
  } catch (err: any) {
    console.error("Next-question API error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
