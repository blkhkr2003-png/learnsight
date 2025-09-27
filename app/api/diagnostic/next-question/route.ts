// app/api/diagnostic/next-question/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import {
  selectNextQuestion,
  AdaptiveLearningEngine,
  questionDocToDiagnosticQuestion,
} from "@/utils/adaptive";
import type { QuestionDoc, QuestionForClient } from "@/types";

// ✅ Input schema with zod (runtime safe)
const requestSchema = z.object({
  lastDifficulty: z.number().min(1).max(5).optional(),
  answeredCorrectly: z.boolean().optional(),
  excludedIds: z.array(z.string()).default([]),
  studentScore: z.number().min(0).max(100).optional(),
});

export async function POST(req: Request) {
  try {
    // 1) Validate request body
    const body = requestSchema.parse(await req.json());
    const { lastDifficulty, answeredCorrectly, excludedIds, studentScore } =
      body;

    // 2) Decide target difficulty
    let targetDifficulty: number;
    let picked: QuestionDoc | null = null;

    if (
      typeof lastDifficulty === "number" &&
      typeof answeredCorrectly === "boolean"
    ) {
      // Micro-level adaptation
      targetDifficulty = answeredCorrectly
        ? Math.min(lastDifficulty + 1, 5)
        : Math.max(lastDifficulty - 1, 1);
    } else {
      // Macro-level adaptation (starting question)
      targetDifficulty =
        studentScore !== undefined
          ? AdaptiveLearningEngine.calculateStartingDifficultyNumber(
              studentScore
            )
          : 3; // default = medium
    }

    // 3) Fetch candidate questions from Firestore near the targetDifficulty
    const candidateDiffs = [targetDifficulty];
    if (targetDifficulty > 1) candidateDiffs.push(targetDifficulty - 1);
    if (targetDifficulty < 5) candidateDiffs.push(targetDifficulty + 1);

    let found: QuestionDoc[] = [];
    for (const d of candidateDiffs) {
      const snap = await adminDb
        .collection("questions")
        .where("difficulty", "==", d)
        .limit(20) // ✅ limit to avoid huge reads
        .get();

      const docs = snap.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<QuestionDoc, "id">),
        }))
        .filter((q) => !excludedIds.includes(q.id));

      found = found.concat(docs);
    }

    if (!found.length) {
      return NextResponse.json(
        { error: "No suitable questions available." },
        { status: 404 }
      );
    }

    // 4) Pick the next question
    if (
      typeof lastDifficulty === "number" &&
      typeof answeredCorrectly === "boolean"
    ) {
      // Micro-level picker
      picked = selectNextQuestion(
        found,
        lastDifficulty,
        answeredCorrectly,
        new Set(excludedIds)
      );
    } else {
      // First question or no history → random from found
      picked = found[Math.floor(Math.random() * found.length)];
    }

    if (!picked) {
      return NextResponse.json(
        { error: "No question could be selected." },
        { status: 404 }
      );
    }

    // 5) Convert to client-friendly shape
    // This removes correctChoice at runtime too:
    const questionDoc = questionDocToDiagnosticQuestion(picked); // already safe
    const questionForClient: QuestionForClient = {
      ...questionDoc,
      id: picked.id!,
    };

    // 6) Build structured response
    return NextResponse.json(
      {
        data: {
          question: questionForClient,
          meta: {
            nextRecommendedDifficulty: targetDifficulty,
            excludedCount: excludedIds.length,
          },
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Next-question API error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
