import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    // Only allow students to self-register
    const ALLOWED_SELF_ROLES = ["student"];
    const ALLOWED_ROLES = ["student", "teacher", "parent"];

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const isSelfRegister = ALLOWED_SELF_ROLES.includes(role);
    const isApproved = isSelfRegister; // Only self-registering students are auto-approved

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // Assign secure role
    await adminAuth.setCustomUserClaims(userRecord.uid, { role, isApproved });

    // Store user profile in Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      name,
      email,
      role,
      isApproved,
      createdAt: new Date(),
      lastLogin: new Date(),
    });

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
