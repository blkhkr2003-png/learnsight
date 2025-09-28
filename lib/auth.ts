// lib/auth.ts
import admin from "@/lib/firebase-admin";

export async function verifyAuthHeader(req: Request): Promise<string> {
  const authHeader = req.headers.get("authorization");
  console.log("Auth header:", authHeader ? "Present" : "Missing");
  
  if (!authHeader?.startsWith("Bearer ")) {
    console.error("Auth header missing or does not start with Bearer");
    throw new Error("MISSING_AUTH_HEADER");
  }

  const idToken = authHeader.split("Bearer ")[1];
  console.log("ID Token length:", idToken ? idToken.length : "None");
  
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    console.log("Token verified successfully for UID:", decoded.uid);
    return decoded.uid; // Firebase UID
  } catch (err) {
    console.error("Error verifying ID token:", err);
    throw new Error("INVALID_AUTH_TOKEN");
  }
}
