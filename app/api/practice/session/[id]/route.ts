import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthHeader } from "@/lib/auth";
import type { QuestionDoc } from "@/types";
import { questionDocToDiagnosticQuestion } from "@/utils/adaptive";

interface Params {
  params: { id: string };
}

// GET /api/practice/session/[id]
// Returns a practice session for the current user with expanded question data (client-safe)
export async function GET(req: Request, { params }: Params) {
  try {
    const uid = await verifyAuthHeader(req);
    const sessionId = params.id;
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session id" }, { status: 400 });
    }

    const ref = adminDb.collection("practiceSessions").doc(sessionId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const data = snap.data() as any;
    if (data.studentId !== uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const questionIds: string[] = Array.isArray(data.questions) ? data.questions : [];

    // Fetch questions
    const questionSnaps = await Promise.all(
      questionIds.map((qid) => adminDb.collection("questions").doc(qid).get())
    );
    const questions = questionSnaps
      .filter((qs) => qs.exists)
      .map((qs) => {
        const q = qs.data() as QuestionDoc;
        q.id = qs.id;
        return questionDocToDiagnosticQuestion(q);
      });

    const answers: any[] = Array.isArray(data.answers) ? data.answers : [];
    const progress = questionIds.length
      ? Math.min(100, Math.round((answers.length / questionIds.length) * 100))
      : 0;

    return NextResponse.json({
      id: sessionId,
      studentId: data.studentId,
      fundamental: data.fundamental,
      title: data.title || null,
      description: data.description || null,
      questions,
      answers,
      completed: !!data.completed,
      startTime: data.startTime ?? null,
      endTime: data.endTime ?? null,
      score: data.score ?? null,
      attemptId: data.attemptId ?? null,
      progress,
    });
  } catch (err: any) {
    switch (err?.message) {
      case "MISSING_AUTH_HEADER":
      case "INVALID_AUTH_TOKEN":
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      default:
        console.error("GET /api/practice/session/[id] error", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
}

const SaveSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        chosenIndex: z.number().int().gte(-1), // -1 for timeout/skip
      })
    )
    .min(1),
  completed: z.boolean().optional(),
});

// PATCH /api/practice/session/[id]
// Allows saving answers/progress and optionally marking the session completed
export async function PATCH(req: Request, { params }: Params) {
  try {
    const uid = await verifyAuthHeader(req);
    const sessionId = params.id;
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session id" }, { status: 400 });
    }

    const json = await req.json();
    const { answers, completed } = SaveSchema.parse(json);

    const ref = adminDb.collection("practiceSessions").doc(sessionId);

    // Transactionally merge new answers and compute score/progress
    const result = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error("SESSION_NOT_FOUND");
      const data = snap.data() as any;
      if (data.studentId !== uid) throw new Error("FORBIDDEN");

      const existingAnswers: any[] = Array.isArray(data.answers)
        ? [...data.answers]
        : [];

      // Build merged answers computing correctness server-side
      // Fetch question docs for the provided answers
      const qids = Array.from(new Set(answers.map((a: any) => a.questionId)));
      const qs = await Promise.all(
        qids.map((qid) => adminDb.collection("questions").doc(qid).get())
      );
      const correctMap = new Map<string, number>();
      qs.forEach((doc) => {
        if (doc.exists) {
          const qd = doc.data() as any;
          correctMap.set(
            doc.id,
            typeof qd.correctChoice === "number" ? qd.correctChoice : -1
          );
        }
      });

      const map = new Map<string, any>();
      for (const a of existingAnswers) map.set(a.questionId, a);
      for (const a of answers) {
        const cc = correctMap.get(a.questionId);
        const isCorrect = a.chosenIndex >= 0 && a.chosenIndex === cc;
        map.set(a.questionId, { ...a, correct: isCorrect });
      }
      const merged = Array.from(map.values());

      // Compute score
      const correctCount = merged.filter((a) => a.correct).length;
      const score = merged.length ? Math.round((correctCount / merged.length) * 100) : 0;

      const updates: any = {
        answers: merged,
        score,
        updatedAt: new Date(),
      };

      if (completed === true) {
        updates.completed = true;
        updates.endTime = new Date();
      }

      tx.update(ref, updates);
      return { score, answersCount: merged.length, completed: updates.completed || false };
    });

    return NextResponse.json({ status: "ok", ...result }, { status: 200 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid payload", details: err.errors },
        { status: 400 }
      );
    }

    switch (err?.message) {
      case "MISSING_AUTH_HEADER":
      case "INVALID_AUTH_TOKEN":
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      case "SESSION_NOT_FOUND":
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      case "FORBIDDEN":
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      default:
        console.error("PATCH /api/practice/session/[id] error", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
}
