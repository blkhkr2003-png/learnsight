import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthHeader } from "@/lib/auth";

async function assertTeacherOrAdmin(requesterUid: string, teacherId: string) {
  if (requesterUid === teacherId) return; // teacher
  const requesterSnap = await adminDb.collection("users").doc(requesterUid).get();
  if (!requesterSnap.exists) throw new Error("FORBIDDEN");
  const role = requesterSnap.data()?.role;
  if (role !== "admin") throw new Error("FORBIDDEN");
}

// GET /api/teacher/[id]/reports
// Returns diagnostic attempts and practice sessions for all students of the teacher
export async function GET(req: Request, context: any) {
  try {
    const requesterUid = await verifyAuthHeader(req);
    const { id: teacherId } = await context.params;
    if (!teacherId) return NextResponse.json({ error: "Missing teacher id" }, { status: 400 });

    await assertTeacherOrAdmin(requesterUid, teacherId);

    // Students assigned to the teacher
    const studentsSnap = await adminDb
      .collection("users")
      .where("role", "==", "student")
      .where("teacherId", "==", teacherId)
      .get();

    const students = studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const studentIds = students.map((s) => s.id);

    // Diagnostics
    const diagnosticAttempts: any[] = [];
    const batchSize = 10;
    for (let i = 0; i < studentIds.length; i += batchSize) {
      const batch = studentIds.slice(i, i + batchSize);
      if (batch.length === 0) continue;
      const snap = await adminDb
        .collection("diagnosticAttempts")
        .where("userId", "in", batch)
        .orderBy("createdAt", "desc")
        .get();
      diagnosticAttempts.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }

    // Practice sessions
    const practiceSessions: any[] = [];
    for (let i = 0; i < studentIds.length; i += batchSize) {
      const batch = studentIds.slice(i, i + batchSize);
      if (batch.length === 0) continue;
      const snap = await adminDb
        .collection("practiceSessions")
        .where("studentId", "in", batch)
        .orderBy("startTime", "desc")
        .get();
      practiceSessions.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }

    return NextResponse.json({ success: true, data: { students, diagnosticAttempts, practiceSessions } });
  } catch (err: any) {
    if (err?.message === "MISSING_AUTH_HEADER" || err?.message === "INVALID_AUTH_TOKEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("GET /api/teacher/[id]/reports error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
