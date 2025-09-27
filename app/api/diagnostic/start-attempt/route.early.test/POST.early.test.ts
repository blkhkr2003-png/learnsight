import { createDiagnosticAttempt } from "@/lib/db-admin";
import { POST } from "../route";

// app/api/diagnostic/start-attempt/route.test.ts

// app/api/diagnostic/start-attempt/route.test.ts
// --- Manual Mocks ---

// Mock for admin.firestore.Timestamp
class MockTimestamp {
  static now = jest.fn().mockReturnValue("mock-timestamp" as any);
}

// Mock for admin
class MockFirestore {
  public Timestamp = MockTimestamp as any;
}
class Mockadmin {
  public firestore = new MockFirestore() as any;
}
jest.mock("@/lib/firebase-admin", () => {
  return {
    __esModule: true,
    default: new Mockadmin() as any,
  };
});

// Mock for createDiagnosticAttempt
jest.mock("@/lib/db-admin", () => {
  const actual = jest.requireActual("@/lib/db-admin");
  return {
    ...actual,
    createDiagnosticAttempt: jest.fn(),
  };
});
// --- Test Suite ---

describe("POST() POST method", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Timestamp.now mock
    (MockTimestamp.now as jest.Mock).mockReturnValue("mock-timestamp" as any);
  });

  // --- Happy Path Tests ---

  it("should create a diagnostic attempt and return 200 with attemptId and attempt (happy path, minimal valid input)", async () => {
    // This test ensures that a valid request with userId and questionIds returns a 200 and correct response

    // Arrange
    const mockUserId = "user-123";
    const mockQuestionIds = ["q1", "q2"];
    const mockAttemptId = "attempt-abc";

    // Mock request
    const mockJson = jest.fn().mockResolvedValue({
      userId: mockUserId,
      questionIds: mockQuestionIds,
    });
    const mockRequest = { json: mockJson } as any as Request;

    // Mock createDiagnosticAttempt to resolve with mockAttemptId
    jest
      .mocked(createDiagnosticAttempt)
      .mockResolvedValue(mockAttemptId as any);

    // Act
    const response = await POST(mockRequest);

    // Assert
    expect(mockJson).toHaveBeenCalled();
    expect(MockTimestamp.now).toHaveBeenCalled();

    // Check that createDiagnosticAttempt was called with the correct attempt object
    expect(jest.mocked(createDiagnosticAttempt)).toHaveBeenCalledWith({
      userId: mockUserId,
      startedAt: "mock-timestamp",
      completedAt: undefined,
      answers: [
        { questionId: "q1", chosenIndex: -1, correct: false },
        { questionId: "q2", chosenIndex: -1, correct: false },
      ],
    } as any);

    // Check response
    const json = await (response as any).json();
    expect((response as any).status).toBe(200);
    expect(json).toEqual({
      attemptId: mockAttemptId,
      attempt: {
        userId: mockUserId,
        startedAt: "mock-timestamp",
        completedAt: undefined,
        answers: [
          { questionId: "q1", chosenIndex: -1, correct: false },
          { questionId: "q2", chosenIndex: -1, correct: false },
        ],
        id: mockAttemptId,
      },
    });
  });

  it("should handle a valid request with a single questionId", async () => {
    // This test ensures that a single questionId is handled correctly

    // Arrange
    const mockUserId = "user-456";
    const mockQuestionIds = ["qX"];
    const mockAttemptId = "attempt-xyz";

    const mockJson = jest.fn().mockResolvedValue({
      userId: mockUserId,
      questionIds: mockQuestionIds,
    });
    const mockRequest = { json: mockJson } as any as Request;

    jest
      .mocked(createDiagnosticAttempt)
      .mockResolvedValue(mockAttemptId as any);

    // Act
    const response = await POST(mockRequest);

    // Assert
    expect(jest.mocked(createDiagnosticAttempt)).toHaveBeenCalledWith({
      userId: mockUserId,
      startedAt: "mock-timestamp",
      completedAt: undefined,
      answers: [{ questionId: "qX", chosenIndex: -1, correct: false }],
    } as any);

    const json = await (response as any).json();
    expect((response as any).status).toBe(200);
    expect(json.attemptId).toBe(mockAttemptId);
    expect(json.attempt.answers.length).toBe(1);
    expect(json.attempt.answers[0]).toEqual({
      questionId: "qX",
      chosenIndex: -1,
      correct: false,
    });
  });

  // --- Edge Case Tests ---

  it("should return 400 if userId is missing", async () => {
    // This test ensures that missing userId results in a 400 error

    // Arrange
    const mockJson = jest.fn().mockResolvedValue({
      questionIds: ["q1", "q2"],
    });
    const mockRequest = { json: mockJson } as any as Request;

    // Act
    const response = await POST(mockRequest);

    // Assert
    const json = await (response as any).json();
    expect((response as any).status).toBe(400);
    expect(json).toEqual({ error: "userId and questionIds are required" });
    expect(jest.mocked(createDiagnosticAttempt)).not.toHaveBeenCalled();
  });

  it("should return 400 if questionIds is missing", async () => {
    // This test ensures that missing questionIds results in a 400 error

    // Arrange
    const mockJson = jest.fn().mockResolvedValue({
      userId: "user-789",
    });
    const mockRequest = { json: mockJson } as any as Request;

    // Act
    const response = await POST(mockRequest);

    // Assert
    const json = await (response as any).json();
    expect((response as any).status).toBe(400);
    expect(json).toEqual({ error: "userId and questionIds are required" });
    expect(jest.mocked(createDiagnosticAttempt)).not.toHaveBeenCalled();
  });

  it("should return 400 if questionIds is not an array", async () => {
    // This test ensures that a non-array questionIds results in a 400 error

    // Arrange
    const mockJson = jest.fn().mockResolvedValue({
      userId: "user-101",
      questionIds: "not-an-array",
    });
    const mockRequest = { json: mockJson } as any as Request;

    // Act
    const response = await POST(mockRequest);

    // Assert
    const json = await (response as any).json();
    expect((response as any).status).toBe(400);
    expect(json).toEqual({ error: "userId and questionIds are required" });
    expect(jest.mocked(createDiagnosticAttempt)).not.toHaveBeenCalled();
  });

  it("should return 400 if questionIds is an empty array", async () => {
    // This test ensures that an empty questionIds array results in a 400 error

    // Arrange
    const mockJson = jest.fn().mockResolvedValue({
      userId: "user-202",
      questionIds: [],
    });
    const mockRequest = { json: mockJson } as any as Request;

    // Act
    const response = await POST(mockRequest);

    // Assert
    const json = await (response as any).json();
    expect((response as any).status).toBe(400);
    expect(json).toEqual({ error: "userId and questionIds are required" });
    expect(jest.mocked(createDiagnosticAttempt)).not.toHaveBeenCalled();
  });

  it("should return 500 if createDiagnosticAttempt throws an error", async () => {
    // This test ensures that an error thrown by createDiagnosticAttempt results in a 500 error

    // Arrange
    const mockUserId = "user-err";
    const mockQuestionIds = ["q1", "q2"];
    const mockJson = jest.fn().mockResolvedValue({
      userId: mockUserId,
      questionIds: mockQuestionIds,
    });
    const mockRequest = { json: mockJson } as any as Request;

    jest
      .mocked(createDiagnosticAttempt)
      .mockRejectedValue(new Error("DB error") as never);

    // Act
    const response = await POST(mockRequest);

    // Assert
    const json = await (response as any).json();
    expect((response as any).status).toBe(500);
    expect(json).toEqual({ error: "Server error" });
  });

  it("should return 500 if req.json() throws an error", async () => {
    // This test ensures that an error thrown by req.json() results in a 500 error

    // Arrange
    const mockJson = jest
      .fn()
      .mockRejectedValue(new Error("Bad JSON") as never);
    const mockRequest = { json: mockJson } as any as Request;

    // Act
    const response = await POST(mockRequest);

    // Assert
    const json = await (response as any).json();
    expect((response as any).status).toBe(500);
    expect(json).toEqual({ error: "Server error" });
    expect(jest.mocked(createDiagnosticAttempt)).not.toHaveBeenCalled();
  });

  it("should handle questionIds with non-string values (edge case)", async () => {
    // This test ensures that questionIds with non-string values are still processed (since the code does not validate type of elements)

    // Arrange
    const mockUserId = "user-303";
    const mockQuestionIds = [123, "q2", false];
    const mockAttemptId = "attempt-nonstring";

    const mockJson = jest.fn().mockResolvedValue({
      userId: mockUserId,
      questionIds: mockQuestionIds,
    });
    const mockRequest = { json: mockJson } as any as Request;

    jest
      .mocked(createDiagnosticAttempt)
      .mockResolvedValue(mockAttemptId as any);

    // Act
    const response = await POST(mockRequest);

    // Assert
    expect(jest.mocked(createDiagnosticAttempt)).toHaveBeenCalledWith({
      userId: mockUserId,
      startedAt: "mock-timestamp",
      completedAt: undefined,
      answers: [
        { questionId: 123, chosenIndex: -1, correct: false },
        { questionId: "q2", chosenIndex: -1, correct: false },
        { questionId: false, chosenIndex: -1, correct: false },
      ],
    } as any);

    const json = await (response as any).json();
    expect((response as any).status).toBe(200);
    expect(json.attempt.answers.length).toBe(3);
    expect(json.attempt.answers[0].questionId).toBe(123);
    expect(json.attempt.answers[2].questionId).toBe(false);
  });
});
