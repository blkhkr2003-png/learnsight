// lib/db-admin.ts
import admin from "firebase-admin";
import { adminDb } from "@/lib/firebase-admin";
import type {
  QuestionDoc,
  QuestionForClient,
  Fundamental,
  DiagnosticAttempt,
} from "@/types";

// Firestore collection names as CONSTANTS
const QUESTIONS_COL = "questions";
const ATTEMPTS_COL = "diagnosticAttempts";
const PAPERS_COL = "papers";

function docToQuestion(
  doc: FirebaseFirestore.QueryDocumentSnapshot
): QuestionDoc {
  return { id: doc.id, ...(doc.data() as Omit<QuestionDoc, "id">) };
}

// Classic Fisher–Yates shuffle to randomize arrays.
function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Sample up to n unique docs
function sampleDocs<T>(
  docs: FirebaseFirestore.QueryDocumentSnapshot[],
  n: number
) {
  const unique = Array.from(new Map(docs.map((d) => [d.id, d])).values());
  shuffle(unique);
  return unique.slice(0, n);
}

// Fetch a single question by id
export async function getQuestionById(id: string): Promise<QuestionDoc | null> {
  const snap = await adminDb.collection(QUESTIONS_COL).doc(id).get();
  if (!snap.exists) return null;
  // QueryDocumentSnapshot
  const querySnap = snap as FirebaseFirestore.QueryDocumentSnapshot;
  return docToQuestion(querySnap);
}

// Fetch multiple questions by IDs
export async function getQuestionsByIds(ids: string[]): Promise<QuestionDoc[]> {
  const snaps = await Promise.all(
    ids.map((id) => adminDb.collection(QUESTIONS_COL).doc(id).get())
  );
  return snaps
    .filter((snap) => snap.exists)
    .map((snap) =>
      docToQuestion(snap as FirebaseFirestore.QueryDocumentSnapshot)
    );
}

/**
 * Create a diagnostic attempt (server-side).
 * Pass answers as array of { questionId, chosenIndex, correct }
 */
export async function createDiagnosticAttempt(
  attempt: Omit<DiagnosticAttempt, "id">
) {
  const now = admin.firestore.Timestamp.now();
  const payload = {
    ...attempt,
    startedAt: attempt.startedAt ?? now,
    completedAt: attempt.completedAt ?? null,
    createdAt: now,
  };
  const ref = await adminDb.collection(ATTEMPTS_COL).add(payload);
  return ref.id;
}

/**
 * Complete attempt: set completedAt and aggregates
 */
export async function finalizeDiagnosticAttempt(
  attemptId: string,
  updates: {
    completedAt?: FirebaseFirestore.Timestamp | null;
    aggregates?: Record<string, number>;
  }
) {
  const payload: any = {};
  if (updates.completedAt !== undefined)
    payload.completedAt = updates.completedAt;
  if (updates.aggregates !== undefined) payload.aggregates = updates.aggregates;
  await adminDb
    .collection(ATTEMPTS_COL)
    .doc(attemptId)
    .set(payload, { merge: true });
}

/**
 * Fetch a paper document and all its questions.
 * Returns { title, questionIds, questions[] } or null if not found.
 */
export async function getPaperQuestions(paperId: string) {
  // 1. Get the paper document
  const paperSnap = await adminDb.collection("papers").doc(paperId).get();
  if (!paperSnap.exists) return null;

  const paperData = paperSnap.data() as {
    title: string;
    questionIds: string[];
  };

  const questions = await getQuestionsByIds(paperData.questionIds);

  return {
    title: paperData.title,
    questionIds: paperData.questionIds,
    questions,
  };
}

// 🟩 Main Goal of lib/db-admin.ts
// This file is your server-side database helper for the diagnostic system.

// It does two big jobs:
// Manage Questions
// Fetches diagnostic questions from Firestore.
// Randomizes and balances them by fundamental + difficulty.
// Cleans answers before sending to the client (no cheating).
// Manage Diagnostic Attempts
// Creates new attempt records when a student starts a test.
// Updates those records when the student finishes (scores, aggregates).

// 📝 In One Sentence
// lib/db-admin.ts is the backend “data access layer” that talks to Firestore to serve adaptive diagnostic questions and record students’ test attempts.
