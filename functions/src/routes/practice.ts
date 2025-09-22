import { Router } from 'express';
import { db, serverTimestamp } from '@/utils/firebase';
import { authenticateUser, AuthenticatedRequest } from '@/middleware/auth';
import { PracticeGenerateSchema } from '@/utils/validation';
import { AdaptiveEngine } from '@/adaptive/engine';
import { PracticeQueue } from '@/types';

const router = Router();
const adaptiveEngine = new AdaptiveEngine();

/**
 * POST /practice/generate
 * Generate adaptive practice queue for authenticated user
 */
router.post('/generate', authenticateUser, async (req, res) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const validatedData = PracticeGenerateSchema.parse(req.body);
    const { skills, difficulty, count } = validatedData;

    // Generate adaptive queue
    const questionIds = await adaptiveEngine.generatePracticeQueue(
      user.uid,
      skills,
      difficulty
    );

    if (questionIds.length === 0) {
      res.status(404).json({ 
        error: 'No suitable questions found for practice',
        suggestions: [
          'Try adjusting difficulty level',
          'Complete more diagnostic questions first',
          'Check if questions exist for the selected skills'
        ]
      });
      return;
    }

    // Save practice queue
    const practiceQueue: PracticeQueue = {
      userId: user.uid,
      queue: questionIds.slice(0, count),
      generatedAt: serverTimestamp(),
      completedQuestions: [],
      currentIndex: 0,
    };

    await db.collection('practiceQueues').doc(user.uid).set(practiceQueue);

    res.json({
      success: true,
      queue: practiceQueue.queue,
      count: practiceQueue.queue.length,
      generatedAt: practiceQueue.generatedAt,
    });
  } catch (error) {
    console.error('Error generating practice queue:', error);
    res.status(500).json({ error: 'Failed to generate practice queue' });
  }
});

/**
 * GET /practice/queue
 * Get current practice queue for authenticated user
 */
router.get('/queue', authenticateUser, async (req, res) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    
    const queueDoc = await db.collection('practiceQueues').doc(user.uid).get();
    
    if (!queueDoc.exists) {
      res.status(404).json({ 
        error: 'No practice queue found',
        message: 'Generate a new practice queue to get started'
      });
      return;
    }

    const practiceQueue = queueDoc.data() as PracticeQueue;
    
    // Get question details for the queue
    const questionPromises = practiceQueue.queue.map(async (questionId) => {
      const questionDoc = await db.collection('questions').doc(questionId).get();
      return questionDoc.exists 
        ? { id: questionDoc.id, ...questionDoc.data() }
        : null;
    });

    const questions = (await Promise.all(questionPromises)).filter(Boolean);

    res.json({
      queue: practiceQueue.queue,
      questions,
      completedQuestions: practiceQueue.completedQuestions || [],
      currentIndex: practiceQueue.currentIndex || 0,
      generatedAt: practiceQueue.generatedAt,
      progress: {
        completed: (practiceQueue.completedQuestions || []).length,
        total: practiceQueue.queue.length,
        percentage: Math.round(
          ((practiceQueue.completedQuestions || []).length / practiceQueue.queue.length) * 100
        ),
      },
    });
  } catch (error) {
    console.error('Error fetching practice queue:', error);
    res.status(500).json({ error: 'Failed to fetch practice queue' });
  }
});

/**
 * POST /practice/next
 * Get next question in practice queue
 */
router.post('/next', authenticateUser, async (req, res) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    
    const queueDoc = await db.collection('practiceQueues').doc(user.uid).get();
    
    if (!queueDoc.exists) {
      res.status(404).json({ error: 'No practice queue found' });
      return;
    }

    const practiceQueue = queueDoc.data() as PracticeQueue;
    const currentIndex = practiceQueue.currentIndex || 0;
    
    if (currentIndex >= practiceQueue.queue.length) {
      res.json({
        completed: true,
        message: 'Practice queue completed!',
        progress: {
          completed: practiceQueue.queue.length,
          total: practiceQueue.queue.length,
          percentage: 100,
        },
      });
      return;
    }

    const nextQuestionId = practiceQueue.queue[currentIndex];
    const questionDoc = await db.collection('questions').doc(nextQuestionId).get();
    
    if (!questionDoc.exists) {
      res.status(404).json({ error: 'Question not found in queue' });
      return;
    }

    const question = { id: questionDoc.id, ...questionDoc.data() };

    res.json({
      question,
      progress: {
        current: currentIndex + 1,
        total: practiceQueue.queue.length,
        percentage: Math.round(((currentIndex + 1) / practiceQueue.queue.length) * 100),
      },
    });
  } catch (error) {
    console.error('Error getting next question:', error);
    res.status(500).json({ error: 'Failed to get next question' });
  }
});

/**
 * DELETE /practice/queue
 * Clear current practice queue
 */
router.delete('/queue', authenticateUser, async (req, res) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    
    await db.collection('practiceQueues').doc(user.uid).delete();
    
    res.json({ 
      success: true, 
      message: 'Practice queue cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing practice queue:', error);
    res.status(500).json({ error: 'Failed to clear practice queue' });
  }
});

export default router;