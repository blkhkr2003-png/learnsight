import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthHeader } from "@/lib/auth";

async function assertTeacherOrAdmin(requesterUid: string, teacherId: string) {
  if (requesterUid === teacherId) return; // teacher self
  const requesterSnap = await adminDb.collection("users").doc(requesterUid).get();
  if (!requesterSnap.exists) throw new Error("FORBIDDEN");
  const role = requesterSnap.data()?.role;
  if (role !== "admin") throw new Error("FORBIDDEN");
}

// GET /api/teacher/[id]/alerts
export async function GET(req: Request, context: any) {
  try {
    const requesterUid = await verifyAuthHeader(req);
    const { id: teacherId } = await context.params;
    if (!teacherId) return NextResponse.json({ error: "Missing teacher id" }, { status: 400 });

    await assertTeacherOrAdmin(requesterUid, teacherId);

    const url = new URL(req.url);
    const limitParam = parseInt(url.searchParams.get("limit") || "20", 10);
    const limitCount = isNaN(limitParam) ? 20 : Math.min(50, Math.max(1, limitParam));

    const snap = await adminDb
      .collection("teacherAlerts")
      .where("teacherId", "==", teacherId)
      .orderBy("createdAt", "desc")
      .limit(limitCount)
      .get();

    const alerts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ success: true, alerts });
  } catch (err: any) {
    if (err?.message === "MISSING_AUTH_HEADER" || err?.message === "INVALID_AUTH_TOKEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("GET /api/teacher/[id]/alerts error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
