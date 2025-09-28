import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin"; // make sure adminDb is exported
import type { Role } from "@/types";

export async function POST(req: Request) {
  try {
    const { idToken } = (await req.json()) as { idToken: string };

    // 1. Verify token
    const decoded = await adminAuth.verifyIdToken(idToken);

    // 2. Get Firestore user doc
    const userRef = adminDb.collection("users").doc(decoded.uid); // <-- adminDb is admin.firestore()
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userSnap.data();
    const isApproved = userData?.isApproved ?? false;
    const role = (userData?.role as Role) ?? "";
    console.log(isApproved);
    // 3. Return user info
    return NextResponse.json(
      {
        uid: decoded.uid,
        role,
        isApproved,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("verify token error:", err);
    return NextResponse.json(
      { error: err.message ?? String(err) },
      { status: 401 }
    );
  }
}
