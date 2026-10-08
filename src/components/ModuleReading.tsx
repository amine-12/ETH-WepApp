import { BookOpen, Clock3 } from 'lucide-react';

export function ModuleReading({ paragraphs }: { paragraphs: string[] }) {
  const words = paragraphs.join(' ').trim().split(/\s+/u).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return <section className="module-reading" aria-label="Texte à lire">
    <div className="reading-meta"><span><BookOpen size={16} /> Lire et comprendre</span><span><Clock3 size={15} /> Environ {minutes} min de lecture</span></div>
    <div className="reading-content">{paragraphs.map(p => <p className="chapter-paragraph" key={p}>{p}</p>)}</div>
  </section>;
}
