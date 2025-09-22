import { Router } from 'express';
import { db } from '@/utils/firebase';
import { authenticateUser, requireAdmin } from '@/middleware/auth';
import { QuestionSchema, QueryQuestionsSchema } from '@/utils/validation';
import { Question } from '@/types';

const router = Router();

/**
 * GET /questions/:id
 * Fetch a specific question by ID
 */
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    const questionDoc = await db.collection('questions').doc(id).get();
    
    if (!questionDoc.exists) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    const question = { id: questionDoc.id, ...questionDoc.data() } as Question;
    
    res.json({ question });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

/**
 * GET /questions
 * Query questions with filters
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const queryParams = QueryQuestionsSchema.parse(req.query);
    const { tags, difficulty, difficultyRange, limit, skill, subject } = queryParams;

    let query = db.collection('questions').limit(limit);

    // Apply filters
    if (skill) {
      query = query.where('skill', '==', skill);
    }

    if (subject) {
      query = query.where('subject', '==', subject);
    }

    if (tags && tags.length > 0) {
      query = query.where('tags', 'array-contains-any', tags);
    }

    if (difficulty !== undefined) {
      const minDifficulty = Math.max(0, difficulty - difficultyRange);
      const maxDifficulty = Math.min(1, difficulty + difficultyRange);
      
      query = query
        .where('difficulty', '>=', minDifficulty)
        .where('difficulty', '<=', maxDifficulty);
    }

    const querySnapshot = await query.get();
    
    const questions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Question[];

    res.json({
      questions,
      count: questions.length,
      filters: queryParams,
    });
  } catch (error) {
    console.error('Error querying questions:', error);
    res.status(500).json({ error: 'Failed to query questions' });
  }
});

/**
 * POST /questions
 * Create a new question (Admin only)
 */
router.post('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const validatedData = QuestionSchema.parse(req.body);
    
    const questionData = {
      ...validatedData,
      createdAt: db.Timestamp.now(),
    };

    const docRef = await db.collection('questions').add(questionData);
    
    res.status(201).json({
      success: true,
      questionId: docRef.id,
      question: { id: docRef.id, ...questionData },
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

/**
 * PUT /questions/:id
 * Update a question (Admin only)
 */
router.put('/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = QuestionSchema.parse(req.body);
    
    const questionRef = db.collection('questions').doc(id);
    const questionDoc = await questionRef.get();
    
    if (!questionDoc.exists) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    await questionRef.update({
      ...validatedData,
      updatedAt: db.Timestamp.now(),
    });

    res.json({ success: true, message: 'Question updated successfully' });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

/**
 * DELETE /questions/:id
 * Delete a question (Admin only)
 */
router.delete('/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const questionRef = db.collection('questions').doc(id);
    const questionDoc = await questionRef.get();
    
    if (!questionDoc.exists) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    await questionRef.delete();
    
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

export default router;