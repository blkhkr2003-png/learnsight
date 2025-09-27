// lib/auth.ts
import admin from "@/lib/firebase-admin";

export async function verifyAuthHeader(req: Request): Promise<string> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("MISSING_AUTH_HEADER");
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded.uid; // Firebase UID
  } catch (err) {
    throw new Error("INVALID_AUTH_TOKEN");
  }
}
