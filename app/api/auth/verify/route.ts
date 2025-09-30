import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin"; // make sure adminDb is exported
import type { Role } from "@/types";

export async function POST(req: Request) {
  try {
    console.log("Starting auth verification");
    
    // Check if request body exists
    if (!req.body) {
      console.error("Request body is missing");
      return NextResponse.json({ error: "Request body is missing" }, { status: 400 });
    }
    
    const { idToken } = (await req.json()) as { idToken: string };
    
    if (!idToken) {
      console.error("ID token is missing");
      return NextResponse.json({ error: "ID token is required" }, { status: 400 });
    }

    console.log("Verifying ID token");
    // 1. Verify token
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
      console.log("ID token verified for UID:", decoded.uid);
    } catch (tokenError) {
      console.error("Error verifying ID token:", tokenError);
      return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
    }

    console.log("Fetching user document from Firestore");
    // 2. Get Firestore user doc
    const userRef = adminDb.collection("users").doc(decoded.uid);
    let userSnap;
    try {
      userSnap = await userRef.get();
    } catch (firestoreError) {
      console.error("Error fetching user from Firestore:", firestoreError);
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
    }

    if (!userSnap.exists) {
      console.error("User not found in Firestore for UID:", decoded.uid);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userSnap.data();
    const isApproved = userData?.isApproved ?? false;
    const role = (userData?.role as Role) ?? "";
    
    console.log(`User verification successful - UID: ${decoded.uid}, Role: ${role}, Approved: ${isApproved}`);
    
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
    console.error("Unexpected error in auth verification:", err);
    return NextResponse.json(
      { error: err.message ?? String(err) },
      { status: 500 }
    );
  }
}
