import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import admin from "@/lib/firebase-admin";
import { verifyAuthHeader } from "@/lib/auth";

// Define TypeScript interfaces for our data models
interface User {
  id: string;
  name?: string;
  email?: string;
  role: string;
  teacherId?: string;
}

interface DiagnosticAttempt {
  id: string;
  userId: string;
  score?: number;
  expectedQuestionCount?: number;
  total?: number; // Alternative field name for expectedQuestionCount
  completedAt?: any;
  scores?: Record<string, number>;
  aggregates?: {
    listening?: number;
    grasping?: number;
    retention?: number;
    application?: number;
  };
  weakFundamentals?: string[];
}

interface PracticeSession {
  id: string;
  studentId: string;
  startTime?: any;
  completed?: boolean;
}

// Helper function to cap values between 0-100
const cap = (val: number): number => Math.min(100, Math.max(0, val));

async function assertTeacherOrAdmin(requesterUid: string, teacherId: string) {
  if (requesterUid === teacherId) return; // teacher managing own students
  const requesterSnap = await adminDb
    .collection("users")
    .doc(requesterUid)
    .get();
  if (!requesterSnap.exists) throw new Error("FORBIDDEN");
  const role = requesterSnap.data()?.role;
  if (role !== "admin") throw new Error("FORBIDDEN");
}

