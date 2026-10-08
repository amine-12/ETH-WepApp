import { BrainCircuit, MessageSquareText, ScanSearch, Leaf, ShieldCheck, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import type { LearningModule } from '../types/course';

export const moduleIcons = { brain: BrainCircuit, message: MessageSquareText, search: ScanSearch, leaf: Leaf, shield: ShieldCheck, scale: Scale };

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return <div className="progress-track" role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} /></div>;
}

export function ModuleCard({ module }: { module: LearningModule }) {
  const { progress } = useProgress();
  const done = progress.completedModules.includes(module.id);
  const started = Object.hasOwn(progress.moduleProgress, module.id);
  const value = done ? 100 : Math.round(((progress.moduleProgress[module.id] ?? 0) / (module.sections.length + 1)) * 100);
  const Icon = moduleIcons[module.icon];
  return <Link to={`/modules/${module.id}`} className={`module-card theme-${module.icon}`}>
    <div className="card-top"><span className="icon-tile"><Icon size={25} strokeWidth={1.7} /></span><span className="module-number">MODULE {String(module.number).padStart(2, '0')}</span></div>
    <h3>{module.title}</h3><p>{module.description}</p>
    <div className="card-meta"><span>{module.estimatedMinutes} min · Interactif</span><span>{done ? 'Terminé' : started ? 'En cours' : 'À commencer'}</span></div>
    <ProgressBar value={value} label={`Progression : ${module.title}`} />
    <div className="card-bottom"><span>{done ? 'Revoir le module' : started ? 'Continuer' : 'Commencer'}</span><span>{value} %</span></div>
  </Link>;
}
