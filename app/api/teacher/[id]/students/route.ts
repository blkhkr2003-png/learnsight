import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import admin from "@/lib/firebase-admin";
import { verifyAuthHeader } from "@/lib/auth";

async function assertTeacherOrAdmin(requesterUid: string, teacherId: string) {
  if (requesterUid === teacherId) return; // teacher managing own students
  const requesterSnap = await adminDb.collection("users").doc(requesterUid).get();
  if (!requesterSnap.exists) throw new Error("FORBIDDEN");
  const role = requesterSnap.data()?.role;
  if (role !== "admin") throw new Error("FORBIDDEN");
}

// GET /api/teacher/[id]/students
// Lists all students assigned to the teacher
export async function GET(req: Request, context: any) {
  try {
    const requesterUid = await verifyAuthHeader(req);
    const { id: teacherId } = await context.params;
    if (!teacherId) return NextResponse.json({ error: "Missing teacher id" }, { status: 400 });

    await assertTeacherOrAdmin(requesterUid, teacherId);

    const snap = await adminDb
      .collection("users")
      .where("role", "==", "student")
      .where("teacherId", "==", teacherId)
      .get();

    const students = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, students });
  } catch (err: any) {
    if (err?.message === "MISSING_AUTH_HEADER" || err?.message === "INVALID_AUTH_TOKEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("GET /api/teacher/[id]/students error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/teacher/[id]/students
// Body: { studentId: string, classId?: string }
// Assign a student to the teacher (and optionally set classId)
export async function POST(req: Request, context: any) {
  try {
    const requesterUid = await verifyAuthHeader(req);
    const { id: teacherId } = await context.params;
    if (!teacherId) return NextResponse.json({ error: "Missing teacher id" }, { status: 400 });
    await assertTeacherOrAdmin(requesterUid, teacherId);

    const body = await req.json();
    const studentId = body?.studentId as string | undefined;
    const classId = body?.classId as string | undefined;

    if (!studentId) return NextResponse.json({ error: "Missing studentId" }, { status: 400 });

    const studentRef = adminDb.collection("users").doc(studentId);
    const studentSnap = await studentRef.get();
    if (!studentSnap.exists) return NextResponse.json({ error: "Student not found" }, { status: 404 });
    if (studentSnap.data()?.role !== "student") return NextResponse.json({ error: "User is not a student" }, { status: 400 });

    await studentRef.update({ teacherId, ...(classId ? { classId } : {}) });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.message === "MISSING_AUTH_HEADER" || err?.message === "INVALID_AUTH_TOKEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("POST /api/teacher/[id]/students error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/teacher/[id]/students
// Body: { studentId: string }
// Remove the student-teacher assignment
export async function DELETE(req: Request, context: any) {
  try {
    const requesterUid = await verifyAuthHeader(req);
    const { id: teacherId } = await context.params;
    if (!teacherId) return NextResponse.json({ error: "Missing teacher id" }, { status: 400 });
    await assertTeacherOrAdmin(requesterUid, teacherId);

    const body = await req.json();
    const studentId = body?.studentId as string | undefined;
    if (!studentId) return NextResponse.json({ error: "Missing studentId" }, { status: 400 });

    const studentRef = adminDb.collection("users").doc(studentId);
    const studentSnap = await studentRef.get();
    if (!studentSnap.exists) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Only remove the teacherId link; keep classId unchanged
    await studentRef.update({ teacherId: admin.firestore.FieldValue.delete() });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.message === "MISSING_AUTH_HEADER" || err?.message === "INVALID_AUTH_TOKEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("DELETE /api/teacher/[id]/students error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
