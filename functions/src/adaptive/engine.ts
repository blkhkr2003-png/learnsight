import { db, serverTimestamp } from '@/utils/firebase';
import { Question, StudentSkills, Response, AdaptiveConfig } from '@/types';

export class AdaptiveEngine {
  private config: AdaptiveConfig = {
    targetDifficulty: 0.5,
    difficultyRange: 0.3,
    queueSize: 10,
    includeRecentIncorrect: true,
  };

  constructor(config?: Partial<AdaptiveConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Generate adaptive practice queue for a student
   */
  async generatePracticeQueue(
    userId: string,
    skills?: string[],
    customDifficulty?: number
  ): Promise<string[]> {
    try {
      // Get student's current skill levels
      const studentSkills = await this.getStudentSkills(userId);
      
      // Get recent incorrect responses for review
      const recentIncorrect = this.config.includeRecentIncorrect
        ? await this.getRecentIncorrectQuestions(userId)
        : [];

      // Determine target skills
      const targetSkills = skills || this.identifyWeakSkills(studentSkills);
      
      // Generate question queue
      const questionIds: string[] = [];
      
      // Add recent incorrect questions (up to 30% of queue)
      const incorrectCount = Math.min(
        recentIncorrect.length,
        Math.floor(this.config.queueSize * 0.3)
      );
      questionIds.push(...recentIncorrect.slice(0, incorrectCount));

      // Fill remaining slots with adaptive questions
      const remainingSlots = this.config.queueSize - questionIds.length;
      const adaptiveQuestions = await this.selectAdaptiveQuestions(
        userId,
        targetSkills,
        remainingSlots,
        customDifficulty,
        questionIds // exclude already selected
      );
      
      questionIds.push(...adaptiveQuestions);

      // Shuffle for variety
      return this.shuffleArray(questionIds);
    } catch (error) {
      console.error('Error generating practice queue:', error);
      throw new Error('Failed to generate practice queue');
    }
  }

  /**
   * Update student skills based on response
   */
  async updateStudentSkills(response: Response): Promise<void> {
    try {
      const skillsRef = db.collection('studentSkills').doc(response.userId);
      const skillsDoc = await skillsRef.get();
      
      let studentSkills: StudentSkills = skillsDoc.exists
        ? skillsDoc.data() as StudentSkills
        : { skills: {}, updatedAt: serverTimestamp() };

      // Get question to determine skill
      const questionDoc = await db.collection('questions').doc(response.questionId).get();
      const question = questionDoc.data() as Question;
      const skill = question.skill || 'general';

      // Initialize skill if not exists
      if (!studentSkills.skills[skill]) {
        studentSkills.skills[skill] = {
          theta: 0.0, // Start at average ability
          attempts: 0,
          lastSeen: serverTimestamp(),
          correctCount: 0,
          incorrectCount: 0,
        };
      }

      // Update skill using simple Bayesian update
      const currentSkill = studentSkills.skills[skill];
      const isCorrect = response.correct;
      const questionDifficulty = question.difficulty;

      // Simple IRT-inspired update
      const learningRate = 0.1;
      const difficultyAdjustment = isCorrect 
        ? (questionDifficulty - currentSkill.theta) * learningRate
        : -(1 - questionDifficulty - currentSkill.theta) * learningRate;

      studentSkills.skills[skill] = {
        ...currentSkill,
        theta: Math.max(-3, Math.min(3, currentSkill.theta + difficultyAdjustment)),
        attempts: currentSkill.attempts + 1,
        lastSeen: serverTimestamp(),
        correctCount: (currentSkill.correctCount || 0) + (isCorrect ? 1 : 0),
        incorrectCount: (currentSkill.incorrectCount || 0) + (isCorrect ? 0 : 1),
      };

      studentSkills.updatedAt = serverTimestamp();

      await skillsRef.set(studentSkills);
    } catch (error) {
      console.error('Error updating student skills:', error);
      throw new Error('Failed to update student skills');
    }
  }

  /**
   * Calculate diagnostic results from responses
   */
  async calculateDiagnosticResults(userId: string, responseIds: string[]) {
    try {
      const responses: Response[] = [];
      
      // Fetch all responses
      for (const responseId of responseIds) {
        const responseDoc = await db.collection('responses').doc(responseId).get();
        if (responseDoc.exists) {
          responses.push({ id: responseId, ...responseDoc.data() } as Response);
        }
      }

      // Group by fundamental skills
      const fundamentalScores = {
        Listening: [],
        Grasping: [],
        Retention: [],
        Application: [],
      };

      for (const response of responses) {
        const questionDoc = await db.collection('questions').doc(response.questionId).get();
        const question = questionDoc.data() as Question;
        
        // Map question tags to fundamentals
        const fundamental = this.mapTagToFundamental(question.tags);
        if (fundamental && fundamentalScores[fundamental]) {
          fundamentalScores[fundamental].push(response.correct ? 1 : 0);
        }
      }

      // Calculate scores and levels
      const fundamentals = Object.entries(fundamentalScores).map(([name, scores]) => {
        const score = scores.length > 0 
          ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100)
          : 50;
        
        return {
          name: name as any,
          score,
          level: score >= 80 ? 'Advanced' : score >= 60 ? 'Intermediate' : 'Beginner',
          weakAreas: this.identifyWeakAreas(name, score),
          recommendations: this.generateRecommendations(name, score),
        };
      });

      const overallScore = Math.round(
        fundamentals.reduce((sum, f) => sum + f.score, 0) / fundamentals.length
      );

      return {
        userId,
        fundamentals,
        overallScore,
        completedAt: serverTimestamp(),
        responses: responseIds,
      };
    } catch (error) {
      console.error('Error calculating diagnostic results:', error);
      throw new Error('Failed to calculate diagnostic results');
    }
  }

