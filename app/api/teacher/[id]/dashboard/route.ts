import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import admin from "@/lib/firebase-admin";
import { verifyAuthHeader } from "@/lib/auth";
import {
  UserDoc,
  DiagnosticAttempt,
  Fundamental,
  PracticeSessionDoc,
} from "@/types";
import { TeacherAlertDoc } from "@/types/teacher";

// Helpers
async function assertTeacherOrAdmin(requesterUid: string, teacherId: string) {
  if (requesterUid === teacherId) return; // self
  const requesterSnap = await adminDb
    .collection("users")
    .doc(requesterUid)
    .get();
  if (!requesterSnap.exists) throw new Error("FORBIDDEN");
  const role = requesterSnap.data()?.role;
  if (role !== "admin") throw new Error("FORBIDDEN");
}

function safeUser(doc: FirebaseFirestore.DocumentSnapshot): UserDoc {
  const data: any = doc.data() || {};
  return {
    uid: doc.id,
    name: data.name || "",
    email: data.email || "",
    role: data.role || "student",
    teacherId: data.teacherId,
    classId: data.classId,
    isApproved: data.isApproved,
    createdAt: data.createdAt,
    lastLogin: data.lastLogin,
  };
}

function calculateClassStats(attempts: DiagnosticAttempt[]) {
  const completed = attempts.filter((a) => a.completedAt && a.aggregates);
  if (completed.length === 0) {
    return { listening: 0, grasping: 0, retention: 0, application: 0 };
  }
  const totals: Record<Fundamental, number> = {
    listening: 0,
    grasping: 0,
    retention: 0,
    application: 0,
  };
  for (const a of completed) {
    const aggr = a.aggregates as Record<Fundamental, number> | undefined;
    if (!aggr) continue;
    totals.listening += aggr.listening ?? 0;
    totals.grasping += aggr.grasping ?? 0;
    totals.retention += aggr.retention ?? 0;
    totals.application += aggr.application ?? 0;
  }
  return {
    listening: Math.round(totals.listening / completed.length),
    grasping: Math.round(totals.grasping / completed.length),
    retention: Math.round(totals.retention / completed.length),
    application: Math.round(totals.application / completed.length),
  };
}

function calculateAverageScore(attempts: DiagnosticAttempt[]) {
  const completed = attempts.filter((a) => a.completedAt && a.aggregates);
  if (completed.length === 0) return 0;
  let total = 0;
  for (const a of completed) {
    const aggr = a.aggregates as Record<Fundamental, number> | undefined;
    if (!aggr) continue;
    const vals = Object.values(aggr);
    total += vals.reduce((s, v) => s + (v as number), 0) / vals.length;
  }
  return Math.round(total / completed.length);
}

