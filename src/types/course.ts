export type QuestionType = 'multiple-choice' | 'true-false' | 'scenario';
export interface Question {
  id: string;
  moduleId: string;
  type: QuestionType;
  question: string;
  options: { id: string; label: string }[];
  correctAnswer: string;
  explanation: string;
}
export interface ModuleSection {
  id: string;
  title: string;
  paragraphs: string[];
  concept?: { title: string; text: string };
  example?: { title: string; text: string };
  cases?: { title: string; text: string }[];
  points?: string[];
  diagram?: { label: string; explanation: string }[];
  activity?: 'prompt' | 'hallucination' | 'privacy' | 'eco';
  questionIds?: string[];
  sources?: { label: string; url: string }[];
}
export interface LearningModule {
  id: string;
  number: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  icon: 'brain' | 'message' | 'search' | 'leaf' | 'shield' | 'scale';
  sections: ModuleSection[];
  takeaways: string[];
}
export interface SavedAnswer {
  selectedAnswer: string;
  isCorrect: boolean;
  answeredAt: string;
  attempts: number;
}
export interface GameResult {
  isSuccessful: boolean;
  completedAt: string;
  performance?: number;
  ecologicalBudget?: number;
  correctCount?: number;
  total?: number;
}
export interface Progress {
  version: 1;
  completedModules: string[];
  moduleProgress: Record<string, number>;
  answers: Record<string, SavedAnswer>;
  games: Record<string, GameResult>;
  lastModule: string;
  quizResult: { score: number; total: number; completedAt: string } | null;
}
