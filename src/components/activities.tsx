import { startActivity } from '../services/analyticsService';
import { useState } from 'react';
import { CheckCircle2, Lightbulb, RotateCcw } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { calculateEcoResult, ecoSteps, privacyItems } from '../data/games';
import { ProgressBar } from './common';
import type { ModuleSection } from '../types/course';

export function InteractiveDiagram({ steps }: { steps: NonNullable<ModuleSection['diagram']> }) {
  const [active, setActive] = useState(0);
  return <div className="diagram"><div className="diagram-steps" aria-label="Étapes du processus">{steps.map((step, i) => <button key={step.label} className={i === active ? 'active' : ''} onClick={() => setActive(i)} aria-pressed={i === active}><span>{String(i + 1).padStart(2, '0')}</span>{step.label}</button>)}</div><p className="diagram-explanation" aria-live="polite"><strong>{steps[active].label}</strong> — {steps[active].explanation}</p></div>;
}

const promptParts = [
  { label: 'Objectif', text: 'Explique le fonctionnement de l’inférence en IA.' },
  { label: 'Contexte', text: 'Je prépare un exposé pour un cours universitaire.' },
  { label: 'Niveau', text: 'Adresse-toi à un public débutant.' },
  { label: 'Format', text: 'Présente trois idées et un exemple concret.' },
  { label: 'Contraintes', text: 'Évite le jargon et signale les limites de l’explication.' },
];
export function PromptBuilder() {
  const [chosen, setChosen] = useState<number[]>([]);
  const { saveGame } = useProgress();
  function toggle(i: number) { startActivity('prompt');
    const next = chosen.includes(i) ? chosen.filter(n => n !== i) : [...chosen, i];
    setChosen(next);
    if (next.length === promptParts.length) saveGame('prompt', { isSuccessful: true });
  }
  return <div className="activity"><div className="prompt-before"><span className="eyebrow">DEMANDE INITIALE</span><p>« Explique-moi ça. »</p></div><div className="prompt-controls">{promptParts.map((part, i) => <label key={part.label}><input type="checkbox" checked={chosen.includes(i)} onChange={() => toggle(i)} />{part.label}</label>)}</div><div className="prompt-output" aria-live="polite"><span className="eyebrow">VOTRE DEMANDE AMÉLIORÉE</span><p>{chosen.length ? promptParts.filter((_, i) => chosen.includes(i)).map(p => p.text).join(' ') : 'Ajoutez un premier élément pour préciser votre demande.'}</p></div>{chosen.length === 5 && <p className="inline-success"><CheckCircle2 size={18} /> Votre demande est mieux cadrée. La réponse devra encore être vérifiée.</p>}</div>;
}

const hallucinationPhrases = [
  'Une hallucination peut prendre la forme d’une référence inventée, avec un titre et une date précis.',
  'En 2024, l’UNESCO a lancé un système appelé « Global AI Truth Index » permettant de noter la fiabilité des contenus générés par IA de 0 à 100.',
  'Un deepfake peut donner l’impression qu’une personne a dit quelque chose qu’elle n’a jamais dit.',
  'Des données de recrutement historiques peuvent reproduire des préférences passées.',
];
export function HallucinationGame() {
  const { progress, saveGame } = useProgress();
  const [choice, setChoice] = useState<number | null>(progress.games.hallucination?.isSuccessful ? 1 : null);
  const [hint, setHint] = useState(false);
  function choose(i: number) { startActivity('hallucination'); setChoice(i); if (i === 1) saveGame('hallucination', { isSuccessful: true }); }
  return <div className="activity"><div className="game-heading"><span className="eyebrow">ENQUÊTE · 1 AFFIRMATION INVENTÉE</span><button className="text-button" onClick={() => setHint(true)}><Lightbulb size={16} /> Afficher un indice</button></div>{hint && <p className="hint" role="status">Cherchez dans la partie sur la désinformation : une organisation connue et un nom précis peuvent créer une illusion de crédibilité.</p>}<div className="phrase-list">{hallucinationPhrases.map((phrase, i) => <button disabled={choice === 1} key={phrase} className={choice === i ? i === 1 ? 'found' : 'wrong' : ''} onClick={() => choose(i)}><span>{String(i + 1).padStart(2, '0')}</span>{phrase}</button>)}</div>{choice !== null && <div className={`feedback ${choice === 1 ? 'success' : 'review'}`} role="status"><strong>{choice === 1 ? 'Hallucination démasquée' : 'Cherchez encore'}</strong><p>{choice === 1 ? 'Le « Global AI Truth Index » est une invention volontaire de cet exercice. Une organisation connue, une date précise et un nom crédible ne garantissent pas qu’une information soit vraie. Vérifiez la source originale.' : 'Cette information n’est pas l’hallucination recherchée. Regardez les détails qui semblent particulièrement précis.'}</p></div>}</div>;
}

