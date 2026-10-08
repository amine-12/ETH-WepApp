import { finishActivity, track } from '../services/analyticsService';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { progressService } from '../services/progressService';
import type { GameResult, Progress, Question } from '../types/course';

interface ProgressValue {
  progress: Progress;
  storageAvailable: boolean;
  saveAnswer: (question: Question, answer: string) => void;
  openModule: (id: string) => void;
  setSection: (id: string, index: number) => void;
  completeModule: (id: string) => void;
  saveGame: (id: string, result: Omit<GameResult, 'completedAt'>) => void;
  saveQuiz: (score: number, total: number) => void;
}
const Context = createContext<ProgressValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(progressService.load);
  const [storageAvailable, setStorageAvailable] = useState(progressService.isStorageAvailable);
  useEffect(() => {
    progressService.saveProgress(progress);
    setStorageAvailable(progressService.isStorageAvailable());
  }, [progress]);
  const update = useCallback((transform: (current: Progress) => Progress) => {
    setProgress(transform);
  }, []);
  const openModule = useCallback((id: string) => update(p => progressService.trackModuleOpen(p, id)), [update]);
  return <Context.Provider value={{ progress, storageAvailable, openModule,
    saveAnswer: (q, a) => update(p => progressService.saveAnswer(p, q, a)),
    setSection: (id, index) => update(p => ({ ...p, moduleProgress: { ...p.moduleProgress, [id]: index } })),
    completeModule: id => { track('module_completed', { moduleId: id }, true); update(p => progressService.completeModule(p, id)); },
    saveGame: (id, result) => { finishActivity(id, result.isSuccessful); update(p => progressService.trackGameResult(p, id, result)); },
    saveQuiz: (score, total) => update(p => ({ ...p, quizResult: { score, total, completedAt: new Date().toISOString() } })),
  }}>{children}</Context.Provider>;
}

export function useProgress() {
  const context = useContext(Context);
  if (!context) throw new Error('ProgressProvider manquant.');
  return context;
}
