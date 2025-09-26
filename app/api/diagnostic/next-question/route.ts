// app/api/diagnostic/next-question/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { selectNextQuestion, AdaptiveLearningEngine } from "@/utils/adaptive"; // ✅ use adaptive's type
import type { QuestionDoc, QuestionForClient } from "@/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      lastDifficulty?: number;
      answeredCorrectly?: boolean;
      excludedIds?: string[];
      studentScore?: number;
    };

    const {
      lastDifficulty,
      answeredCorrectly,
      excludedIds = [],
      studentScore,
    } = body;

    // 1) Load all questions (demo / small-scale approach)
    const snap = await adminDb.collection("questions").get();
    const questions: QuestionDoc[] = snap.docs.map((d) => {
      const data = d.data() as Omit<QuestionDoc, "id">;
      return { id: d.id, ...data };
    });

    if (!questions.length) {
      return NextResponse.json(
        { error: "No questions available in the database." },
        { status: 404 }
      );
    }

    // Helper: pick initial question (when lastDifficulty not provided)
    const pickInitialQuestion = (startDiffNum: number) => {
      // prefer exact start difficulty, then widen +/-1
      const candidates =
        questions.filter(
          (q) =>
            Math.abs(q.difficulty - startDiffNum) <= 1 &&
            !excludedIds.includes(q.id || "")
        ) || [];

      if (candidates.length) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }

      // fallback: any question not excluded
      const fallback = questions.filter(
        (q) => !excludedIds.includes(q.id || "")
      );
      return fallback.length
        ? fallback[Math.floor(Math.random() * fallback.length)]
        : null;
    };

    // 2) Decide which question to pick
    let picked: QuestionDoc | null = null;

    if (
      typeof lastDifficulty === "number" &&
      typeof answeredCorrectly === "boolean"
    ) {
      // Use micro-adaptive picker
      picked = selectNextQuestion(
        questions,
        lastDifficulty,
        answeredCorrectly,
        new Set(excludedIds)
      );
    } else {
      // Initial question: compute a starting difficulty from studentScore (if provided)
      const startDiff =
        studentScore !== undefined
          ? AdaptiveLearningEngine.calculateStartingDifficultyNumber(
              studentScore
            )
          : 3; // default starting difficulty numeric

      picked = pickInitialQuestion(startDiff);
    }

    if (!picked) {
      return NextResponse.json(
        { error: "No suitable question found (check excludedIds / data)." },
        { status: 404 }
      );
    }

    // 3) Sanitize for client: strip correctChoice
    const questionForClient: QuestionForClient = {
      id: picked.id!,
      question: picked.question,
      difficulty: picked.difficulty,
      choices: picked.choices,
      fundamentals: picked.fundamentals, // ✅ add fundamentals
    };

    return NextResponse.json({ question: questionForClient }, { status: 200 });
  } catch (err: any) {
    console.error("Next-question API error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