export async function GET(req: Request, context: any) {
  try {
    const requesterUid = await verifyAuthHeader(req);
    const { id: teacherId } = await context.params;
    if (!teacherId)
      return NextResponse.json(
        { success: false, error: "Missing teacher id" },
        { status: 400 }
      );

    await assertTeacherOrAdmin(requesterUid, teacherId);

    // Teacher doc
    const teacherSnap = await adminDb.collection("users").doc(teacherId).get();
    if (!teacherSnap.exists)
      return NextResponse.json(
        { success: false, error: "Teacher not found" },
        { status: 404 }
      );
    const teacher = safeUser(teacherSnap);

    // Resolve class name if any
    let className = "My Students";
    if (teacher.classId) {
      try {
        const classSnap = await adminDb
          .collection("classes")
          .doc(teacher.classId)
          .get();
        const cname = classSnap.data()?.name;
        if (cname) className = cname;
      } catch (e) {
        // ignore
      }
    }

    // Students of teacher
    const studentsSnap = await adminDb
      .collection("users")
      .where("role", "==", "student")
      .where("teacherId", "==", teacherId)
      .get();
    const students: UserDoc[] = studentsSnap.docs.map(safeUser);
    const studentIds = students.map((s) => s.uid);

    // Diagnostics for students (batch using `in` up to 10)
    const allAttempts: DiagnosticAttempt[] = [];
    const batchSize = 10;
    for (let i = 0; i < studentIds.length; i += batchSize) {
      const batch = studentIds.slice(i, i + batchSize);
      if (batch.length === 0) continue;
      const snap = await adminDb
        .collection("diagnosticAttempts")
        .where("userId", "in", batch)
        .get();
      allAttempts.push(
        ...snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      );
    }

    // Recent students: get latest attempt per student
    const recentStudents: any[] = [];
    for (const student of students) {
      const lastSnap = await adminDb
        .collection("diagnosticAttempts")
        .where("userId", "==", student.uid)
        .orderBy("completedAt", "desc")
        .limit(1)
        .get();
      const attempt = lastSnap.docs[0]?.data();
      if (!attempt?.completedAt) continue;
      const aggr = (attempt.aggregates || {}) as Record<string, number>;
      let weakest: string = "listening";
      let min = Infinity;
      for (const [k, v] of Object.entries(aggr)) {
        const n = Number(v ?? 0);
        if (n < min) {
          min = n;
          weakest = k;
        }
      }
      const avg = Object.values(aggr).length
        ? Math.round(
            Object.values(aggr).reduce((s, v) => s + Number(v ?? 0), 0) /
              Object.values(aggr).length
          )
        : 0;
      recentStudents.push({
        id: student.uid,
        name: student.name,
        lastDiagnostic:
          attempt.completedAt.toDate?.().toISOString?.().split("T")[0] ?? null,
        weakestSkill: weakest.charAt(0).toUpperCase() + weakest.slice(1),
        progress: avg,
        status:
          avg >= 85 ? "excellent" : avg >= 70 ? "active" : "needs-attention",
        trend: Math.random() > 0.5 ? "up" : "down",
      });
    }

    // Active students in last 7 days from practiceSessions
    let activeStudents = 0;
    if (studentIds.length > 0) {
      const since = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      const activeSet = new Set<string>();
      for (let i = 0; i < studentIds.length; i += batchSize) {
        const batch = studentIds.slice(i, i + batchSize);
        const snap = await adminDb
          .collection("practiceSessions")
          .where("studentId", "in", batch)
          .where("startTime", ">=", since)
          .get();
        snap.docs.forEach((d) => {
          const sid = (d.data() as any).studentId;
          if (sid) activeSet.add(sid);
        });
      }
      activeStudents = activeSet.size;
    }

    // Alerts
    const alertsSnap = await adminDb
      .collection("teacherAlerts")
      .where("teacherId", "==", teacherId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();
    const alerts = alertsSnap.docs.map((d) => ({
      docId: d.id,
      ...(d.data() as TeacherAlertDoc),
    }));

    // Aggregations
    const classStats = calculateClassStats(allAttempts as any);
    const avgScore = calculateAverageScore(allAttempts as any);
    const studentsWithAttempts = new Set(
      allAttempts
        .filter((a) => (a as any).completedAt)
        .map((a) => (a as any).userId)
    ).size;
    const completionRate = students.length
      ? Math.round((studentsWithAttempts / students.length) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        name: teacher.name,
        className,
        totalStudents: students.length,
        studentsCompleted: studentsWithAttempts,
        averageScore: avgScore,
        classStats,
        recentStudents,
        alerts,
      },
    });
  } catch (err: any) {
    if (
      err?.message === "MISSING_AUTH_HEADER" ||
      err?.message === "INVALID_AUTH_TOKEN"
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    if (err?.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    console.error("GET /api/teacher/[id]/dashboard error", err);
    console.error("Error stack:", err?.stack);

    // Return more detailed error information in development mode
    const isDevelopment = process.env.NODE_ENV === "development";
    const errorDetails = isDevelopment
      ? err?.message || "Unknown error"
      : "Server error occurred";

    return NextResponse.json(
      {
        success: false,
        error: "Server error",
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
