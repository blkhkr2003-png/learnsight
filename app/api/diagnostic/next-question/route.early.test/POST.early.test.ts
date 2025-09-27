import { POST } from "../route";

// app/api/diagnostic/next-question/route.test.ts

// app/api/diagnostic/next-question/route.test.ts
// --- Manual Mocks ---

class MockadminDb {
  public collection = jest.fn().mocked(jest.fn());
}

interface MockQuestionDoc {
  id?: string;
  question: string;
  difficulty: number;
  choices?: string[];
  correctChoice?: number;
  fundamentals?: Partial<Record<string, number>>;
}

// --- AdaptiveLearningEngine and selectNextQuestion Mocks ---

jest.mock("@/utils/adaptive", () => {
  const actual = jest.requireActual("@/utils/adaptive");
  return {
    ...actual,
    selectNextQuestion: jest.fn().mocked(jest.fn()),
    AdaptiveLearningEngine: {
      calculateStartingDifficultyNumber: jest.fn().mocked(jest.fn()),
    },
  };
});

// --- adminDb Mock ---

jest.mock("@/lib/firebase-admin", () => {
  return {
    adminDb: new MockadminDb() as any,
  };
});

// --- NextResponse Mock ---

jest.mock("next/server", () => {
  const actual = jest.requireActual("next/server");
  return {
    ...actual,
    NextResponse: {
      json: jest.fn().mocked(jest.fn()),
    },
  };
});

// --- Helper to create mock Request ---

function createMockRequest(body: any) {
  return {
    json: jest.fn().mocked(jest.fn().mockResolvedValue(body)),
  } as any;
}

// --- Helper to create mock Firestore snapshot ---

function createMockFirestoreSnapshot(docs: MockQuestionDoc[]) {
  return {
    docs: docs.map((doc) => ({
      id: doc.id,
      data: jest
        .fn()
        .mocked(jest.fn().mockReturnValue({ ...doc, id: undefined })),
    })),
  };
}

// --- Test Suite ---

