import type { GameResult, Progress, Question } from '../types/course';

export const STORAGE_KEY = 'eth610.progress.v1';
export const emptyProgress = (): Progress => ({ version: 1, completedModules: [], moduleProgress: {}, answers: {}, games: {}, lastModule: '', quizResult: null });
let storageAvailable = true;

export function parseProgress(raw: string | null): Progress {
  if (!raw) return emptyProgress();
  try {
    const value = JSON.parse(raw);
    if (value.version !== 1 || !Array.isArray(value.completedModules) || !value.moduleProgress || !value.answers || !value.games) return emptyProgress();
    const progress = emptyProgress();
    progress.completedModules = value.completedModules.filter((id: unknown) => typeof id === 'string');
    progress.lastModule = typeof value.lastModule === 'string' ? value.lastModule : '';
    for (const [id, index] of Object.entries(value.moduleProgress)) {
      if (typeof index === 'number' && Number.isSafeInteger(index) && index >= 0) progress.moduleProgress[id] = index;
    }
    for (const [id, answer] of Object.entries(value.answers)) {
      const a = answer as Progress['answers'][string];
      if (a && typeof a.selectedAnswer === 'string' && typeof a.isCorrect === 'boolean' && typeof a.answeredAt === 'string' && Number.isSafeInteger(a.attempts) && a.attempts > 0) progress.answers[id] = a;
    }
    for (const [id, result] of Object.entries(value.games)) {
      const r = result as GameResult;
      if (r && typeof r.isSuccessful === 'boolean' && typeof r.completedAt === 'string') progress.games[id] = r;
    }
    const quiz = value.quizResult;
    if (quiz && Number.isSafeInteger(quiz.score) && Number.isSafeInteger(quiz.total) && quiz.score >= 0 && quiz.total > 0 && quiz.score <= quiz.total && typeof quiz.completedAt === 'string') progress.quizResult = quiz;
    return progress;
  } catch { return emptyProgress(); }
}

export const progressService = {
  load(): Progress {
    try { return parseProgress(localStorage.getItem(STORAGE_KEY)); }
    catch { storageAvailable = false; return emptyProgress(); }
  },
  saveProgress(progress: Progress): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); storageAvailable = true; }
    catch { storageAvailable = false; }
  },
  isStorageAvailable: () => storageAvailable,
  saveAnswer(progress: Progress, question: Question, selectedAnswer: string): Progress {
    if (!question.options.some(o => o.id === selectedAnswer)) throw new Error('Choix invalide.');
    return { ...progress, answers: { ...progress.answers, [question.id]: {
      selectedAnswer, isCorrect: selectedAnswer === question.correctAnswer, answeredAt: new Date().toISOString(), attempts: (progress.answers[question.id]?.attempts ?? 0) + 1,
    } } };
  },
  trackModuleOpen(progress: Progress, moduleId: string): Progress {
    return { ...progress, lastModule: moduleId, moduleProgress: { ...progress.moduleProgress, [moduleId]: progress.moduleProgress[moduleId] ?? 0 } };
  },
  completeModule(progress: Progress, moduleId: string): Progress {
    return { ...progress, completedModules: [...new Set([...progress.completedModules, moduleId])] };
  },
  trackGameResult(progress: Progress, gameId: string, result: Omit<GameResult, 'completedAt'>): Progress {
    return { ...progress, games: { ...progress.games, [gameId]: { ...result, completedAt: new Date().toISOString() } } };
  },
};
