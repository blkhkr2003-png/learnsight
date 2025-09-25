import { adminDb } from "@/lib/firebase-admin";

// lib/db-admin.getQuestionsByIds.test.ts
jest.mock("@/lib/firebase-admin", () => ({
  adminDb: {
    collection: jest.fn(),
  },
}));

// Helper to create a mock QueryDocumentSnapshot
function createMockDoc(id: string, data: object) {
  return {
    id,
    exists: true,
    data: () => data,
  };
}

describe("getQuestionsByIds() getQuestionsByIds method", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Happy Path Tests
  it("should fetch questions for valid IDs and return their data", async () => {
    // Test: Ensure that given valid IDs, the function returns the correct question docs.
    const ids = ["q1", "q2"];
    const mockDocs = [
      createMockDoc("q1", { text: "Question 1", difficulty: 3 }),
      createMockDoc("q2", { text: "Question 2", difficulty: 2 }),
    ];

    // Mock Firestore chain
    (adminDb.collection as jest.Mock).mockImplementation(() => ({
      doc: (id: string) => ({
        get: jest.fn().mockResolvedValue(mockDocs.find((doc) => doc.id === id)),
      }),
    }));

    const result = await getQuestionsByIds(ids);

    expect(result).toEqual([
      { id: "q1", text: "Question 1", difficulty: 3 },
      { id: "q2", text: "Question 2", difficulty: 2 },
    ]);
  });

  it("should return only existing questions when some IDs do not exist", async () => {
    // Test: Ensure that if some IDs do not exist, only existing questions are returned.
    const ids = ["q1", "q2", "q3"];
    const mockDocs = [
      createMockDoc("q1", { text: "Question 1", difficulty: 3 }),
      { id: "q2", exists: false, data: () => undefined },
      createMockDoc("q3", { text: "Question 3", difficulty: 1 }),
    ];

    (adminDb.collection as jest.Mock).mockImplementation(() => ({
      doc: (id: string) => ({
        get: jest.fn().mockResolvedValue(mockDocs.find((doc) => doc.id === id)),
      }),
    }));

    const result = await getQuestionsByIds(ids);

    expect(result).toEqual([
      { id: "q1", text: "Question 1", difficulty: 3 },
      { id: "q3", text: "Question 3", difficulty: 1 },
    ]);
  });

  it("should return an empty array when no IDs are provided", async () => {
    // Test: Ensure that an empty input array returns an empty result.
    const ids: string[] = [];

    // No calls should be made to Firestore
    const collectionMock = (adminDb.collection as jest.Mock).mockImplementation(
      () => ({
        doc: jest.fn().mockReturnValue({
          get: jest.fn(),
        }),
      })
    );

    const result = await getQuestionsByIds(ids);

    expect(result).toEqual([]);
    expect(collectionMock).not.toHaveBeenCalled();
  });

  // Edge Case Tests
  it("should handle IDs with duplicate values and return unique questions", async () => {
    // Test: Ensure that duplicate IDs in the input are handled (Firestore will be called for each, but output should be correct).
    const ids = ["q1", "q1", "q2"];
    const mockDocs = [
      createMockDoc("q1", { text: "Question 1", difficulty: 3 }),
      createMockDoc("q2", { text: "Question 2", difficulty: 2 }),
    ];

    (adminDb.collection as jest.Mock).mockImplementation(() => ({
      doc: (id: string) => ({
        get: jest.fn().mockResolvedValue(mockDocs.find((doc) => doc.id === id)),
      }),
    }));

    const result = await getQuestionsByIds(ids);

    // Output will contain duplicates if input has duplicates, as per implementation
    expect(result).toEqual([
      { id: "q1", text: "Question 1", difficulty: 3 },
      { id: "q1", text: "Question 1", difficulty: 3 },
      { id: "q2", text: "Question 2", difficulty: 2 },
    ]);
  });

  it("should handle all IDs not existing and return an empty array", async () => {
    // Test: Ensure that if none of the IDs exist, an empty array is returned.
    const ids = ["q1", "q2"];
    const mockDocs = [
      { id: "q1", exists: false, data: () => undefined },
      { id: "q2", exists: false, data: () => undefined },
    ];

    (adminDb.collection as jest.Mock).mockImplementation(() => ({
      doc: (id: string) => ({
        get: jest.fn().mockResolvedValue(mockDocs.find((doc) => doc.id === id)),
      }),
    }));

    const result = await getQuestionsByIds(ids);

    expect(result).toEqual([]);
  });

  it("should handle Firestore get() promise rejection gracefully", async () => {
    // Test: Ensure that if Firestore get() rejects, the function throws.
    const ids = ["q1", "q2"];

    (adminDb.collection as jest.Mock).mockImplementation(() => ({
      doc: (id: string) => ({
        get: jest.fn().mockImplementation(() => {
          if (id === "q1") {
            return Promise.reject(new Error("Firestore error"));
          }
          return Promise.resolve(
            createMockDoc("q2", { text: "Question 2", difficulty: 2 })
          );
        }),
      }),
    }));

    await expect(getQuestionsByIds(ids)).rejects.toThrow("Firestore error");
  });

  it("should handle a large number of IDs efficiently", async () => {
    // Test: Ensure that the function can handle a large array of IDs.
    const ids = Array.from({ length: 50 }, (_, i) => `q${i + 1}`);
    const mockDocs = ids.map((id, idx) =>
      createMockDoc(id, {
        text: `Question ${idx + 1}`,
        difficulty: (idx % 5) + 1,
      })
    );

    (adminDb.collection as jest.Mock).mockImplementation(() => ({
      doc: (id: string) => ({
        get: jest.fn().mockResolvedValue(mockDocs.find((doc) => doc.id === id)),
      }),
    }));

    const result = await getQuestionsByIds(ids);

    expect(result).toHaveLength(50);
    expect(result[0]).toEqual({ id: "q1", text: "Question 1", difficulty: 1 });
    expect(result[49]).toEqual({
      id: "q50",
      text: "Question 50",
      difficulty: 5,
    });
  });
});
