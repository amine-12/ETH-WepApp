import { Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AboutPage() {
  return <div className="page-width section-space about-page">
    <div className="page-heading"><span className="eyebrow">LA DÉMARCHE</span><h1>À propos</h1><p>Les personnes, les objectifs et les outils derrière IA & Éthique.</p></div>

    <section className="about-section" aria-labelledby="le-projet">
      <h2 id="le-projet" tabIndex={-1}><Link to="#le-projet">Le projet <Link2 size={18} aria-hidden="true" /></Link></h2>
      <p>IA & Éthique est un projet réalisé dans le cadre du cours universitaire ETH610. Il propose un parcours pour comprendre les principaux enjeux éthiques liés à l’intelligence artificielle et réfléchir à un usage responsable.</p>
      <p>Le site s’adresse aux personnes francophones qui souhaitent découvrir ces enjeux. Les six modules associent lectures, questions et activités interactives, avec un quiz final pour faire le point.</p>
      <p>Le contenu pédagogique a été rédigé par une équipe issue de trois disciplines du génie :</p>
      <ul className="about-authors">
        <li><strong>Génie logiciel :</strong> Adam Belmellat, Mohammed Amine Mazigh et Samuel Richard.</li>
        <li><strong>Génie électrique :</strong> Yassine Bentajer.</li>
        <li><strong>Génie de la construction :</strong> Trixie Biligan Casuga.</li>
      </ul>
      <p>À partir de ces contenus, le développement a consisté à organiser le parcours en modules et à l’intégrer dans une interface interactive. L’utilisation d’outils d’IA pour cette interface est détaillée dans la <Link to="#declaration-utilisation-ia">déclaration ci-dessous</Link>.</p>
    </section>

    <section className="about-section" aria-labelledby="declaration-utilisation-ia">
      <h2 id="declaration-utilisation-ia" tabIndex={-1}><Link to="#declaration-utilisation-ia">Déclaration de l’utilisation de l’IA <Link2 size={18} aria-hidden="true" /></Link></h2>
      <p>Une partie de l’interface du site a été conçue et implémentée avec l’aide de Claude Code et de Codex. Certaines sections du contenu ont également été reformulées. Le contenu pédagogique est authentique et demeure attribué aux auteurs du projet.</p>
      <div className="about-table-scroll" role="region" aria-label="Outils d’IA utilisés pour l’interface" tabIndex={0}>
        <table>
          <caption>Utilisation de l’IA pour l’interface du site</caption>
          <thead><tr><th scope="col">Outil utilisé</th><th scope="col">Type d’utilisation</th><th scope="col">Précision</th></tr></thead>
          <tbody>
            <tr><td>Claude Code</td><td>Implémentation de l’interface</td><td>Conception et réalisation partielles de l’interface du site.</td></tr>
            <tr><td>Codex</td><td>Implémentation de l’interface</td><td>Conception et réalisation partielles de l’interface du site.</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>;
}
