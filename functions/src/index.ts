import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';

// Import routes
import authRoutes from '@/routes/auth';
import questionRoutes from '@/routes/questions';
import practiceRoutes from '@/routes/practice';
import responseRoutes from '@/routes/responses';
import llmRoutes from '@/routes/llm';

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/questions', questionRoutes);
app.use('/practice', practiceRoutes);
app.use('/responses', responseRoutes);
app.use('/llm', llmRoutes);

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  
  if (error.name === 'ZodError') {
    res.status(400).json({
      error: 'Validation error',
      details: error.errors,
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Export the Express app as a Firebase Cloud Function
export const api = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB',
  })
  .https
  .onRequest(app);

// Additional Cloud Functions can be exported here
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  console.log('New user created:', user.uid);
  // Additional user creation logic can be added here
});

export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  console.log('User deleted:', user.uid);
  
  // Clean up user data
  const { db } = await import('@/utils/firebase');
  
  const batch = db.batch();
  
  // Delete user document
  batch.delete(db.collection('users').doc(user.uid));
  
  // Delete student skills
  batch.delete(db.collection('studentSkills').doc(user.uid));
  
  // Delete practice queue
  batch.delete(db.collection('practiceQueues').doc(user.uid));
  
  await batch.commit();
});