import { AdaptiveEngine } from '../adaptive/engine';
import { db } from '../utils/firebase';

// Mock Firebase
jest.mock('../utils/firebase', () => ({
  db: {
    collection: jest.fn(),
    Timestamp: {
      now: jest.fn(() => ({ seconds: Date.now() / 1000 })),
    },
  },
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000 })),
}));

describe('AdaptiveEngine', () => {
  let adaptiveEngine: AdaptiveEngine;
  
  beforeEach(() => {
    adaptiveEngine = new AdaptiveEngine();
    jest.clearAllMocks();
  });

  describe('generatePracticeQueue', () => {
    it('should generate a practice queue for a student', async () => {
      // Mock Firestore responses
      const mockStudentSkills = {
        skills: {
          math: { theta: 0.5, attempts: 10, lastSeen: new Date() },
          science: { theta: -0.2, attempts: 5, lastSeen: new Date() },
        },
        updatedAt: new Date(),
      };

      const mockQuestions = [
        { id: 'q1', skill: 'math', difficulty: 0.6 },
        { id: 'q2', skill: 'science', difficulty: 0.3 },
        { id: 'q3', skill: 'math', difficulty: 0.4 },
      ];

      // Mock collection methods
      const mockGet = jest.fn();
      const mockWhere = jest.fn().mockReturnThis();
      const mockOrderBy = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();

      mockGet
        .mockResolvedValueOnce({ // studentSkills
          exists: true,
          data: () => mockStudentSkills,
        })
        .mockResolvedValueOnce({ // recent incorrect responses
          docs: [],
        })
        .mockResolvedValueOnce({ // questions for math
          docs: [
            { id: 'q1', data: () => mockQuestions[0] },
            { id: 'q3', data: () => mockQuestions[2] },
          ],
        })
        .mockResolvedValueOnce({ // questions for science
          docs: [
            { id: 'q2', data: () => mockQuestions[1] },
          ],
        });

      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({ get: mockGet }),
        where: mockWhere,
        orderBy: mockOrderBy,
        limit: mockLimit,
        get: mockGet,
      });

      const queue = await adaptiveEngine.generatePracticeQueue('user123');

      expect(queue).toHaveLength(3);
      expect(queue).toContain('q1');
      expect(queue).toContain('q2');
      expect(queue).toContain('q3');
    });

    it('should handle empty student skills', async () => {
      const mockGet = jest.fn();
      mockGet
        .mockResolvedValueOnce({ exists: false }) // no student skills
        .mockResolvedValueOnce({ docs: [] }) // no recent incorrect
        .mockResolvedValueOnce({ docs: [] }); // no questions

      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({ get: mockGet }),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: mockGet,
      });

      const queue = await adaptiveEngine.generatePracticeQueue('user123');
      expect(queue).toEqual([]);
    });
  });

  describe('updateStudentSkills', () => {
    it('should update student skills based on correct response', async () => {
      const mockResponse = {
        id: 'resp1',
        userId: 'user123',
        questionId: 'q1',
        correct: true,
        score: 1,
        submittedAt: new Date(),
        durationMs: 30000,
        selected: 'A',
        hintsUsed: 0,
      };

      const mockQuestion = {
        skill: 'math',
        difficulty: 0.6,
      };

      const mockStudentSkills = {
        skills: {
          math: { theta: 0.0, attempts: 5, lastSeen: new Date() },
        },
        updatedAt: new Date(),
      };

      const mockGet = jest.fn();
      const mockSet = jest.fn();

      mockGet
        .mockResolvedValueOnce({ // student skills
          exists: true,
          data: () => mockStudentSkills,
        })
        .mockResolvedValueOnce({ // question
          data: () => mockQuestion,
        });

      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({ 
          get: mockGet,
          set: mockSet,
        }),
      });

      await adaptiveEngine.updateStudentSkills(mockResponse);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          skills: expect.objectContaining({
            math: expect.objectContaining({
              theta: expect.any(Number),
              attempts: 6,
            }),
          }),
        })
      );
    });
  });

  describe('calculateDiagnosticResults', () => {
    it('should calculate diagnostic results from responses', async () => {
      const mockResponses = [
        { id: 'r1', questionId: 'q1', correct: true },
        { id: 'r2', questionId: 'q2', correct: false },
        { id: 'r3', questionId: 'q3', correct: true },
      ];

      const mockQuestions = [
        { tags: ['listening'], skill: 'listening' },
        { tags: ['grasping'], skill: 'grasping' },
        { tags: ['listening'], skill: 'listening' },
      ];

      const mockGet = jest.fn();
      
      // Mock responses
      mockGet
        .mockResolvedValueOnce({ exists: true, data: () => mockResponses[0] })
        .mockResolvedValueOnce({ exists: true, data: () => mockResponses[1] })
        .mockResolvedValueOnce({ exists: true, data: () => mockResponses[2] });

      // Mock questions
      mockGet
        .mockResolvedValueOnce({ data: () => mockQuestions[0] })
        .mockResolvedValueOnce({ data: () => mockQuestions[1] })
        .mockResolvedValueOnce({ data: () => mockQuestions[2] });

      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({ get: mockGet }),
      });

      const results = await adaptiveEngine.calculateDiagnosticResults(
        'user123',
        ['r1', 'r2', 'r3']
      );

      expect(results).toHaveProperty('userId', 'user123');
      expect(results).toHaveProperty('fundamentals');
      expect(results).toHaveProperty('overallScore');
      expect(results.fundamentals).toHaveLength(4);
    });
  });
});