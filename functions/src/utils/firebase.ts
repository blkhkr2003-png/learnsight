import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? undefined // Use default credentials in production
    : {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export const db = getFirestore();
export const auth = getAuth();

// Helper functions
export const serverTimestamp = () => getFirestore().Timestamp.now();

export const batchWrite = async (operations: Array<() => Promise<void>>) => {
  const batch = db.batch();
  for (const operation of operations) {
    await operation();
  }
  return batch.commit();
};