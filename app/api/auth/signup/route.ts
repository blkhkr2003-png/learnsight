// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import admin from "firebase-admin";
import type { Role } from "@/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name: string;
      email: string;
      password: string;
      role: Role;
      teacherId?: string; // Optional field for students
    };

    const { name, email, password, role, teacherId } = body;

    const ALLOWED_SELF_ROLES: Role[] = ["student"];
    const ALLOWED_ROLES: Role[] = ["student", "teacher", "parent"];

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // If teacherId is provided, verify it exists and is a teacher
    if (teacherId && role === "student") {
      const teacherDoc = await adminDb.collection("users").doc(teacherId).get();
      if (!teacherDoc.exists) {
        return NextResponse.json({ error: "Teacher not found" }, { status: 400 });
      }

      const teacherData = teacherDoc.data();
      if (teacherData?.role !== "teacher") {
        return NextResponse.json({ error: "Invalid teacher ID" }, { status: 400 });
      }
    }

    const isSelfRegister = ALLOWED_SELF_ROLES.includes(role);
    const isApproved = isSelfRegister; // auto-approved only for self-registering students

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // Assign secure role & approval as custom claims
    await adminAuth.setCustomUserClaims(userRecord.uid, { role, isApproved });

    // Store profile in Firestore using admin timestamp
    const now = admin.firestore.Timestamp.now();

    const userDoc: {
      uid: string;
      name: string;
      email: string;
      role: Role;
      isApproved: boolean;
      createdAt: admin.firestore.Timestamp;
      lastLogin: admin.firestore.Timestamp;
      teacherId?: string;
    } = {
      uid: userRecord.uid,
      name,
      email,
      role,
      isApproved,
      createdAt: now,
      lastLogin: now,
    };

    // Add teacherId if provided and user is a student
    if (role === "student" && teacherId) {
      userDoc.teacherId = teacherId;
    }

    await adminDb.collection("users").doc(userRecord.uid).set(userDoc);

    // Return isApproved so frontend can show proper message
    return NextResponse.json(
      { success: true, uid: userRecord.uid, isApproved },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("signup error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
