// lib/db-admin.ts
import admin from "firebase-admin";
import { adminDb } from "@/lib/firebase-admin";
import type {
  QuestionDoc,
  QuestionForClient,
  Fundamental,
  DiagnosticAttempt,
} from "@/types";

// Firestore collection names.
const QUESTIONS_COL = "questions";
const ATTEMPTS_COL = "diagnosticAttempts";

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

/**
 * Sample up to n unique docs from an array of QueryDocumentSnapshots.
 */
function sampleDocs<T>(
  docs: FirebaseFirestore.QueryDocumentSnapshot[],
  n: number
) {
  const unique = Array.from(new Map(docs.map((d) => [d.id, d])).values());
  shuffle(unique);
  return unique.slice(0, n);
}

/**
 * Fetch a single question by id
 */
export async function getQuestionById(id: string): Promise<QuestionDoc | null> {
  const snap = await adminDb.collection(QUESTIONS_COL).doc(id).get();
  if (!snap.exists) return null;
  // QueryDocumentSnapshot
  const querySnap = snap as FirebaseFirestore.QueryDocumentSnapshot;
  return docToQuestion(querySnap);
}

/**
 * Fetch N diagnostic questions for initial diagnostic.
 * Strategy:
 *  - try to pick roughly evenly across fundamentals (listening,grasping,retention,application)
 *  - prefer startingDifficulty (default 3); expand +/- if not enough
 *  - return QuestionForClient (no correctChoice)
 */
export async function fetchDiagnosticQuestions({
  count = 6,
  startingDifficulty = 3,
  fundamentals,
}: {
  count?: number;
  startingDifficulty?: number;
  fundamentals?: Fundamental[];
} = {}): Promise<QuestionForClient[]> {
  const ALL: Fundamental[] = [
    "listening",
    "grasping",
    "retention",
    "application",
  ];
  const fundList = fundamentals && fundamentals.length ? fundamentals : ALL;
  const perFund = Math.ceil(count / fundList.length);

  const picks: Map<string, QuestionDoc> = new Map();

  // For each fundamental try to gather up to perFund questions
  for (const f of fundList) {
    let found: FirebaseFirestore.QueryDocumentSnapshot[] = [];

    // Expand difficulty window outward until we get enough (delta 0..4)
    for (let delta = 0; delta <= 4 && found.length < perFund; delta++) {
      const ds: number[] = [];
      const low = startingDifficulty - delta;
      const high = startingDifficulty + delta;
      if (low >= 1) ds.push(low);
      if (high !== low && high <= 5) ds.push(high);

      // Query each difficulty once per delta iteration
      for (const d of ds) {
        try {
          const q = adminDb
            .collection(QUESTIONS_COL)
            .where("difficulty", "==", d)
            .where(`fundamentals.${f}`, ">", 0)
            .limit(perFund * 5); // fetch candidates
          const snap = await q.get();
          if (!snap.empty) {
            found = found.concat(snap.docs);
          }
        } catch (err) {
          // If the fundamentals.<f> field doesn't exist for some docs, query will simply return fewer docs.
          // Just continue.
          console.warn("fetchDiagnosticQuestions: partial fetch error", err);
        }
      }
    }

    const sampled = sampleDocs(found, perFund);
    for (const s of sampled) {
      const q = docToQuestion(s);
      if (!picks.has(q.id!)) picks.set(q.id!, q);
    }

    // stop early if we already have enough
    if (picks.size >= count) break;
  }

  // Fallback: if still not enough, fetch any questions around startingDifficulty
  if (picks.size < count) {
    for (let delta = 0; delta <= 4 && picks.size < count; delta++) {
      const ds: number[] = [];
      const low = startingDifficulty - delta;
      const high = startingDifficulty + delta;
      if (low >= 1) ds.push(low);
      if (high !== low && high <= 5) ds.push(high);

      for (const d of ds) {
        const snap = await adminDb
          .collection(QUESTIONS_COL)
          .where("difficulty", "==", d)
          .limit(50)
          .get();
        for (const doc of sampleDocs(snap.docs, 50)) {
          const q = docToQuestion(doc);
          if (!picks.has(q.id!)) {
            picks.set(q.id!, q);
            if (picks.size >= count) break;
          }
        }
        if (picks.size >= count) break;
      }
    }
  }

  // Final array: shuffle and trim to count
  const out = shuffle(Array.from(picks.values())).slice(0, count);

  // Strip correctChoice before returning to client
  const sanitized: QuestionForClient[] = out.map((q) => {
    const { correctChoice, ...rest } = q as any;
    return { ...(rest as QuestionForClient), id: q.id! };
  });

  return sanitized;
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
