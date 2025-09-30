import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthHeader } from "@/lib/auth";

async function assertTeacherOrAdmin(requesterUid: string, teacherId: string) {
  try {
    if (requesterUid === teacherId) return; // teacher
    const requesterSnap = await adminDb
      .collection("users")
      .doc(requesterUid)
      .get();
    if (!requesterSnap.exists) throw new Error("FORBIDDEN");
    const role = requesterSnap.data()?.role;
    if (role !== "admin") throw new Error("FORBIDDEN");
  } catch (error) {
    console.error("Error in assertTeacherOrAdmin:", error);
    throw new Error("FORBIDDEN");
  }
}

// GET /api/teacher/[id]/reports
// Returns diagnostic attempts and practice sessions for all students of the teacher
export async function GET(req: Request, context: any) {
  try {
    // Get requester UID from auth header
    let requesterUid;
    try {
      requesterUid = await verifyAuthHeader(req);
      console.log("Authenticated user ID:", requesterUid);
    } catch (authError) {
      console.error("Authentication error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get teacher ID from params
    let teacherId;
    try {
      const params = await context.params;
      teacherId = params.id;
      if (!teacherId) {
        return NextResponse.json(
          { error: "Missing teacher id" },
          { status: 400 }
        );
      }
      console.log("Teacher ID:", teacherId);
    } catch (paramError) {
      console.error("Error getting teacher ID:", paramError);
      return NextResponse.json(
        { error: "Invalid teacher ID" },
        { status: 400 }
      );
    }

    // Check if user is teacher or admin
    try {
      await assertTeacherOrAdmin(requesterUid, teacherId);
    } catch (authError) {
      console.error("Authorization error:", authError);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Students assigned to the teacher
    let students = [];
    try {
      const studentsSnap = await adminDb
        .collection("users")
        .where("role", "==", "student")
        .where("teacherId", "==", teacherId)
        .get();

      students = studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      console.log(`Found ${students.length} students`);
    } catch (studentsError) {
      console.error("Error fetching students:", studentsError);
      return NextResponse.json(
        { error: "Failed to fetch students" },
        { status: 500 }
      );
    }

    const studentIds = students.map((s) => s.id);

    // Diagnostics
    const diagnosticAttempts: any[] = [];
    const batchSize = 10;
    try {
      for (let i = 0; i < studentIds.length; i += batchSize) {
        const batch = studentIds.slice(i, i + batchSize);
        if (batch.length === 0) continue;

        try {
          const snap = await adminDb
            .collection("diagnosticAttempts")
            .where("userId", "in", batch)
            .orderBy("createdAt", "desc")
            .get();
          diagnosticAttempts.push(
            ...snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          );
        } catch (batchError) {
          console.error(
            `Error fetching diagnostic attempts for batch ${i}:`,
            batchError
          );
          // Continue with other batches instead of failing completely
        }
      }
    } catch (diagnosticError) {
      console.error("Error fetching diagnostic attempts:", diagnosticError);
      // Continue without diagnostic data rather than failing completely
    }

    // Practice sessions
    const practiceSessions: any[] = [];
    try {
      for (let i = 0; i < studentIds.length; i += batchSize) {
        const batch = studentIds.slice(i, i + batchSize);
        if (batch.length === 0) continue;

        try {
          const snap = await adminDb
            .collection("practiceSessions")
            .where("studentId", "in", batch)
            .orderBy("startTime", "desc")
            .get();
          practiceSessions.push(
            ...snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          );
        } catch (batchError) {
          console.error(
            `Error fetching practice sessions for batch ${i}:`,
            batchError
          );
          // Continue with other batches instead of failing completely
        }
      }
    } catch (practiceError) {
      console.error("Error fetching practice sessions:", practiceError);
      // Continue without practice data rather than failing completely
    }

    console.log(
      `Returning ${diagnosticAttempts.length} diagnostic attempts and ${practiceSessions.length} practice sessions`
    );
    return NextResponse.json({
      success: true,
      data: { students, diagnosticAttempts, practiceSessions },
    });
  } catch (err: any) {
    console.error("Unexpected error in GET /api/teacher/[id]/reports:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
