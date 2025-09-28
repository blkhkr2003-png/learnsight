// app/api/student/[id]/dashboard/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { PracticeSessionDoc, StudentDashboardData } from "@/types";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(req: Request, context: any) {
  try {
    // 1️⃣ Resolve dynamic route params
    const { id: studentId } = await context.params;
    if (!studentId) {
      console.error("Missing student ID in route params");
      return NextResponse.json(
        { error: "Missing student ID" },
        { status: 400 }
      );
    }

    // 2️⃣ Fetch user document
    let userSnap;
    try {
      userSnap = await adminDb.collection("users").doc(studentId).get();
    } catch (err) {
      console.error("Failed to fetch user document:", err);
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }

    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userData = userSnap.data()!;

    // 3️⃣ Last diagnostic attempt
    let diagSnap;
    try {
      diagSnap = await adminDb
        .collection("diagnosticAttempts")
        .where("userId", "==", studentId)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();
    } catch (err) {
      console.error("Failed to fetch diagnostic attempts:", err);
      return NextResponse.json(
        { error: "Failed to fetch diagnostic attempts" },
        { status: 500 }
      );
    }

    const lastDiagnostic = diagSnap.docs[0]?.data() ?? null;
    const lastDiagnosticDate = lastDiagnostic?.createdAt?.toDate?.() ?? null;

    // 4️⃣ Recent practice sessions
    let practiceSnap;
    try {
      practiceSnap = await adminDb
        .collection("practiceSessions")
        .where("studentId", "==", studentId)
        .orderBy("startTime", "desc")
        .limit(5)
        .get();
    } catch (err) {
      console.error("Failed to fetch practice sessions:", err);
      return NextResponse.json(
        { error: "Failed to fetch practice sessions" },
        { status: 500 }
      );
    }

    const recentPractices: PracticeSessionDoc[] = practiceSnap.docs.map((d) => {
      const data = d.data() || {};
      return {
        id: d.id,
        studentId: data.studentId || studentId, // 使用 studentId 作为默认值
        fundamental: data.fundamental || "Practice Session", // 使用默认值
        completed: data.completed ?? false,
        score: data.score ?? null,
        startTime: data.startTime ?? null,
      };
    });

    // 5️⃣ Compute stats
    const completedPractices = recentPractices.filter(
      (p) => p.completed
    ).length;
    const totalPractices = recentPractices.length;

    const fundamentals: StudentDashboardData["fundamentals"] =
      lastDiagnostic?.scores ?? {
        listening: 0,
        grasping: 0,
        retention: 0,
        application: 0,
      };

    const overallProgress = Math.round(
      (fundamentals.listening +
        fundamentals.grasping +
        fundamentals.retention +
        fundamentals.application) /
        4
    );

    // 6️⃣ Compute practice streak
    let practiceStreak = 0;
    const today = new Date();
    for (const practice of recentPractices) {
      if (!practice.completed || !practice.startTime) break;

      const practiceDate: Date =
        practice.startTime instanceof Date
          ? practice.startTime
          : new Date(practice.startTime);

      const diffDays = Math.floor(
        (today.getTime() - practiceDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === practiceStreak) practiceStreak++;
      else break;
    }

    // 7️⃣ Generate recommendations
    const recommendations: string[] = [];
    if (fundamentals.listening < 50)
      recommendations.push("Focus on listening exercises");
    if (fundamentals.grasping < 50)
      recommendations.push("Work on grasping fundamentals");
    if (fundamentals.retention < 50)
      recommendations.push("Improve retention strategies");
    if (fundamentals.application < 50)
      recommendations.push("Practice application exercises");

    // 8️⃣ Build payload
    const payload: StudentDashboardData = {
      name: userData.name,
      lastDiagnostic: lastDiagnosticDate,
      fundamentals,
      recentPractices,
      completedPractices,
      totalPractices,
      overallProgress,
      practiceStreak,
      recommendations,
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("Dashboard API unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
