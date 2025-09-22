import { Router } from 'express';
import { db, serverTimestamp } from '@/utils/firebase';
import { authenticateUser, AuthenticatedRequest } from '@/middleware/auth';
import { ResponseSchema } from '@/utils/validation';
import { AdaptiveEngine } from '@/adaptive/engine';
import { Response, Question, PracticeQueue } from '@/types';

const router = Router();
const adaptiveEngine = new AdaptiveEngine();

/**
 * POST /responses
 * Submit a response to a question
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const validatedData = ResponseSchema.parse(req.body);
    const { questionId, selected, durationMs, hintsUsed } = validatedData;

    // Get question to check correct answer
    const questionDoc = await db.collection('questions').doc(questionId).get();
    
    if (!questionDoc.exists) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    const question = questionDoc.data() as Question;
    const isCorrect = selected === question.answer;
    
    // Calculate score (can be enhanced with partial credit logic)
    let score = isCorrect ? 1 : 0;
    
    // Reduce score for hints used
    if (hintsUsed > 0) {
      score = Math.max(0, score - (hintsUsed * 0.1));
    }

    // Create response record
    const responseData: Omit<Response, 'id'> = {
      userId: user.uid,
      questionId,
      submittedAt: serverTimestamp(),
      durationMs,
      selected,
      correct: isCorrect,
      hintsUsed,
      score,
      skill: question.skill,
    };

    const responseRef = await db.collection('responses').add(responseData);
    const response: Response = { id: responseRef.id, ...responseData };

    // Update student skills using adaptive engine
    await adaptiveEngine.updateStudentSkills(response);

    // Update practice queue if this was part of practice
    await updatePracticeQueue(user.uid, questionId);

    res.status(201).json({
      success: true,
      response: {
        id: responseRef.id,
        correct: isCorrect,
        score,
        explanation: isCorrect 
          ? 'Correct! Well done.' 
          : `Incorrect. The correct answer is ${question.answer}.`,
      },
      feedback: {
        correct: isCorrect,
        correctAnswer: question.answer,
        userAnswer: selected,
        timeSpent: durationMs,
        hintsUsed,
      },
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

/**
 * GET /responses
 * Get user's response history
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const { limit = 50, skill, correct } = req.query;

    let query = db.collection('responses')
      .where('userId', '==', user.uid)
      .orderBy('submittedAt', 'desc')
      .limit(Number(limit));

    if (skill) {
      query = query.where('skill', '==', skill);
    }

    if (correct !== undefined) {
      query = query.where('correct', '==', correct === 'true');
    }

    const querySnapshot = await query.get();
    
    const responses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Response[];

    // Get question details for each response
    const responsesWithQuestions = await Promise.all(
      responses.map(async (response) => {
        const questionDoc = await db.collection('questions').doc(response.questionId).get();
        const question = questionDoc.exists ? questionDoc.data() : null;
        
        return {
          ...response,
          question: question ? { id: response.questionId, ...question } : null,
        };
      })
    );

    // Calculate statistics
    const stats = {
      total: responses.length,
      correct: responses.filter(r => r.correct).length,
      incorrect: responses.filter(r => !r.correct).length,
      averageScore: responses.length > 0 
        ? responses.reduce((sum, r) => sum + r.score, 0) / responses.length 
        : 0,
      averageTime: responses.length > 0
        ? responses.reduce((sum, r) => sum + r.durationMs, 0) / responses.length
        : 0,
    };

    res.json({
      responses: responsesWithQuestions,
      stats,
      filters: { limit, skill, correct },
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

/**
 * GET /responses/analytics
 * Get detailed analytics for user responses
 */
router.get('/analytics', authenticateUser, async (req, res) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const responsesQuery = await db.collection('responses')
      .where('userId', '==', user.uid)
      .where('submittedAt', '>=', startDate)
      .orderBy('submittedAt', 'desc')
      .get();

    const responses = responsesQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Response[];

    // Group by skill
    const skillStats: Record<string, any> = {};
    
    for (const response of responses) {
      const skill = response.skill || 'general';
      
      if (!skillStats[skill]) {
        skillStats[skill] = {
          total: 0,
          correct: 0,
          totalTime: 0,
          scores: [],
        };
      }
      
      skillStats[skill].total++;
      if (response.correct) skillStats[skill].correct++;
      skillStats[skill].totalTime += response.durationMs;
      skillStats[skill].scores.push(response.score);
    }

    // Calculate skill analytics
    const skillAnalytics = Object.entries(skillStats).map(([skill, stats]) => ({
      skill,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      averageScore: stats.scores.length > 0 
        ? stats.scores.reduce((a: number, b: number) => a + b, 0) / stats.scores.length 
        : 0,
      averageTime: stats.total > 0 ? stats.totalTime / stats.total : 0,
      totalAttempts: stats.total,
      improvement: 0, // Could calculate trend over time
    }));

    // Daily progress
    const dailyProgress: Record<string, any> = {};
    
    for (const response of responses) {
      const date = response.submittedAt.toDate().toISOString().split('T')[0];
      
      if (!dailyProgress[date]) {
        dailyProgress[date] = { total: 0, correct: 0, score: 0 };
      }
      
      dailyProgress[date].total++;
      if (response.correct) dailyProgress[date].correct++;
      dailyProgress[date].score += response.score;
    }

    const dailyStats = Object.entries(dailyProgress).map(([date, stats]) => ({
      date,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      averageScore: stats.total > 0 ? stats.score / stats.total : 0,
      totalQuestions: stats.total,
    }));

    res.json({
      period: `${days} days`,
      overall: {
        totalResponses: responses.length,
        overallAccuracy: responses.length > 0 
          ? (responses.filter(r => r.correct).length / responses.length) * 100 
          : 0,
        averageScore: responses.length > 0
          ? responses.reduce((sum, r) => sum + r.score, 0) / responses.length
          : 0,
        totalTimeSpent: responses.reduce((sum, r) => sum + r.durationMs, 0),
      },
      skillAnalytics,
      dailyProgress: dailyStats.sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

/**
 * Helper function to update practice queue progress
 */
async function updatePracticeQueue(userId: string, questionId: string): Promise<void> {
  try {
    const queueRef = db.collection('practiceQueues').doc(userId);
    const queueDoc = await queueRef.get();
    
    if (!queueDoc.exists) return;
    
    const practiceQueue = queueDoc.data() as PracticeQueue;
    const currentIndex = practiceQueue.currentIndex || 0;
    const completedQuestions = practiceQueue.completedQuestions || [];
    
    // Check if this question is the current one in the queue
    if (practiceQueue.queue[currentIndex] === questionId) {
      await queueRef.update({
        currentIndex: currentIndex + 1,
        completedQuestions: [...completedQuestions, questionId],
      });
    }
  } catch (error) {
    console.error('Error updating practice queue:', error);
    // Don't throw - this is a non-critical update
  }
}

export default router;