import { NextResponse } from "next/server";
import { POST } from "../route";

// app/api/diagnostic/submit-answer/route.test.ts

// app/api/diagnostic/submit-answer/route.test.ts
// --- Mocks for dependencies ---

// Mock Timestamp class
class MockTimestamp {
  static now = jest.fn().mockImplementation(() => new MockTimestamp() as any);
  toDate = jest.fn().mockReturnValue(new Date("2023-01-01T00:00:00.000Z"));
}

// Mock admin.firestore.Timestamp
class Mockadmin {
  public firestore = {
    Timestamp: MockTimestamp as any,
  };
}
const mockAdminInstance = new Mockadmin() as any;

// Mock DiagnosticAttempt
interface MockDiagnosticAttempt {
  id?: string;
  userId: string;
  startedAt: MockTimestamp;
  completedAt?: MockTimestamp;
  answers: {
    questionId: string;
    chosenIndex: number;
    correct: boolean;
    answeredAt?: MockTimestamp;
    difficulty?: number | null;
    fundamentals?: any;
  }[];
  aggregates?: Record<string, number>;
}

// Mock QuestionDoc
interface MockQuestionDoc {
  id?: string;
  question: string;
  difficulty: number;
  choices?: string[];
  correctChoice?: number;
  fundamentals?: Partial<Record<string, number>>;
}

// Mock Firestore DocumentSnapshot
class MockDocSnap {
  public exists: boolean;
  private _data: any;
  constructor(exists: boolean, data: any) {
    this.exists = exists;
    this._data = data;
  }
  data = jest.fn().mockImplementation(() => this._data);
}

// Mock Firestore Transaction
class MockTransaction {
  public get = jest.fn();
  public update = jest.fn();
}

// Mock Firestore CollectionReference

// Mock adminDb
class MockadminDb {
  public collection = jest.fn();
  public runTransaction = jest.fn();
}
const mockAdminDbInstance = new MockadminDb() as any;

// --- Mocking imports ---
jest.mock("@/lib/firebase-admin", () => ({
  __esModule: true,
  default: mockAdminInstance,
  adminDb: mockAdminDbInstance,
}));

// --- Mock NextResponse ---
jest.mock("next/server", () => {
  const actual = jest.requireActual("next/server");
  return {
    ...actual,
    NextResponse: {
      json: jest.fn(),
    },
  };
});

// --- Helper to create mock Request ---
function createMockRequest(jsonData: any) {
  return {
    json: jest.fn().mockResolvedValue(jsonData),
  } as any;
}

// --- Helper to reset all mocks ---
function resetAllMocks() {
  jest.clearAllMocks();
  (MockTimestamp.now as jest.Mock).mockClear();
}

