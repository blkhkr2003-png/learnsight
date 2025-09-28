import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthHeader } from "@/lib/auth";

// GET /api/practice/sessions
// Returns all practice sessions for the authenticated student (current user)
export async function GET(req: Request) {
  try {
    console.log("Practice sessions API called");
    const uid = await verifyAuthHeader(req);
    console.log("User authenticated with UID:", uid);

    // Get attemptId from query parameters if provided
    const url = new URL(req.url);
    const attemptId = url.searchParams.get("attemptId");

    // Build query
    let query = adminDb
      .collection("practiceSessions")
      .where("studentId", "==", uid);

    // If attemptId is provided, filter by it
    if (attemptId) {
      query = query.where("attemptId", "==", attemptId);
    }

    // Execute query with ordering
    const snap = await query.orderBy("startTime", "desc").get();

    const sessions = snap.docs.map((d) => {
      const data = d.data() || {};
      const questions: string[] = Array.isArray(data.questions)
        ? data.questions
        : [];
      const answers: any[] = Array.isArray(data.answers) ? data.answers : [];
      const progress = questions.length
        ? Math.min(100, Math.round((answers.length / questions.length) * 100))
        : 0;

      return {
        id: d.id,
        fundamental: data.fundamental || "listening",
        title:
          data.title ||
          `Practice - ${String(data.fundamental || "listening").replace(
            /\b\w/g,
            (c: string) => c.toUpperCase()
          )}`,
        description:
          data.description ||
          "Adaptive practice generated from your diagnostic performance",
        recommended: !!data.attemptId,
        completed: !!data.completed,
        startTime: data.startTime ?? null,
        score: data.score ?? null,
        attemptId: data.attemptId ?? null,
        estimatedTime: questions.length * 2, // rough estimate: 2 mins per question
        questionsCount: questions.length,
        answersCount: answers.length,
        progress,
        type: data.fundamental || "listening",
        difficulty: data.difficulty || null,
      };
    });

    return NextResponse.json({ sessions });
  } catch (err: any) {
    console.error("Error in practice sessions API:", err);
    switch (err?.message) {
      case "MISSING_AUTH_HEADER":
        console.error("Missing auth header in request");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      case "INVALID_AUTH_TOKEN":
        console.error("Invalid auth token in request");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      default:
        console.error("GET /api/practice/sessions error", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
}
