import { Router } from 'express';
import { authenticateUser } from '@/middleware/auth';
import { LLMExplainSchema } from '@/utils/validation';
import { llmService } from '@/utils/llm';

const router = Router();

/**
 * POST /llm/explain
 * Generate explanation for a question using LLM
 */
router.post('/explain', authenticateUser, async (req, res) => {
  try {
    const validatedData = LLMExplainSchema.parse(req.body);
    const { questionId, userAnswer, includeHint } = validatedData;

    const explanation = await llmService.generateExplanation(
      questionId,
      userAnswer,
      includeHint
    );

    res.json({
      success: true,
      explanation,
      questionId,
      includeHint,
    });
  } catch (error) {
    console.error('Error generating explanation:', error);
    res.status(500).json({ 
      error: 'Failed to generate explanation',
      fallback: 'Please review the question and try to understand the concept. If you need help, consider asking your teacher or reviewing related materials.',
    });
  }
});

/**
 * POST /llm/hint
 * Generate a hint for a question
 */
router.post('/hint', authenticateUser, async (req, res) => {
  try {
    const { questionId } = req.body;

    if (!questionId) {
      res.status(400).json({ error: 'Question ID is required' });
      return;
    }

    const hint = await llmService.generateExplanation(
      questionId,
      undefined,
      true // includeHint = true
    );

    res.json({
      success: true,
      hint,
      questionId,
    });
  } catch (error) {
    console.error('Error generating hint:', error);
    res.status(500).json({ 
      error: 'Failed to generate hint',
      fallback: 'Try breaking down the problem into smaller parts and think about what concepts might apply.',
    });
  }
});

/**
 * GET /llm/status
 * Check LLM service status
 */
router.get('/status', authenticateUser, async (req, res) => {
  try {
    const enabled = process.env.OPENAI_ENABLED === 'true';
    const hasApiKey = !!process.env.OPENAI_API_KEY;

    res.json({
      enabled,
      configured: enabled && hasApiKey,
      model: 'gpt-3.5-turbo',
      features: {
        explanations: enabled && hasApiKey,
        hints: enabled && hasApiKey,
        caching: true,
      },
    });
  } catch (error) {
    console.error('Error checking LLM status:', error);
    res.status(500).json({ error: 'Failed to check LLM status' });
  }
});

export default router;