export function EcoAiGame() {
  const [choices, setChoices] = useState<number[]>([]);
  const { saveGame } = useProgress();
  const performance = choices.reduce((s, c, i) => s + ecoSteps[i].options[c].performance, 0);
  const budget = 100 - choices.reduce((s, c, i) => s + ecoSteps[i].options[c].cost, 0);
  const done = choices.length === 3;
  function choose(c: number) { startActivity('eco');
    const next = [...choices, c]; setChoices(next);
    if (next.length === 3) saveGame('eco', calculateEcoResult(next));
  }
  return <div className="activity eco-game"><div className="gauges"><div><div className="gauge-label"><span>Performance</span><strong>{performance} %</strong></div><ProgressBar value={performance} label="Performance du système" /><small>Objectif : au moins 70 %</small></div><div><div className="gauge-label"><span>Budget écologique</span><strong>{budget} %</strong></div><ProgressBar value={budget} label="Budget écologique restant" /><small>Objectif : plus de 0 %</small></div></div>
    {!done ? <><span className="eyebrow">DÉCISION {choices.length + 1} / 3</span><h3>{ecoSteps[choices.length].title}</h3><div className="eco-options">{ecoSteps[choices.length].options.map((o, i) => <button key={o.label} onClick={() => choose(i)}><strong>{o.label}</strong><span>Performance +{o.performance} %</span><span>Budget −{o.cost} %</span><p>{o.explanation}</p></button>)}</div></> : <div className={`feedback ${budget > 0 && performance >= 70 ? 'success' : 'review'}`} role="status"><strong>{budget <= 0 ? 'Dépassement des limites de ressources' : performance < 70 ? 'Performance insuffisante' : 'Mission accomplie'}</strong><p>{budget <= 0 ? 'Le système atteint une performance élevée, mais épuise ses ressources. La puissance seule ne suffit pas à rendre un projet responsable.' : performance < 70 ? 'Le budget est préservé, mais le système ne remplit pas son rôle. Une solution inutilisable gaspille elle aussi des ressources.' : 'Votre système remplit son rôle tout en conservant des ressources. La sobriété numérique associe efficacité et proportionnalité.'}</p><p>Vos choix : {choices.map((c, i) => ecoSteps[i].options[c].label).join(' · ')}</p><button className="button secondary" onClick={() => setChoices([])}><RotateCcw size={16} /> Rejouer</button></div>}
  </div>;
}

export function PrivacyGame() {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const { saveGame } = useProgress();
  const item = privacyItems[index];
  if (!item) return <div className="activity feedback success" role="status"><strong>Classement terminé : {score} / {privacyItems.length}</strong><p>Les données sensibles sont à éviter. Même un contenu public doit être utilisé dans le respect des droits et du contexte.</p><button className="button secondary" onClick={() => { setIndex(0); setScore(0); setAnswer(null); }}>Recommencer</button></div>;
  function choose(safe: boolean) { startActivity('privacy'); setAnswer(safe); if (safe === item.safe) setScore(s => s + 1); }
  function next() {
    if (index === privacyItems.length - 1) saveGame('privacy', { isSuccessful: score === privacyItems.length, correctCount: score, total: privacyItems.length });
    setIndex(i => i + 1); setAnswer(null);
  }
  return <div className="activity"><span className="eyebrow">INFORMATION {index + 1} / {privacyItems.length}</span><h3>{item.label}</h3><div className="button-row"><button className="button secondary" disabled={answer !== null} onClick={() => choose(false)}>À éviter</button><button className="button secondary" disabled={answer !== null} onClick={() => choose(true)}>Généralement acceptable</button></div>{answer !== null && <div className={`feedback ${answer === item.safe ? 'success' : 'review'}`} role="status"><strong>{answer === item.safe ? 'Bonne décision' : 'À reconsidérer'}</strong><p>{item.explanation}</p><button className="button primary" onClick={next}>{index === privacyItems.length - 1 ? 'Voir le bilan' : 'Information suivante'}</button></div>}</div>;
}
