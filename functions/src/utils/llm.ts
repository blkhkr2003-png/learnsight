import OpenAI from 'openai';
import { db, serverTimestamp } from '@/utils/firebase';
import { LLMCache, Question } from '@/types';

export class LLMService {
  private openai: OpenAI | null = null;
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.OPENAI_ENABLED === 'true';
    
    if (this.enabled && process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async generateExplanation(
    questionId: string,
    userAnswer?: string,
    includeHint: boolean = false
  ): Promise<string> {
    if (!this.enabled || !this.openai) {
      return 'LLM service is not enabled. Please enable it in the configuration.';
    }

    try {
      // Create cache key
      const cacheKey = this.createCacheKey(questionId, userAnswer, includeHint);
      
      // Check cache first
      const cached = await this.getCachedResponse(cacheKey);
      if (cached) {
        return cached.response;
      }

      // Get question data
      const questionDoc = await db.collection('questions').doc(questionId).get();
      if (!questionDoc.exists) {
        throw new Error('Question not found');
      }

      const question = questionDoc.data() as Question;
      
      // Generate explanation
      const explanation = await this.callOpenAI(question, userAnswer, includeHint);
      
      // Cache the response
      await this.cacheResponse(cacheKey, explanation);
      
      return explanation;
    } catch (error) {
      console.error('Error generating explanation:', error);
      return 'Sorry, I could not generate an explanation at this time. Please try again later.';
    }
  }

  private async callOpenAI(
    question: Question,
    userAnswer?: string,
    includeHint: boolean = false
  ): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const prompt = this.buildPrompt(question, userAnswer, includeHint);

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful educational assistant. Provide clear, concise explanations that help students learn. Keep explanations under 200 words.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'No explanation generated.';
  }

  private buildPrompt(
    question: Question,
    userAnswer?: string,
    includeHint: boolean
  ): string {
    let prompt = `Question: ${question.stem}\n`;

    if (question.choices && question.choices.length > 0) {
      prompt += 'Options:\n';
      question.choices.forEach(choice => {
        prompt += `${choice.id}. ${choice.text}\n`;
      });
    }

    prompt += `\nCorrect Answer: ${question.answer}\n`;

    if (userAnswer) {
      prompt += `Student's Answer: ${userAnswer}\n`;
      
      if (userAnswer === question.answer) {
        prompt += '\nThe student got this correct! Please provide a brief explanation of why this answer is right and perhaps mention key concepts.';
      } else {
        prompt += '\nThe student got this wrong. Please explain why their answer is incorrect and why the correct answer is right.';
      }
    } else {
      prompt += '\nPlease provide a clear explanation of the correct answer and the reasoning behind it.';
    }

    if (includeHint) {
      prompt += ' Also include a helpful hint for approaching similar problems.';
    }

    return prompt;
  }

  private createCacheKey(
    questionId: string,
    userAnswer?: string,
    includeHint: boolean = false
  ): string {
    const parts = [questionId];
    if (userAnswer) parts.push(`ans:${userAnswer}`);
    if (includeHint) parts.push('hint:true');
    
    return parts.join('|');
  }

  private async getCachedResponse(cacheKey: string): Promise<LLMCache | null> {
    try {
      const cacheDoc = await db.collection('llm_cache').doc(cacheKey).get();
      
      if (!cacheDoc.exists) {
        return null;
      }

      const cached = cacheDoc.data() as LLMCache;
      const now = Date.now() / 1000;
      const createdAt = cached.createdAt.seconds;
      
      // Check if cache is still valid
      if (now - createdAt > cached.ttlSeconds) {
        // Cache expired, delete it
        await db.collection('llm_cache').doc(cacheKey).delete();
        return null;
      }

      return cached;
    } catch (error) {
      console.error('Error checking cache:', error);
      return null;
    }
  }

  private async cacheResponse(cacheKey: string, response: string): Promise<void> {
    try {
      const cacheData: LLMCache = {
        response,
        createdAt: serverTimestamp(),
        ttlSeconds: 30 * 24 * 60 * 60, // 30 days
      };

      await db.collection('llm_cache').doc(cacheKey).set(cacheData);
    } catch (error) {
      console.error('Error caching response:', error);
      // Don't throw - caching failure shouldn't break the main flow
    }
  }
}

export const llmService = new LLMService();