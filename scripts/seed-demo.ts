// scripts/seed-demo.ts
import admin, { adminDb } from "@/lib/firebase-admin";
import type { QuestionDoc, Fundamental } from "@/types";

async function seedQuestions() {
  const now = admin.firestore.Timestamp.now();

  // Helper to create fundamentals object
  const f = (fundamentals: Partial<Record<Fundamental, number>>) =>
    fundamentals;

  // Your question list (no "id" yet)
  const rawQuestions: Omit<QuestionDoc, "id">[] = [
    // Listening
    {
      question: "Listen carefully: What color was the car?",
      difficulty: 1,
      choices: ["Red", "Blue", "Green", "Yellow"],
      correctChoice: 0,
      fundamentals: f({ listening: 1 }),
    },
    {
      question: "Listen carefully: What animal did you hear in the story?",
      difficulty: 1,
      choices: ["Dog", "Cat", "Elephant", "Bird"],
      correctChoice: 3,
      fundamentals: f({ listening: 1, retention: 0.3 }),
    },
    {
      question: "Listen carefully: What number did the teacher say?",
      difficulty: 2,
      choices: ["Five", "Seven", "Nine", "Eleven"],
      correctChoice: 1,
      fundamentals: f({ listening: 1, grasping: 0.5 }),
    },
    {
      question: "Listen carefully: Which object was mentioned first?",
      difficulty: 2,
      choices: ["Book", "Pen", "Chair", "Table"],
      correctChoice: 0,
      fundamentals: f({ listening: 1 }),
    },

    // Grasping
    {
      question: "2 + 2 = ?",
      difficulty: 1,
      choices: ["3", "4", "5", "6"],
      correctChoice: 1,
      fundamentals: f({ grasping: 1 }),
    },
    {
      question: "3 × 3 = ?",
      difficulty: 1,
      choices: ["6", "9", "12", "8"],
      correctChoice: 1,
      fundamentals: f({ grasping: 1 }),
    },
    {
      question: "What comes next in the sequence: 2, 4, 6, ?",
      difficulty: 2,
      choices: ["8", "7", "10", "6"],
      correctChoice: 0,
      fundamentals: f({ grasping: 1, application: 0.3 }),
    },
    {
      question: "Which shape has 4 equal sides?",
      difficulty: 2,
      choices: ["Rectangle", "Square", "Triangle", "Circle"],
      correctChoice: 1,
      fundamentals: f({ grasping: 1 }),
    },

    // Retention
    {
      question: "Recall: Yesterday’s concept was about...?",
      difficulty: 1,
      choices: ["Photosynthesis", "Gravity", "Electricity", "Atoms"],
      correctChoice: 0,
      fundamentals: f({ retention: 1 }),
    },
    {
      question: "Recall: What is H2O commonly known as?",
      difficulty: 1,
      choices: ["Salt", "Water", "Oxygen", "Hydrogen"],
      correctChoice: 1,
      fundamentals: f({ retention: 1 }),
    },
    {
      question: "Recall: Which planet is known as the Red Planet?",
      difficulty: 2,
      choices: ["Earth", "Mars", "Venus", "Jupiter"],
      correctChoice: 1,
      fundamentals: f({ retention: 1, grasping: 0.2 }),
    },
    {
      question: "Recall: Who discovered gravity?",
      difficulty: 2,
      choices: ["Newton", "Einstein", "Galileo", "Tesla"],
      correctChoice: 0,
      fundamentals: f({ retention: 1 }),
    },

    // Application
    {
      question: "Apply: Solve this new problem based on last lesson",
      difficulty: 1,
      choices: ["Option A", "Option B", "Option C", "Option D"],
      correctChoice: 2,
      fundamentals: f({ application: 1, grasping: 0.4 }),
    },
    {
      question: "Apply: If you double 5 apples and eat 3, how many remain?",
      difficulty: 1,
      choices: ["7", "8", "5", "6"],
      correctChoice: 0,
      fundamentals: f({ application: 1, grasping: 0.5 }),
    },
    {
      question:
        "Apply: If a train moves 60 km/h, how far does it travel in 2 hours?",
      difficulty: 2,
      choices: ["100 km", "120 km", "150 km", "200 km"],
      correctChoice: 1,
      fundamentals: f({ application: 1, grasping: 0.3 }),
    },
  ];

  // Create questions individually
  const questionIds: string[] = [];

  for (const q of rawQuestions) {
    // Make a new doc id for each question
    const docRef = adminDb.collection("questions").doc();
    await docRef.set({
      ...q,
      createdAt: now,
      updatedAt: now,
    });
    questionIds.push(docRef.id);
  }

  // Create a paper doc referencing them
  await adminDb.collection("papers").doc("demoPaper").set({
    title: "Demo Questions Paper",
    questionIds,
    createdAt: now,
    updatedAt: now,
  });

  console.log(
    `Seeded ${questionIds.length} questions and created demoPaper with all question IDs`
  );
}

seedQuestions()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
