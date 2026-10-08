import { track } from '../services/analyticsService';
import { useState } from 'react';
import { CheckCircle2, CircleHelp } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import type { Question } from '../types/course';

export function QuestionCard({ question, onAnswered, restore = true }: { question: Question; onAnswered?: (correct: boolean) => void; restore?: boolean }) {
  const { progress, saveAnswer } = useProgress();
  const saved = restore ? progress.answers[question.id] : undefined;
  const [selected, setSelected] = useState(saved?.selectedAnswer ?? '');
  const [submitted, setSubmitted] = useState(!!saved);
  const correct = selected === question.correctAnswer;
  function submit() {
    if (!selected || submitted) return;
    saveAnswer(question, selected);
    track('question_answered', { entityId: question.id, moduleId: question.moduleId, context: restore ? 'course' : 'quiz', correct });
    setSubmitted(true);
    onAnswered?.(correct);
  }
  return <section className="question-card" aria-label="Question interactive">
    <div className="eyebrow"><CircleHelp size={16} /> À VOUS DE JOUER</div>
    <h3>{question.question}</h3>
    <fieldset disabled={submitted}><legend className="sr-only">Choisissez une réponse</legend>
      {question.options.map(option => <label key={option.id} className={`answer-option ${selected === option.id ? 'selected' : ''} ${submitted && option.id === question.correctAnswer ? 'correct' : ''}`}>
        <input type="radio" name={question.id} value={option.id} checked={selected === option.id} onChange={() => setSelected(option.id)} />
        <span className="option-letter">{option.id}</span><span>{option.label}</span>
      </label>)}
    </fieldset>
    {!submitted ? <button className="button primary" disabled={!selected} onClick={submit}>Valider ma réponse</button> : <div className={`feedback ${correct ? 'success' : 'review'}`} role="status">
      <strong><CheckCircle2 size={19} /> {correct ? 'Bonne réponse' : 'Pas tout à fait.'}</strong><p>{question.explanation}</p>
      {restore && <button className="text-button" onClick={() => { setSubmitted(false); setSelected(''); }}>Réessayer</button>}
    </div>}
  </section>;
}
