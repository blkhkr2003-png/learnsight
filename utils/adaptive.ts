export interface LearningFundamental {
  name: "Listening" | "Grasping" | "Retention" | "Application";
  score: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  weakAreas: string[];
  recommendations: string[];
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  role: "student";
  fundamentals: LearningFundamental[];
  overallScore: number;
  practiceStreak: number;
  totalPracticeTime: number;
  lastActive: Date;
}

export interface DiagnosticQuestion {
  id: string;
  fundamental: LearningFundamental["name"];
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  timeLimit: number;
}

export interface PracticeSession {
  id: string;
  studentId: string;
  fundamental: LearningFundamental["name"];
  questions: DiagnosticQuestion[];
  startTime: Date;
  endTime?: Date;
  score?: number;
  completed: boolean;
}

// Adaptive learning algorithm
export class AdaptiveLearningEngine {
  static calculateDifficulty(
    studentScore: number,
    fundamental: LearningFundamental["name"]
  ): "easy" | "medium" | "hard" {
    if (studentScore < 40) return "easy";
    if (studentScore < 70) return "medium";
    return "hard";
  }

  static generatePracticeQuestions(
    profile: StudentProfile,
    fundamental: LearningFundamental["name"],
    count = 5
  ): DiagnosticQuestion[] {
    const fundamentalData = profile.fundamentals.find(
      (f) => f.name === fundamental
    );
    const difficulty = this.calculateDifficulty(
      fundamentalData?.score || 0,
      fundamental
    );

    // Mock question generation - in production, this would use OpenAI API
    return Array.from({ length: count }, (_, i) => ({
      id: `q_${fundamental.toLowerCase()}_${i + 1}`,
      fundamental,
      difficulty,
      question: `${fundamental} practice question ${
        i + 1
      } (${difficulty} level)`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: `This tests your ${fundamental.toLowerCase()} skills at ${difficulty} level.`,
      timeLimit: difficulty === "easy" ? 30 : difficulty === "medium" ? 45 : 60,
    }));
  }

  static updateStudentProfile(
    profile: StudentProfile,
    sessionResults: PracticeSession
  ): StudentProfile {
    const updatedFundamentals = profile.fundamentals.map((fundamental) => {
      if (fundamental.name === sessionResults.fundamental) {
        const newScore = Math.round(
          (fundamental.score + (sessionResults.score || 0)) / 2
        );
        return {
          ...fundamental,
          score: newScore,
          level:
            newScore < 40
              ? "Beginner"
              : newScore < 70
              ? "Intermediate"
              : "Advanced",
        };
      }
      return fundamental;
    });

    return {
      ...profile,
      fundamentals: updatedFundamentals,
      overallScore: Math.round(
        updatedFundamentals.reduce((sum, f) => sum + f.score, 0) /
          updatedFundamentals.length
      ),
      practiceStreak: profile.practiceStreak + 1,
      lastActive: new Date(),
    };
  }
}

// Demo data generators
export const generateDemoStudent = (
  name: string,
  email: string
): StudentProfile => ({
  id: `student_${name.toLowerCase()}`,
  name,
  email,
  role: "student",
  fundamentals: [
    {
      name: "Listening",
      score: Math.floor(Math.random() * 40) + 60,
      level: "Intermediate",
      weakAreas: ["Audio comprehension", "Note-taking"],
      recommendations: [
        "Practice with audio materials",
        "Use active listening techniques",
      ],
    },
    {
      name: "Grasping",
      score: Math.floor(Math.random() * 30) + 50,
      level: "Intermediate",
      weakAreas: ["Complex concepts", "Abstract thinking"],
      recommendations: ["Break down complex problems", "Use visual aids"],
    },
    {
      name: "Retention",
      score: Math.floor(Math.random() * 35) + 45,
      level: "Beginner",
      weakAreas: ["Long-term memory", "Information recall"],
      recommendations: ["Use spaced repetition", "Create memory associations"],
    },
    {
      name: "Application",
      score: Math.floor(Math.random() * 25) + 65,
      level: "Advanced",
      weakAreas: ["Real-world scenarios"],
      recommendations: [
        "Practice with case studies",
        "Apply concepts to projects",
      ],
    },
  ],
  overallScore: 0,
  practiceStreak: Math.floor(Math.random() * 15) + 1,
  totalPracticeTime: Math.floor(Math.random() * 500) + 100,
  lastActive: new Date(),
});

// Calculate overall score after generation
export const finalizeStudentProfile = (
  profile: StudentProfile
): StudentProfile => ({
  ...profile,
  overallScore: Math.round(
    profile.fundamentals.reduce((sum, f) => sum + f.score, 0) /
      profile.fundamentals.length
  ),
});