describe("POST() POST method", () => {
  let mockAdminDb: MockadminDb;
  let mockSelectNextQuestion: jest.Mock;
  let mockCalculateStartingDifficultyNumber: jest.Mock;
  let mockNextResponseJson: jest.Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    mockAdminDb = require("@/lib/firebase-admin").adminDb as any;
    mockSelectNextQuestion = require("@/utils/adaptive")
      .selectNextQuestion as any;
    mockCalculateStartingDifficultyNumber = require("@/utils/adaptive")
      .AdaptiveLearningEngine.calculateStartingDifficultyNumber as any;
    mockNextResponseJson = require("next/server").NextResponse.json as any;
  });

  // --- Happy Path Tests ---

  it("should return a question using micro-adaptive picker when lastDifficulty and answeredCorrectly are provided", async () => {
    // This test ensures the micro-adaptive path is used and returns a question
    const mockQuestions: MockQuestionDoc[] = [
      {
        id: "q1",
        question: "What is 2+2?",
        difficulty: 3,
        choices: ["3", "4", "5"],
        correctChoice: 1,
        fundamentals: { listening: 1 },
      },
      {
        id: "q2",
        question: "What is 3+3?",
        difficulty: 4,
        choices: ["5", "6", "7"],
        correctChoice: 1,
        fundamentals: { grasping: 2 },
      },
    ];

    mockAdminDb.collection.mockReturnValue({
      get: jest
        .fn()
        .mocked(
          jest
            .fn()
            .mockResolvedValue(
              createMockFirestoreSnapshot(mockQuestions) as any
            )
        ),
    });

    mockSelectNextQuestion.mockReturnValue(mockQuestions[1] as any);

    const req = createMockRequest({
      lastDifficulty: 3,
      answeredCorrectly: true,
      excludedIds: [],
    });

    mockNextResponseJson.mockReturnValue({
      question: {
        id: "q2",
        question: "What is 3+3?",
        difficulty: 4,
        choices: ["5", "6", "7"],
        fundamentals: { grasping: 2 },
      },
    });

    await POST(req as any);

    expect(mockAdminDb.collection).toHaveBeenCalledWith("questions");
    expect(mockSelectNextQuestion).toHaveBeenCalledWith(
      expect.any(Array),
      3,
      true,
      new Set([])
    );
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      {
        question: {
          id: "q2",
          question: "What is 3+3?",
          difficulty: 4,
          choices: ["5", "6", "7"],
          fundamentals: { grasping: 2 },
        },
      },
      { status: 200 }
    );
  });

  it("should pick initial question using studentScore and AdaptiveLearningEngine", async () => {
    // This test ensures the initial question path is used with studentScore
    const mockQuestions: MockQuestionDoc[] = [
      {
        id: "q1",
        question: "What is 2+2?",
        difficulty: 3,
        choices: ["3", "4", "5"],
        correctChoice: 1,
        fundamentals: { listening: 1 },
      },
      {
        id: "q2",
        question: "What is 3+3?",
        difficulty: 4,
        choices: ["5", "6", "7"],
        correctChoice: 1,
        fundamentals: { grasping: 2 },
      },
    ];

    mockAdminDb.collection.mockReturnValue({
      get: jest
        .fn()
        .mocked(
          jest
            .fn()
            .mockResolvedValue(
              createMockFirestoreSnapshot(mockQuestions) as any
            )
        ),
    });

    mockCalculateStartingDifficultyNumber.mockReturnValue(4);

    // pickInitialQuestion should pick q2 (difficulty 4)
    mockNextResponseJson.mockReturnValue({
      question: {
        id: "q2",
        question: "What is 3+3?",
        difficulty: 4,
        choices: ["5", "6", "7"],
        fundamentals: { grasping: 2 },
      },
    });

    const req = createMockRequest({
      studentScore: 80,
      excludedIds: [],
    });

    await POST(req as any);

    expect(mockCalculateStartingDifficultyNumber).toHaveBeenCalledWith(80);
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      {
        question: {
          id: "q2",
          question: "What is 3+3?",
          difficulty: 4,
          choices: ["5", "6", "7"],
          fundamentals: { grasping: 2 },
        },
      },
      { status: 200 }
    );
  });

  it("should pick initial question with default difficulty when studentScore is not provided", async () => {
    // This test ensures the initial question path is used with default difficulty
    const mockQuestions: MockQuestionDoc[] = [
      {
        id: "q1",
        question: "What is 2+2?",
        difficulty: 3,
        choices: ["3", "4", "5"],
        correctChoice: 1,
        fundamentals: { listening: 1 },
      },
      {
        id: "q2",
        question: "What is 3+3?",
        difficulty: 4,
        choices: ["5", "6", "7"],
        correctChoice: 1,
        fundamentals: { grasping: 2 },
      },
    ];

    mockAdminDb.collection.mockReturnValue({
      get: jest
        .fn()
        .mocked(
          jest
            .fn()
            .mockResolvedValue(
              createMockFirestoreSnapshot(mockQuestions) as any
            )
        ),
    });

    // pickInitialQuestion should pick q1 (difficulty 3)
    mockNextResponseJson.mockReturnValue({
      question: {
        id: "q1",
        question: "What is 2+2?",
        difficulty: 3,
        choices: ["3", "4", "5"],
        fundamentals: { listening: 1 },
      },
    });

    const req = createMockRequest({
      excludedIds: [],
    });

    await POST(req as any);

    expect(mockNextResponseJson).toHaveBeenCalledWith(
      {
        question: {
          id: "q1",
          question: "What is 2+2?",
          difficulty: 3,
          choices: ["3", "4", "5"],
          fundamentals: { listening: 1 },
        },
      },
      { status: 200 }
    );
  });

  it("should strip correctChoice from returned question", async () => {
    // This test ensures correctChoice is not present in the returned question
    const mockQuestions: MockQuestionDoc[] = [
      {
        id: "q1",
        question: "What is 2+2?",
        difficulty: 3,
        choices: ["3", "4", "5"],
        correctChoice: 1,
        fundamentals: { listening: 1 },
      },
    ];

    mockAdminDb.collection.mockReturnValue({
      get: jest
        .fn()
        .mocked(
          jest
            .fn()
            .mockResolvedValue(
              createMockFirestoreSnapshot(mockQuestions) as any
            )
        ),
    });

    mockSelectNextQuestion.mockReturnValue(mockQuestions[0] as any);

    mockNextResponseJson.mockReturnValue({
      question: {
        id: "q1",
        question: "What is 2+2?",
        difficulty: 3,
        choices: ["3", "4", "5"],
        fundamentals: { listening: 1 },
      },
    });

    const req = createMockRequest({
      lastDifficulty: 3,
      answeredCorrectly: true,
      excludedIds: [],
    });

    await POST(req as any);

    const responseArg = mockNextResponseJson.mock.calls[0][0];
    expect(responseArg.question.correctChoice).toBeUndefined();
  });

  // --- Edge Case Tests ---

  it("should return 404 if no questions are available in the database", async () => {
    // This test ensures a 404 is returned if the questions collection is empty
    mockAdminDb.collection.mockReturnValue({
      get: jest
        .fn()
        .mocked(
          jest.fn().mockResolvedValue(createMockFirestoreSnapshot([]) as any)
        ),
    });

    mockNextResponseJson.mockReturnValue({
      error: "No questions available in the database.",
    });

    const req = createMockRequest({});

    await POST(req as any);

    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { error: "No questions available in the database." },
      { status: 404 }
    );
  });

  it("should return 404 if no suitable question is found due to excludedIds", async () => {
    // This test ensures a 404 is returned if all questions are excluded
    const mockQuestions: MockQuestionDoc[] = [
      {
        id: "q1",
        question: "What is 2+2?",
        difficulty: 3,
        choices: ["3", "4", "5"],
        correctChoice: 1,
        fundamentals: { listening: 1 },
      },
    ];

    mockAdminDb.collection.mockReturnValue({
      get: jest
        .fn()
        .mocked(
          jest
            .fn()
            .mockResolvedValue(
              createMockFirestoreSnapshot(mockQuestions) as any
            )
        ),
    });

    mockSelectNextQuestion.mockReturnValue(null);

    mockNextResponseJson.mockReturnValue({
      error: "No suitable question found (check excludedIds / data).",
    });

    const req = createMockRequest({
      lastDifficulty: 3,
      answeredCorrectly: true,
      excludedIds: ["q1"],
    });

    await POST(req as any);

    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { error: "No suitable question found (check excludedIds / data)." },
      { status: 404 }
    );
  });

  it("should return 404 if pickInitialQuestion cannot find a suitable question", async () => {
    // This test ensures a 404 is returned if pickInitialQuestion cannot find a question
    const mockQuestions: MockQuestionDoc[] = [
      {
        id: "q1",
        question: "What is 2+2?",
        difficulty: 3,
        choices: ["3", "4", "5"],
        correctChoice: 1,
        fundamentals: { listening: 1 },
      },
    ];

    mockAdminDb.collection.mockReturnValue({
      get: jest
        .fn()
        .mocked(
          jest
            .fn()
            .mockResolvedValue(
              createMockFirestoreSnapshot(mockQuestions) as any
            )
        ),
    });

    mockCalculateStartingDifficultyNumber.mockReturnValue(5);

    // All questions are excluded
    mockNextResponseJson.mockReturnValue({
      error: "No suitable question found (check excludedIds / data).",
    });

    const req = createMockRequest({
      studentScore: 100,
      excludedIds: ["q1"],
    });

    await POST(req as any);

    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { error: "No suitable question found (check excludedIds / data)." },
      { status: 404 }
    );
  });

  it("should return 500 if an unexpected error occurs", async () => {
    // This test ensures a 500 is returned if an error is thrown
    mockAdminDb.collection.mockImplementation(() => {
      throw new Error("Unexpected DB error");
    });

    mockNextResponseJson.mockReturnValue({ error: "Unexpected DB error" });

    const req = createMockRequest({});

    await POST(req as any);

    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { error: "Unexpected DB error" },
      { status: 500 }
    );
  });

  it("should handle questions with missing optional fields gracefully", async () => {
    // This test ensures that missing optional fields do not break the response
    const mockQuestions: MockQuestionDoc[] = [
      {
        id: "q1",
        question: "What is 2+2?",
        difficulty: 3,
      },
    ];

    mockAdminDb.collection.mockReturnValue({
      get: jest
        .fn()
        .mocked(
          jest
            .fn()
            .mockResolvedValue(
              createMockFirestoreSnapshot(mockQuestions) as any
            )
        ),
    });

    mockSelectNextQuestion.mockReturnValue(mockQuestions[0] as any);

    mockNextResponseJson.mockReturnValue({
      question: { id: "q1", question: "What is 2+2?", difficulty: 3 },
    });

    const req = createMockRequest({
      lastDifficulty: 3,
      answeredCorrectly: true,
      excludedIds: [],
    });

    await POST(req as any);

    expect(mockNextResponseJson).toHaveBeenCalledWith(
      {
        question: {
          id: "q1",
          question: "What is 2+2?",
          difficulty: 3,
        },
      },
      { status: 200 }
    );
  });
});
