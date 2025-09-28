// app/api/diagnostic/get-attempt/route.ts
import { NextResponse } from "next/server";
import admin from "@/lib/firebase-admin";
import { verifyAuthHeader } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const attemptId = url.searchParams.get("attemptId");

    if (!attemptId) {
      return NextResponse.json(
        { error: "attemptId is required" },
        { status: 400 }
      );
    }

    // Verify authentication
    await verifyAuthHeader(req);

    // Get the attempt document
    const attemptRef = admin.firestore().collection("diagnosticAttempts").doc(attemptId);
    const attemptSnap = await attemptRef.get();

    if (!attemptSnap.exists) {
      return NextResponse.json(
        { error: "Attempt not found" },
        { status: 404 }
      );
    }

    const attempt = attemptSnap.data();

    return NextResponse.json(
      { attempt },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error getting diagnostic attempt:", err);

    if (err.message === "MISSING_AUTH_HEADER" || err.message === "INVALID_AUTH_TOKEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
