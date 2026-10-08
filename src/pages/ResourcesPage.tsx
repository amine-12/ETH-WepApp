import { BookOpen, ExternalLink, FileText } from 'lucide-react';
import { educationalReadings, resources } from '../data/resources';

export function ResourcesPage() {
  return <div className="page-width section-space resources-page">
    <div className="page-heading"><h1>Ressources</h1><p>Des cours, des guides et des lectures pour approfondir votre compréhension de l’intelligence artificielle.</p></div>
    <nav className="resource-shortcuts" aria-label="Sections des ressources">
      <a className="button secondary" href="#liens-utiles"><ExternalLink size={17} /> Liens utiles</a>
      <a className="button secondary" href="#textes-educatifs"><BookOpen size={18} /> Textes éducatifs</a>
    </nav>
    <section className="resource-section" id="liens-utiles" aria-labelledby="links-title">
      <div className="section-heading"><div><h2 id="links-title">Liens utiles</h2><p>Une sélection de ressources en français, avec l’organisme et le format indiqués.</p></div></div>
      <div className="resource-grid">{resources.map(resource => <a className="resource-card" key={resource.id} href={resource.url} target="_blank" rel="noopener noreferrer">
        <div className="resource-card-top"><span className="resource-theme">{resource.theme}</span><ExternalLink size={17} aria-hidden="true" /></div>
        <h3>{resource.title}</h3><span className="resource-publisher">{resource.publisher}</span><p>{resource.description}</p>
        <div className="resource-card-bottom"><span>{resource.format} · Français</span><span className="sr-only">Ouvrir dans un nouvel onglet</span></div>
      </a>)}</div>
    </section>
    <section className="resource-section" id="textes-educatifs" aria-labelledby="readings-title">
      <div className="section-heading"><div><h2 id="readings-title">Textes éducatifs</h2><p>De courtes synthèses pour comprendre les notions essentielles. Les sources sont accessibles après chaque texte.</p></div></div>
      <div className="resource-reading-layout"><nav className="resource-reading-nav" aria-label="Choisir un texte éducatif"><strong>Dans ces lectures</strong>{educationalReadings.map((reading, i) => <a key={reading.id} href={`#lecture-${reading.id}`}><span>{String(i + 1).padStart(2, '0')}</span>{reading.title}</a>)}</nav>
        <div className="resource-readings">{educationalReadings.map((reading, i) => <article className="resource-reading" key={reading.id} id={`lecture-${reading.id}`} aria-labelledby={`title-${reading.id}`}>
          <div className="resource-reading-label"><FileText size={17} /><span>Lecture {i + 1} · Environ 1 min</span></div><h3 id={`title-${reading.id}`}>{reading.title}</h3>
          {reading.paragraphs.map(p => <p key={p}>{p}</p>)}
          <div className="sources"><strong>Sources et approfondissement</strong>{reading.sourceIds.map(id => { const source = resources.find(r => r.id === id)!; return <a key={id} href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher} — {source.title}<span className="sr-only"> (nouvel onglet)</span></a>; })}</div>
        </article>)}</div>
      </div>
    </section>
  </div>;
}
