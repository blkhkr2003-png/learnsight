// app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import type { Role } from "@/types";

export async function POST(req: Request) {
  try {
    const { idToken } = (await req.json()) as { idToken: string };
    const decoded = await adminAuth.verifyIdToken(idToken);

    // console.log("DECODE:", decoded);
    const role = (decoded.role ?? "student") as Role;
    const isApproved = Boolean(decoded.isApproved);

    return NextResponse.json(
      { uid: decoded.uid, role, isApproved },
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
