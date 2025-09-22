import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    const decoded = await adminAuth.verifyIdToken(idToken);
    return NextResponse.json({ uid: decoded.uid, role: decoded.role });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
