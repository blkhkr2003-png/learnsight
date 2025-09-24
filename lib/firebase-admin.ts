import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import admin from "firebase-admin";

// console.log("PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
// console.log("CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
// console.log("PRIVATE_KEY length:", process.env.FIREBASE_PRIVATE_KEY?.length);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // important!
    } as admin.ServiceAccount),
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
