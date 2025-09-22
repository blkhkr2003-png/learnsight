import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';
import questionRoutes from '../routes/questions';

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

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    createUser: jest.fn(),
    setCustomUserClaims: jest.fn(),
    verifyIdToken: jest.fn(),
  })),
}));

describe('API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
    app.use('/questions', questionRoutes);
  });

  describe('POST /auth/signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'student',
        profile: { grade: '10' },
      };

      // Mock successful user creation
      const { getAuth } = require('firebase-admin/auth');
      getAuth().createUser.mockResolvedValue({ uid: 'test-uid' });
      getAuth().setCustomUserClaims.mockResolvedValue(undefined);

      const { db } = require('../utils/firebase');
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          set: jest.fn().mockResolvedValue(undefined),
        }),
      });

      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('uid', 'test-uid');
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        displayName: '',
        role: 'invalid-role',
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /questions', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/questions')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return questions for authenticated user', async () => {
      // Mock authentication middleware
      const mockAuthMiddleware = (req: any, res: any, next: any) => {
        req.user = { uid: 'test-uid', role: 'student' };
        next();
      };

      const authenticatedApp = express();
      authenticatedApp.use(express.json());
      authenticatedApp.use('/questions', mockAuthMiddleware, questionRoutes);

      const { db } = require('../utils/firebase');
      db.collection.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          docs: [
            {
              id: 'q1',
              data: () => ({
                stem: 'Test question',
                type: 'mcq',
                difficulty: 0.5,
              }),
            },
          ],
        }),
      });

      const response = await request(authenticatedApp)
        .get('/questions')
        .expect(200);

      expect(response.body).toHaveProperty('questions');
      expect(response.body.questions).toHaveLength(1);
    });
  });
});