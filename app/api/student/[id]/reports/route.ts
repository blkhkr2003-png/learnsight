// app/api/student/[id]/reports/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

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

    // 4️⃣ Previous diagnostic attempt for comparison
    let prevDiagSnap;
    try {
      prevDiagSnap = await adminDb
        .collection("diagnosticAttempts")
        .where("userId", "==", studentId)
        .orderBy("createdAt", "desc")
        .limit(2)
        .get();
    } catch (err) {
      console.error("Failed to fetch previous diagnostic attempts:", err);
      return NextResponse.json(
        { error: "Failed to fetch diagnostic attempts" },
        { status: 500 }
      );
    }

    const previousDiagnostic =
      prevDiagSnap.docs.length > 1
        ? prevDiagSnap.docs[1]?.data() ?? null
        : null;

    // 5️⃣ Get fundamental scores and trends
    const currentScores = lastDiagnostic?.aggregates ||
      lastDiagnostic?.scores || {
        listening: 0,
        grasping: 0,
        retention: 0,
        application: 0,
      };

    const previousScores = previousDiagnostic?.aggregates ||
      previousDiagnostic?.scores || {
        listening: 0,
        grasping: 0,
        retention: 0,
        application: 0,
      };

    // Calculate trends and changes
    const fundamentals = {
      listening: {
        score: currentScores.listening,
        trend:
          currentScores.listening >= previousScores.listening ? "up" : "down",
        change: currentScores.listening - previousScores.listening,
      },
      grasping: {
        score: currentScores.grasping,
        trend:
          currentScores.grasping >= previousScores.grasping ? "up" : "down",
        change: currentScores.grasping - previousScores.grasping,
      },
      retention: {
        score: currentScores.retention,
        trend:
          currentScores.retention >= previousScores.retention ? "up" : "down",
        change: currentScores.retention - previousScores.retention,
      },
      application: {
        score: currentScores.application,
        trend:
          currentScores.application >= previousScores.application
            ? "up"
            : "down",
        change: currentScores.application - previousScores.application,
      },
    };

    // 6️⃣ Calculate overall score
    const overallScore = Math.round(
      (currentScores.listening +
        currentScores.grasping +
        currentScores.retention +
        currentScores.application) /
        4
    );

    // 7️⃣ Generate strengths based on high scores
    const strengths = [];
    if (currentScores.listening >= 75)
      strengths.push("Strong listening comprehension");
    if (currentScores.grasping >= 75)
      strengths.push("Excellent concept grasping abilities");
    if (currentScores.retention >= 75)
      strengths.push("Great information retention skills");
    if (currentScores.application >= 75)
      strengths.push("Strong application of learned concepts");

    // Add more general strengths if needed
    if (strengths.length < 3) {
      if (overallScore >= 80)
        strengths.push("Overall excellent academic performance");
      if (overallScore >= 70 && overallScore < 80)
        strengths.push("Good analytical thinking");
    }

    // 8️⃣ Generate improvement areas based on low scores
    const improvements = [];
    if (currentScores.listening < 60)
      improvements.push("Focus on listening comprehension exercises");
    if (currentScores.grasping < 60)
      improvements.push("Work on concept grasping techniques");
    if (currentScores.retention < 60)
      improvements.push("Practice memory retention strategies");
    if (currentScores.application < 60)
      improvements.push("Apply learning in practical scenarios");

    // Add more general improvements if needed
    if (improvements.length < 3) {
      if (overallScore < 60)
        improvements.push("Develop consistent study habits");
      if (overallScore >= 60 && overallScore < 70)
        improvements.push("Focus on weaker subject areas");
    }

    // 9️⃣ Generate personalized recommendations
    const recommendations = [];

    // High priority recommendations
    if (currentScores.retention < 50) {
      recommendations.push({
        title: "Memory Enhancement Exercises",
        description: "Practice spaced repetition and memory palace techniques",
        priority: "High",
      });
    }

    if (currentScores.application < 50) {
      recommendations.push({
        title: "Practical Application Drills",
        description: "Work on real-world application of theoretical concepts",
        priority: "High",
      });
    }

    // Medium priority recommendations
    if (currentScores.listening < 65) {
      recommendations.push({
        title: "Active Listening Practice",
        description:
          "Engage with varied audio content and practice note-taking",
        priority: "Medium",
      });
    }

    if (currentScores.grasping < 65) {
      recommendations.push({
        title: "Concept Mapping",
        description: "Create visual maps to better understand complex concepts",
        priority: "Medium",
      });
    }

    // Low priority / maintenance recommendations
    if (currentScores.listening >= 75) {
      recommendations.push({
        title: "Advanced Listening Comprehension",
        description:
          "Continue with challenging audio content to maintain strength",
        priority: "Low",
      });
    }

    if (recommendations.length < 3) {
      recommendations.push({
        title: "Comprehensive Review",
        description:
          "Regular review of all fundamental areas to maintain balanced progress",
        priority: "Medium",
      });
    }

    // 9️⃣ Fetch historical performance data for chart
    let performanceHistory: {
      date: string;
      fullDate: Date;
      overall: number;
      listening: number;
      grasping: number;
      retention: number;
      application: number;
    }[] = [];
    try {
      const historySnap = await adminDb
        .collection("diagnosticAttempts")
        .where("userId", "==", studentId)
        .orderBy("createdAt", "desc")
        .limit(10) // Get last 10 attempts for the chart
        .get();

      performanceHistory = historySnap.docs
        .map((doc) => {
          const data = doc.data();
          const date = data.createdAt?.toDate?.() || new Date();
          const scores = data.aggregates ||
            data.scores || {
              listening: 0,
              grasping: 0,
              retention: 0,
              application: 0,
            };

          const overall = Math.round(
            (scores.listening +
              scores.grasping +
              scores.retention +
              scores.application) /
              4
          );

          return {
            date: date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            fullDate: date,
            overall,
            listening: scores.listening,
            grasping: scores.grasping,
            retention: scores.retention,
            application: scores.application,
          };
        })
        .reverse(); // Reverse to show chronological order
    } catch (err) {
      console.error("Failed to fetch performance history:", err);
      // Use empty array as fallback
    }

    // 🔟 Build payload
    const payload = {
      name: userData.name,
      lastUpdated: lastDiagnosticDate
        ? lastDiagnosticDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "No data available",
      overallScore,
      fundamentals,
      strengths,
      improvements,
      recommendations,
      performanceHistory,
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("Reports API unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