// GET /api/teacher/[id]/students
// Lists all students assigned to the teacher with detailed analytics
export async function GET(req: Request, context: any) {
  try {
    const requesterUid = await verifyAuthHeader(req);
    const { id: teacherId } = await context.params;
    if (!teacherId)
      return NextResponse.json(
        { error: "Missing teacher id" },
        { status: 400 }
      );

    await assertTeacherOrAdmin(requesterUid, teacherId);

    // Get all students for this teacher
    const studentsSnap = await adminDb
      .collection("users")
      .where("role", "==", "student")
      .where("teacherId", "==", teacherId)
      .get();

    const studentsData: User[] = studentsSnap.docs.map((doc) => ({
      ...(doc.data() as User),
      id: doc.id, // Ensure we use the document ID as the user ID
    }));

    // For each student, fetch their diagnostic attempts and practice sessions
    const studentsWithDetails = await Promise.all(
      studentsData.map(async (student) => {
        const studentId = student.id;

        // Fetch diagnostic attempts
        const diagnosticAttemptsSnap = await adminDb
          .collection("diagnosticAttempts")
          .where("userId", "==", studentId)
          .orderBy("completedAt", "desc")
          .get();

        const diagnosticAttempts: DiagnosticAttempt[] =
          diagnosticAttemptsSnap.docs.map((doc) => ({
            ...(doc.data() as DiagnosticAttempt),
            id: doc.id, // Ensure we use the document ID as the attempt ID
          }));

        // Calculate diagnostic metrics
        let diagnosticCount = diagnosticAttempts.length;
        let lastDiagnostic = "N/A"; // Default value
        let overallProgress = 0; // Default value
        let weakestSkill = "N/A";
        let strongestSkill = "N/A";
        let trend = "down";
        let fundamentals = {
          listening: 0,
          grasping: 0,
          retention: 0,
          application: 0,
        };

        if (diagnosticAttempts.length > 0) {
          // Get the most recent diagnostic
          const latestDiagnostic = diagnosticAttempts[0];
          // Format date as YYYY-MM-DD or "N/A"
          lastDiagnostic =
            latestDiagnostic.completedAt
              ?.toDate()
              .toISOString()
              .split("T")[0] || "N/A";

          // Calculate overall progress as improvement from first to latest diagnostic
          const latestScore = latestDiagnostic.score || 0;
          const latestTotal =
            latestDiagnostic.expectedQuestionCount ||
            latestDiagnostic.total ||
            1;
          const latestPercent = Math.round((latestScore / latestTotal) * 100);

          // Get the first diagnostic attempt (oldest)
          const firstDiagnostic = diagnosticAttempts[diagnosticAttempts.length - 1];
          const firstScore = firstDiagnostic.score || 0;
          const firstTotal =
            firstDiagnostic.expectedQuestionCount ||
            firstDiagnostic.total ||
            1;
          const firstPercent = Math.round((firstScore / firstTotal) * 100);

          // If only one diagnostic, use that percentage as progress
          if (diagnosticAttempts.length === 1) {
            overallProgress = cap(latestPercent);
          } else {
            // Calculate relative improvement from first to latest
            const base = firstPercent > 0 ? firstPercent : 1;
            overallProgress = Math.min(100, Math.max(0, Math.round(((latestPercent - firstPercent) / base) * 100)));
          }

          // Calculate trend by comparing the latest two scores
          if (diagnosticAttempts.length > 1) {
            const previousDiagnostic = diagnosticAttempts[1];
            const previousScore = previousDiagnostic.score || 0;
            trend = latestScore > previousScore ? "up" : "down";
          }

          // Find weakest skill (most frequent weakFundamentals entry)
          const weakFundamentalsCount: Record<string, number> = {};
          diagnosticAttempts.forEach((attempt) => {
            if (
              attempt.weakFundamentals &&
              Array.isArray(attempt.weakFundamentals)
            ) {
              attempt.weakFundamentals.forEach((skill: string) => {
                weakFundamentalsCount[skill] =
                  (weakFundamentalsCount[skill] || 0) + 1;
              });
            }
          });

          if (Object.keys(weakFundamentalsCount).length > 0) {
            weakestSkill = Object.entries(weakFundamentalsCount).reduce(
              (max, [skill, count]) =>
                count > max.count ? { skill, count } : max,
              { skill: "", count: 0 }
            ).skill;
          }

          // Find strongest skill (highest value from latest scores)
          if (
            latestDiagnostic.scores &&
            typeof latestDiagnostic.scores === "object"
          ) {
            const scores = latestDiagnostic.scores as Record<string, number>;
            strongestSkill = Object.entries(scores).reduce(
              (max, [skill, value]) =>
                value > max.value ? { skill, value } : max,
              { skill: "N/A", value: 0 }
            ).skill;
          }

          // Calculate fundamentals as average of aggregates
          const aggregatesSum = {
            listening: 0,
            grasping: 0,
            retention: 0,
            application: 0,
          };
          let aggregatesCount = 0;

          diagnosticAttempts.forEach((attempt) => {
            if (attempt.aggregates && typeof attempt.aggregates === "object") {
              const aggregates = attempt.aggregates as Record<string, number>;
              if (aggregates.listening !== undefined)
                aggregatesSum.listening += aggregates.listening;
              if (aggregates.grasping !== undefined)
                aggregatesSum.grasping += aggregates.grasping;
              if (aggregates.retention !== undefined)
                aggregatesSum.retention += aggregates.retention;
              if (aggregates.application !== undefined)
                aggregatesSum.application += aggregates.application;
              aggregatesCount++;
            }
          });

          if (aggregatesCount > 0) {
            fundamentals = {
              listening: cap(
                Math.round(aggregatesSum.listening / aggregatesCount)
              ),
              grasping: cap(
                Math.round(aggregatesSum.grasping / aggregatesCount)
              ),
              retention: cap(
                Math.round(aggregatesSum.retention / aggregatesCount)
              ),
              application: cap(
                Math.round(aggregatesSum.application / aggregatesCount)
              ),
            };
          } else {
            // Provide default values if no aggregates data
            fundamentals = {
              listening: 0,
              grasping: 0,
              retention: 0,
              application: 0,
            };
          }
        }

        // Fetch practice sessions
        const practiceSessionsSnap = await adminDb
          .collection("practiceSessions")
          .where("studentId", "==", studentId)
          .orderBy("startTime", "desc")
          .get();

        const practiceSessions: PracticeSession[] =
          practiceSessionsSnap.docs.map((doc) => ({
            ...(doc.data() as PracticeSession),
            id: doc.id, // Ensure we use the document ID as the session ID
          }));

        // Calculate practice streak (consecutive days with completed == true)
        let practiceStreak = 0;
        if (practiceSessions.length > 0) {
          // Sort by startTime in ascending order for streak calculation
          const sortedSessions = [...practiceSessions].sort((a, b) => {
            const aTime = a.startTime?.toDate?.() || new Date(a.startTime);
            const bTime = b.startTime?.toDate?.() || new Date(b.startTime);
            return aTime.getTime() - bTime.getTime();
          });

          let currentStreak = 0;
          let lastDate: Date | null = null;

          for (const session of sortedSessions) {
            if (session.completed) {
              const sessionDate =
                session.startTime?.toDate?.() || new Date(session.startTime);
              sessionDate.setHours(0, 0, 0, 0);

              if (!lastDate) {
                currentStreak = 1;
              } else {
                const diffDays = Math.floor(
                  (sessionDate.getTime() - lastDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                if (diffDays === 1) {
                  // Consecutive day
                  currentStreak++;
                } else if (diffDays > 1) {
                  // Gap in practice, reset streak
                  currentStreak = 1;
                }
                // If diffDays === 0, it's the same day, don't increment
              }

              lastDate = sessionDate;
              practiceStreak = Math.max(practiceStreak, currentStreak);
            }
          }
        }

        // Determine status based on overallProgress
        let status: "excellent" | "active" | "needs-attention";
        if (overallProgress >= 80) {
          status = "excellent";
        } else if (overallProgress >= 50) {
          status = "active";
        } else {
          status = "needs-attention";
        }

        // Return formatted student data
        return {
          id: studentId,
          name: student.name || "Unknown",
          email: student.email || "N/A",
          lastDiagnostic,
          diagnosticCount,
          weakestSkill,
          strongestSkill,
          overallProgress: cap(overallProgress), // Ensure it's capped between 0-100
          status,
          trend,
          practiceStreak,
          fundamentals, // Already has defaults and capped values
        };
      })
    );

    return NextResponse.json({ success: true, students: studentsWithDetails });
  } catch (err: any) {
    if (
      err?.message === "MISSING_AUTH_HEADER" ||
      err?.message === "INVALID_AUTH_TOKEN"
    ) {
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
    if (!teacherId)
      return NextResponse.json(
        { error: "Missing teacher id" },
        { status: 400 }
      );
    await assertTeacherOrAdmin(requesterUid, teacherId);

    const body = await req.json();
    const studentId = body?.studentId as string | undefined;
    const classId = body?.classId as string | undefined;

    if (!studentId)
      return NextResponse.json({ error: "Missing studentId" }, { status: 400 });

    const studentRef = adminDb.collection("users").doc(studentId);
    const studentSnap = await studentRef.get();
    if (!studentSnap.exists)
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    if (studentSnap.data()?.role !== "student")
      return NextResponse.json(
        { error: "User is not a student" },
        { status: 400 }
      );

    await studentRef.update({ teacherId, ...(classId ? { classId } : {}) });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (
      err?.message === "MISSING_AUTH_HEADER" ||
      err?.message === "INVALID_AUTH_TOKEN"
    ) {
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
    if (!teacherId)
      return NextResponse.json(
        { error: "Missing teacher id" },
        { status: 400 }
      );
    await assertTeacherOrAdmin(requesterUid, teacherId);

    const body = await req.json();
    const studentId = body?.studentId as string | undefined;
    if (!studentId)
      return NextResponse.json({ error: "Missing studentId" }, { status: 400 });

    const studentRef = adminDb.collection("users").doc(studentId);
    const studentSnap = await studentRef.get();
    if (!studentSnap.exists)
      return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Only remove the teacherId link; keep classId unchanged
    await studentRef.update({ teacherId: admin.firestore.FieldValue.delete() });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (
      err?.message === "MISSING_AUTH_HEADER" ||
      err?.message === "INVALID_AUTH_TOKEN"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("DELETE /api/teacher/[id]/students error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
