// app/api/questions/[id]/route.ts
import { NextResponse } from "next/server";
import admin from "@/lib/firebase-admin";
import { verifyAuthHeader } from "@/lib/auth";
import { questionDocToDiagnosticQuestion } from "@/utils/adaptive";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id;

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 }
      );
    }

    // Verify authentication
    await verifyAuthHeader(req);

    // Get the question document
    const questionRef = admin.firestore().collection("questions").doc(questionId);
    const questionSnap = await questionRef.get();

    if (!questionSnap.exists) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const questionData = questionSnap.data();
    questionData.id = questionId;

    // Convert to client-friendly format
    const clientQuestion = questionDocToDiagnosticQuestion(questionData);

    return NextResponse.json(
      clientQuestion,
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error getting question:", err);

    if (err.message === "MISSING_AUTH_HEADER" || err.message === "INVALID_AUTH_TOKEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