// --- The tests ---
describe("POST() POST method", () => {
  // Happy Paths
  describe("Happy paths", () => {
    beforeEach(() => {
      resetAllMocks();
    });

    it("should submit a new answer for a valid attempt and question (first answer)", async () => {
      // This test aims to verify that a new answer is added to an attempt with no previous answers.
      const attemptId = "attempt1";
      const questionId = "q1";
      const chosenIndex = 1;

      // Mock request body
      const req = createMockRequest({
        attemptId,
        questionId,
        chosenIndex,
      });

      // Mock Firestore references
      const mockAttemptRef = {};
      const mockQRef = {};

      // Mock attempt and question docs
      const mockAttempt: MockDiagnosticAttempt = {
        id: attemptId,
        userId: "user1",
        startedAt: new MockTimestamp() as any,
        answers: [],
      };
      const mockQuestion: MockQuestionDoc = {
        id: questionId,
        question: "What is 2+2?",
        difficulty: 2,
        choices: ["3", "4", "5"],
        correctChoice: 1,
        fundamentals: { listening: 1 },
      };

      // Mock collection().doc()
      (mockAdminDbInstance.collection as jest.Mock).mockImplementation(
        (col: string) => {
          if (col === "diagnosticAttempts") {
            return { doc: jest.fn().mockReturnValue(mockAttemptRef) } as any;
          }
          if (col === "questions") {
            return { doc: jest.fn().mockReturnValue(mockQRef) } as any;
          }
        }
      );

      // Mock transaction.get()
      const mockTx = new MockTransaction();
      (mockTx.get as jest.Mock).mockImplementation((ref: any) => {
        if (ref === mockAttemptRef) {
          return Promise.resolve(new MockDocSnap(true, mockAttempt) as any);
        }
        if (ref === mockQRef) {
          return Promise.resolve(new MockDocSnap(true, mockQuestion) as any);
        }
      });

      // Mock transaction.update()
      (mockTx.update as jest.Mock).mockResolvedValue(undefined);

      // Mock runTransaction
      (mockAdminDbInstance.runTransaction as jest.Mock).mockImplementation(
        async (fn: any) => {
          return fn(mockTx as any);
        }
      );

      // Mock Timestamp.now
      (MockTimestamp.now as jest.Mock).mockReturnValue(
        new MockTimestamp() as any
      );

      // Mock NextResponse.json
      (NextResponse.json as jest.Mock).mockImplementation((body, opts) => ({
        body,
        opts,
      }));

      // Act
      const res = await POST(req as any);

      // Assert
      expect(mockAdminDbInstance.collection).toHaveBeenCalledWith(
        "diagnosticAttempts"
      );
      expect(mockAdminDbInstance.collection).toHaveBeenCalledWith("questions");
      expect(mockTx.get).toHaveBeenCalledTimes(2);
      expect(mockTx.update).toHaveBeenCalledTimes(1);

      // The answer should be correct, score 100, answersCount 1
      expect(res.body).toMatchObject({
        status: "ok",
        correct: true,
        score: 100,
        answersCount: 1,
      });
      expect(res.opts.status).toBe(200);
    });

    it("should update an existing answer for the same question", async () => {
      // This test aims to verify that an existing answer for a question is updated, not duplicated.
      const attemptId = "attempt2";
      const questionId = "q2";
      const chosenIndex = 0;

      // Previous answer was incorrect, now user selects correct
      const mockAttempt: MockDiagnosticAttempt = {
        id: attemptId,
        userId: "user2",
        startedAt: new MockTimestamp() as any,
        answers: [
          {
            questionId,
            chosenIndex: 2,
            correct: false,
            answeredAt: new MockTimestamp() as any,
          },
        ],
      };
      const mockQuestion: MockQuestionDoc = {
        id: questionId,
        question: "Capital of France?",
        difficulty: 1,
        choices: ["Paris", "London", "Berlin"],
        correctChoice: 0,
        fundamentals: { grasping: 1 },
      };

      // Mock request
      const req = createMockRequest({
        attemptId,
        questionId,
        chosenIndex,
      });

      // Mock Firestore references
      const mockAttemptRef = {};
      const mockQRef = {};

      (mockAdminDbInstance.collection as jest.Mock).mockImplementation(
        (col: string) => {
          if (col === "diagnosticAttempts") {
            return { doc: jest.fn().mockReturnValue(mockAttemptRef) } as any;
          }
          if (col === "questions") {
            return { doc: jest.fn().mockReturnValue(mockQRef) } as any;
          }
        }
      );

      const mockTx = new MockTransaction();
      (mockTx.get as jest.Mock).mockImplementation((ref: any) => {
        if (ref === mockAttemptRef) {
          return Promise.resolve(new MockDocSnap(true, mockAttempt) as any);
        }
        if (ref === mockQRef) {
          return Promise.resolve(new MockDocSnap(true, mockQuestion) as any);
        }
      });
      (mockTx.update as jest.Mock).mockResolvedValue(undefined);

      (mockAdminDbInstance.runTransaction as jest.Mock).mockImplementation(
        async (fn: any) => {
          return fn(mockTx as any);
        }
      );

      (MockTimestamp.now as jest.Mock).mockReturnValue(
        new MockTimestamp() as any
      );

      (NextResponse.json as jest.Mock).mockImplementation((body, opts) => ({
        body,
        opts,
      }));

      // Act
      const res = await POST(req as any);

      // Assert
      expect(mockTx.update).toHaveBeenCalledTimes(1);
      expect(res.body).toMatchObject({
        status: "ok",
        correct: true,
        score: 100,
        answersCount: 1,
      });
      expect(res.opts.status).toBe(200);
    });

    it("should handle multiple answers and compute score correctly", async () => {
      // This test aims to verify that the score is computed as percentage of correct answers.
      const attemptId = "attempt3";
      const questionId = "q3";
      const chosenIndex = 1;

      // Previous answers: 1 correct, 1 incorrect
      const mockAttempt: MockDiagnosticAttempt = {
        id: attemptId,
        userId: "user3",
        startedAt: new MockTimestamp() as any,
        answers: [
          {
            questionId: "q1",
            chosenIndex: 0,
            correct: true,
            answeredAt: new MockTimestamp() as any,
          },
          {
            questionId: "q2",
            chosenIndex: 2,
            correct: false,
            answeredAt: new MockTimestamp() as any,
          },
        ],
      };
      const mockQuestion: MockQuestionDoc = {
        id: questionId,
        question: "Largest planet?",
        difficulty: 3,
        choices: ["Earth", "Jupiter", "Mars"],
        correctChoice: 1,
        fundamentals: { retention: 1 },
      };

      const req = createMockRequest({
        attemptId,
        questionId,
        chosenIndex,
      });

      const mockAttemptRef = {};
      const mockQRef = {};

      (mockAdminDbInstance.collection as jest.Mock).mockImplementation(
        (col: string) => {
          if (col === "diagnosticAttempts") {
            return { doc: jest.fn().mockReturnValue(mockAttemptRef) } as any;
          }
          if (col === "questions") {
            return { doc: jest.fn().mockReturnValue(mockQRef) } as any;
          }
        }
      );

      const mockTx = new MockTransaction();
      (mockTx.get as jest.Mock).mockImplementation((ref: any) => {
        if (ref === mockAttemptRef) {
          return Promise.resolve(new MockDocSnap(true, mockAttempt) as any);
        }
        if (ref === mockQRef) {
          return Promise.resolve(new MockDocSnap(true, mockQuestion) as any);
        }
      });
      (mockTx.update as jest.Mock).mockResolvedValue(undefined);

      (mockAdminDbInstance.runTransaction as jest.Mock).mockImplementation(
        async (fn: any) => {
          return fn(mockTx as any);
        }
      );

      (MockTimestamp.now as jest.Mock).mockReturnValue(
        new MockTimestamp() as any
      );

      (NextResponse.json as jest.Mock).mockImplementation((body, opts) => ({
        body,
        opts,
      }));

      // Act
      const res = await POST(req as any);

      // Assert
      // Now 2 correct out of 3 answers: score = 67
      expect(res.body).toMatchObject({
        status: "ok",
        correct: true,
        score: 67,
        answersCount: 3,
      });
      expect(res.opts.status).toBe(200);
    });
  });

  // Edge Cases
  describe("Edge cases", () => {
    beforeEach(() => {
      resetAllMocks();
    });

    it("should return 400 for invalid request payload (missing fields)", async () => {
      // This test aims to verify that missing required fields triggers a 400 error.
      const req = createMockRequest({
        attemptId: "", // invalid: empty
        // questionId missing
        chosenIndex: 0,
      });

      (NextResponse.json as jest.Mock).mockImplementation((body, opts) => ({
        body,
        opts,
      }));

      // Act
      const res = await POST(req as any);

      // Assert
      expect(res.body.error).toBe("Invalid request payload");
      expect(res.opts.status).toBe(400);
      expect(res.body.details).toBeDefined();
    });

    it("should return 404 if attempt not found", async () => {
      // This test aims to verify that a missing attempt triggers a 404 error.
      const attemptId = "notfound";
      const questionId = "q1";
      const chosenIndex = 0;

      const req = createMockRequest({
        attemptId,
        questionId,
        chosenIndex,
      });

      const mockAttemptRef = {};
      const mockQRef = {};

      (mockAdminDbInstance.collection as jest.Mock).mockImplementation(
        (col: string) => {
          if (col === "diagnosticAttempts") {
            return { doc: jest.fn().mockReturnValue(mockAttemptRef) } as any;
          }
          if (col === "questions") {
            return { doc: jest.fn().mockReturnValue(mockQRef) } as any;
          }
        }
      );

      const mockTx = new MockTransaction();
      (mockTx.get as jest.Mock).mockImplementation((ref: any) => {
        if (ref === mockAttemptRef) {
          return Promise.resolve(new MockDocSnap(false, null) as any);
        }
        if (ref === mockQRef) {
          return Promise.resolve(new MockDocSnap(true, {}) as any);
        }
      });

      (mockAdminDbInstance.runTransaction as jest.Mock).mockImplementation(
        async (fn: any) => {
          try {
            return await fn(mockTx as any);
          } catch (e) {
            throw e;
          }
        }
      );

      (NextResponse.json as jest.Mock).mockImplementation((body, opts) => ({
        body,
        opts,
      }));

      // Act
      const res = await POST(req as any);

      // Assert
      expect(res.body.error).toBe("Attempt not found");
      expect(res.opts.status).toBe(404);
    });

    it("should return 404 if question not found", async () => {
      // This test aims to verify that a missing question triggers a 404 error.
      const attemptId = "attemptX";
      const questionId = "notfound";
      const chosenIndex = 0;

      const req = createMockRequest({
        attemptId,
        questionId,
        chosenIndex,
      });

      const mockAttemptRef = {};
      const mockQRef = {};

      (mockAdminDbInstance.collection as jest.Mock).mockImplementation(
        (col: string) => {
          if (col === "diagnosticAttempts") {
            return { doc: jest.fn().mockReturnValue(mockAttemptRef) } as any;
          }
          if (col === "questions") {
            return { doc: jest.fn().mockReturnValue(mockQRef) } as any;
          }
        }
      );

      const mockTx = new MockTransaction();
      (mockTx.get as jest.Mock).mockImplementation((ref: any) => {
        if (ref === mockAttemptRef) {
          return Promise.resolve(
            new MockDocSnap(true, {
              id: attemptId,
              userId: "userX",
              startedAt: new MockTimestamp() as any,
              answers: [],
            }) as any
          );
        }
        if (ref === mockQRef) {
          return Promise.resolve(new MockDocSnap(false, null) as any);
        }
      });

      (mockAdminDbInstance.runTransaction as jest.Mock).mockImplementation(
        async (fn: any) => {
          try {
            return await fn(mockTx as any);
          } catch (e) {
            throw e;
          }
        }
      );

      (NextResponse.json as jest.Mock).mockImplementation((body, opts) => ({
        body,
        opts,
      }));

      // Act
      const res = await POST(req as any);

      // Assert
      expect(res.body.error).toBe("Question not found");
      expect(res.opts.status).toBe(404);
    });

    it("should return 400 if attempt is already completed", async () => {
      // This test aims to verify that submitting an answer to a completed attempt triggers a 400 error.
      const attemptId = "attemptC";
      const questionId = "qC";
      const chosenIndex = 0;

      const req = createMockRequest({
        attemptId,
        questionId,
        chosenIndex,
      });

      const mockAttemptRef = {};
      const mockQRef = {};

      const mockAttempt: MockDiagnosticAttempt = {
        id: attemptId,
        userId: "userC",
        startedAt: new MockTimestamp() as any,
        completedAt: new MockTimestamp() as any,
        answers: [],
      };
      const mockQuestion: MockQuestionDoc = {
        id: questionId,
        question: "Completed?",
        difficulty: 1,
        choices: ["Yes", "No"],
        correctChoice: 0,
      };

      (mockAdminDbInstance.collection as jest.Mock).mockImplementation(
        (col: string) => {
          if (col === "diagnosticAttempts") {
            return { doc: jest.fn().mockReturnValue(mockAttemptRef) } as any;
          }
          if (col === "questions") {
            return { doc: jest.fn().mockReturnValue(mockQRef) } as any;
          }
        }
      );

      const mockTx = new MockTransaction();
      (mockTx.get as jest.Mock).mockImplementation((ref: any) => {
        if (ref === mockAttemptRef) {
          return Promise.resolve(new MockDocSnap(true, mockAttempt) as any);
        }
        if (ref === mockQRef) {
          return Promise.resolve(new MockDocSnap(true, mockQuestion) as any);
        }
      });

      (mockAdminDbInstance.runTransaction as jest.Mock).mockImplementation(
        async (fn: any) => {
          try {
            return await fn(mockTx as any);
          } catch (e) {
            throw e;
          }
        }
      );

      (NextResponse.json as jest.Mock).mockImplementation((body, opts) => ({
        body,
        opts,
      }));

      // Act
      const res = await POST(req as any);

      // Assert
      expect(res.body.error).toBe("Attempt already completed");
      expect(res.opts.status).toBe(400);
    });

    it("should return 400 if chosenIndex is out of range (negative)", async () => {
      // This test aims to verify that a negative chosenIndex triggers a 400 error.
      const attemptId = "attemptN";
      const questionId = "qN";
      const chosenIndex = -1;

      const req = createMockRequest({
        attemptId,
        questionId,
        chosenIndex,
      });

      const mockAttemptRef = {};
      const mockQRef = {};

      const mockAttempt: MockDiagnosticAttempt = {
        id: attemptId,
        userId: "userN",
        startedAt: new MockTimestamp() as any,
        answers: [],
      };
      const mockQuestion: MockQuestionDoc = {
        id: questionId,
        question: "Negative index?",
        difficulty: 1,
        choices: ["A", "B"],
        correctChoice: 0,
      };

      (mockAdminDbInstance.collection as jest.Mock).mockImplementation(
        (col: string) => {
          if (col === "diagnosticAttempts") {
            return { doc: jest.fn().mockReturnValue(mockAttemptRef) } as any;
          }
          if (col === "questions") {
            return { doc: jest.fn().mockReturnValue(mockQRef) } as any;
          }
        }
      );

      const mockTx = new MockTransaction();
      (mockTx.get as jest.Mock).mockImplementation((ref: any) => {
        if (ref === mockAttemptRef) {
          return Promise.resolve(new MockDocSnap(true, mockAttempt) as any);
        }
        if (ref === mockQRef) {
          return Promise.resolve(new MockDocSnap(true, mockQuestion) as any);
        }
      });

      (mockAdminDbInstance.runTransaction as jest.Mock).mockImplementation(
        async (fn: any) => {
          try {
            return await fn(mockTx as any);
          } catch (e) {
            throw e;
          }
        }
      );

      (NextResponse.json as jest.Mock).mockImplementation((body, opts) => ({
        body,
        opts,
      }));

      // Act
      const res = await POST(req as any);

      // Assert
      expect(res.body.error).toBe("chosenIndex out of range for that question");
      expect(res.opts.status).toBe(400);
    });

    it("should return 400 if chosenIndex is out of range (too large)", async () => {
      // This test aims to verify that a chosenIndex greater than choices.length triggers a 400 error.
      const attemptId = "attemptL";
      const questionId = "qL";
      const chosenIndex = 5; // Only 2 choices

      const req = createMockRequest({
        attemptId,
        questionId,
        chosenIndex,
      });

      const mockAttemptRef = {};
      const mockQRef = {};

      const mockAttempt: MockDiagnosticAttempt = {
        id: attemptId,
        userId: "userL",
        startedAt: new MockTimestamp() as any,
        answers: [],
      };
      const mockQuestion: MockQuestionDoc = {
        id: questionId,
        question: "Too large index?",
        difficulty: 1,
        choices: ["A", "B"],
        correctChoice: 0,
      };

      (mockAdminDbInstance.collection as jest.Mock).mockImplementation(
        (col: string) => {
          if (col === "diagnosticAttempts") {
            return { doc: jest.fn().mockReturnValue(mockAttemptRef) } as any;
          }
          if (col === "questions") {
            return { doc: jest.fn().mockReturnValue(mockQRef) } as any;
          }
        }
      );

      const mockTx = new MockTransaction();
      (mockTx.get as jest.Mock).mockImplementation((ref: any) => {
        if (ref === mockAttemptRef) {
          return Promise.resolve(new MockDocSnap(true, mockAttempt) as any);
        }
        if (ref === mockQRef) {
          return Promise.resolve(new MockDocSnap(true, mockQuestion) as any);
        }
      });

      (mockAdminDbInstance.runTransaction as jest.Mock).mockImplementation(
        async (fn: any) => {
          try {
            return await fn(mockTx as any);
          } catch (e) {
            throw e;
          }
        }
      );

      (NextResponse.json as jest.Mock).mockImplementation((body, opts) => ({
        body,
        opts,
      }));

      // Act
      const res = await POST(req as any);

      // Assert
      expect(res.body.error).toBe("chosenIndex out of range for that question");
      expect(res.opts.status).toBe(400);
    });

    it("should return 500 for unexpected errors", async () => {
      // This test aims to verify that unexpected errors are caught and return a 500 error.
      const req = createMockRequest({
        attemptId: "attemptE",
        questionId: "qE",
        chosenIndex: 0,
      });

      // Simulate runTransaction throws
      (mockAdminDbInstance.runTransaction as jest.Mock).mockRejectedValue(
        new Error("SOME_UNEXPECTED_ERROR") as never
      );

      (NextResponse.json as jest.Mock).mockImplementation((body, opts) => ({
        body,
        opts,
      }));

      // Act
      const res = await POST(req as any);

      // Assert
      expect(res.body.error).toBe("Server error");
      expect(res.opts.status).toBe(500);
    });

    it("should handle question with no choices array gracefully", async () => {
      // This test aims to verify that a question with no choices array triggers a 400 error.
      const attemptId = "attemptNoChoices";
      const questionId = "qNoChoices";
      const chosenIndex = 0;

      const req = createMockRequest({
        attemptId,
        questionId,
        chosenIndex,
      });

      const mockAttemptRef = {};
      const mockQRef = {};

      const mockAttempt: MockDiagnosticAttempt = {
        id: attemptId,
        userId: "userNoChoices",
        startedAt: new MockTimestamp() as any,
        answers: [],
      };
      const mockQuestion: MockQuestionDoc = {
        id: questionId,
        question: "No choices?",
        difficulty: 1,
        // choices is undefined
        correctChoice: 0,
      };

      (mockAdminDbInstance.collection as jest.Mock).mockImplementation(
        (col: string) => {
          if (col === "diagnosticAttempts") {
            return { doc: jest.fn().mockReturnValue(mockAttemptRef) } as any;
          }
          if (col === "questions") {
            return { doc: jest.fn().mockReturnValue(mockQRef) } as any;
          }
        }
      );

      const mockTx = new MockTransaction();
      (mockTx.get as jest.Mock).mockImplementation((ref: any) => {
        if (ref === mockAttemptRef) {
          return Promise.resolve(new MockDocSnap(true, mockAttempt) as any);
        }
        if (ref === mockQRef) {
          return Promise.resolve(new MockDocSnap(true, mockQuestion) as any);
        }
      });

      (mockAdminDbInstance.runTransaction as jest.Mock).mockImplementation(
        async (fn: any) => {
          try {
            return await fn(mockTx as any);
          } catch (e) {
            throw e;
          }
        }
      );

      (NextResponse.json as jest.Mock).mockImplementation((body, opts) => ({
        body,
        opts,
      }));

      // Act
      const res = await POST(req as any);

      // Assert
      expect(res.body.error).toBe("chosenIndex out of range for that question");
      expect(res.opts.status).toBe(400);
    });
  });
});
