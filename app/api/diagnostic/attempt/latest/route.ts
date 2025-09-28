
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAuthHeader } from "@/lib/auth";

// GET /api/diagnostic/attempt/latest?userId=<uid>
// Returns the latest diagnostic attempt for the specified user
export async function GET(req: Request) {
  try {
    // Verify authentication
    const uid = await verifyAuthHeader(req);

    // Get userId from query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 }
      );
    }

    // Security check: Users can only access their own data
    if (uid !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Fetch the latest diagnostic attempt for this user
    const snap = await adminDb
      .collection("diagnosticAttempts")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ 
        attempt: null,
        message: "No diagnostic attempts found for this user" 
      });
    }

    // Get the latest attempt
    const latestAttempt = snap.docs[0];
    const data = latestAttempt.data();

    return NextResponse.json({ 
      attempt: {
        id: latestAttempt.id,
        userId: data.userId,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        answers: data.answers,
        aggregates: data.aggregates,
        createdAt: data.createdAt
      }
    });
  } catch (err: any) {
    switch (err?.message) {
      case "MISSING_AUTH_HEADER":
      case "INVALID_AUTH_TOKEN":
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      default:
        console.error("GET /api/diagnostic/attempt/latest error", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
}