  private async getStudentSkills(userId: string): Promise<StudentSkills> {
    const skillsDoc = await db.collection('studentSkills').doc(userId).get();
    return skillsDoc.exists 
      ? skillsDoc.data() as StudentSkills
      : { skills: {}, updatedAt: serverTimestamp() };
  }

  private async getRecentIncorrectQuestions(userId: string): Promise<string[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const responsesQuery = await db.collection('responses')
      .where('userId', '==', userId)
      .where('correct', '==', false)
      .where('submittedAt', '>=', oneWeekAgo)
      .orderBy('submittedAt', 'desc')
      .limit(5)
      .get();

    return responsesQuery.docs.map(doc => doc.data().questionId);
  }

  private identifyWeakSkills(studentSkills: StudentSkills): string[] {
    const skills = Object.entries(studentSkills.skills)
      .filter(([_, skill]) => skill.attempts > 2) // Only consider skills with enough data
      .sort(([_, a], [__, b]) => a.theta - b.theta) // Sort by ability (lowest first)
      .slice(0, 3) // Take top 3 weakest
      .map(([skillName]) => skillName);

    return skills.length > 0 ? skills : ['general'];
  }

  private async selectAdaptiveQuestions(
    userId: string,
    skills: string[],
    count: number,
    customDifficulty?: number,
    excludeIds: string[] = []
  ): Promise<string[]> {
    const studentSkills = await this.getStudentSkills(userId);
    const questionIds: string[] = [];

    for (const skill of skills) {
      const skillData = studentSkills.skills[skill];
      const targetDifficulty = customDifficulty ?? 
        (skillData ? this.thetaToDifficulty(skillData.theta) : this.config.targetDifficulty);

      const questionsQuery = await db.collection('questions')
        .where('skill', '==', skill)
        .where('difficulty', '>=', targetDifficulty - this.config.difficultyRange)
        .where('difficulty', '<=', targetDifficulty + this.config.difficultyRange)
        .limit(Math.ceil(count / skills.length))
        .get();

      const availableQuestions = questionsQuery.docs
        .map(doc => doc.id)
        .filter(id => !excludeIds.includes(id));

      questionIds.push(...availableQuestions);

      if (questionIds.length >= count) break;
    }

    return questionIds.slice(0, count);
  }

  private thetaToDifficulty(theta: number): number {
    // Convert IRT theta (-3 to 3) to difficulty (0 to 1)
    return Math.max(0, Math.min(1, (theta + 3) / 6));
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private mapTagToFundamental(tags: string[]): keyof typeof this.fundamentalMapping | null {
    for (const tag of tags) {
      if (this.fundamentalMapping[tag]) {
        return this.fundamentalMapping[tag];
      }
    }
    return null;
  }

  private fundamentalMapping: Record<string, 'Listening' | 'Grasping' | 'Retention' | 'Application'> = {
    'listening': 'Listening',
    'audio': 'Listening',
    'comprehension': 'Grasping',
    'reading': 'Grasping',
    'memory': 'Retention',
    'recall': 'Retention',
    'application': 'Application',
    'problem-solving': 'Application',
  };

  private identifyWeakAreas(fundamental: string, score: number): string[] {
    const weakAreas: Record<string, string[]> = {
      'Listening': ['Audio comprehension', 'Note-taking', 'Following instructions'],
      'Grasping': ['Reading comprehension', 'Concept understanding', 'Abstract thinking'],
      'Retention': ['Memory recall', 'Information retention', 'Pattern recognition'],
      'Application': ['Problem solving', 'Critical thinking', 'Real-world application'],
    };

    return score < 70 ? weakAreas[fundamental] || [] : [];
  }

  private generateRecommendations(fundamental: string, score: number): string[] {
    const recommendations: Record<string, string[]> = {
      'Listening': [
        'Practice with audio materials daily',
        'Use active listening techniques',
        'Take notes while listening',
      ],
      'Grasping': [
        'Break down complex concepts',
        'Use visual aids and diagrams',
        'Practice summarizing main ideas',
      ],
      'Retention': [
        'Use spaced repetition techniques',
        'Create memory associations',
        'Practice regular review sessions',
      ],
      'Application': [
        'Work on real-world problems',
        'Practice case studies',
        'Apply concepts to projects',
      ],
    };

    return score < 80 ? recommendations[fundamental] || [] : [];
  }
}