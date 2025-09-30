// app/api/student/[id]/update/route.ts
import { NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import admin from "firebase-admin";
import type { UserDoc } from "@/types";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authorization token from the request headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing authentication token" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Check if the user is trying to update their own profile
    if (uid !== params.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only update your own profile" },
        { status: 403 }
      );
    }

    // Get the current user data
    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data() as UserDoc;

    // Ensure the user is a student
    if (userData.role !== "student") {
      return NextResponse.json(
        { error: "Forbidden: Only students can use this endpoint" },
        { status: 403 }
      );
    }

    // Get the update data from the request body
    const body = await req.json();
    const { name, teacherId } = body;

    // Validate the input
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid name" },
        { status: 400 }
      );
    }

    // If teacherId is provided, verify it exists and is a teacher
    if (teacherId) {
      const teacherDoc = await getDoc(doc(db, "users", teacherId));
      if (!teacherDoc.exists()) {
        return NextResponse.json(
          { error: "Teacher not found" },
          { status: 400 }
        );
      }

      const teacherData = teacherDoc.data();
      if (teacherData?.role !== "teacher") {
        return NextResponse.json(
          { error: "Invalid teacher ID" },
          { status: 400 }
        );
      }
    }

    // Prepare the update data
    const updateData: Partial<UserDoc> = {
      name,
    };

    // Only include teacherId if it's provided (or explicitly set to null to remove it)
    if (teacherId !== undefined) {
      updateData.teacherId = teacherId || null;
    }

    // Update the user document
    await updateDoc(doc(db, "users", uid), updateData);

    // Return the updated user data
    return NextResponse.json({
      success: true,
      user: {
        ...userData,
        ...updateData,
      },
    });
  } catch (error: any) {
    console.error("Error updating student profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
