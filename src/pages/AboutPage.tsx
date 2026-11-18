import { Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AboutPage() {
  return <div className="page-width section-space about-page">
    <div className="page-heading"><h1>À propos</h1><p>La genèse du projet, les auteurs et l'approche utilisée.</p></div>

    <section className="about-section" aria-labelledby="le-projet">
      <h2 id="le-projet" tabIndex={-1}><Link to="#le-projet">Le projet <Link2 size={18} aria-hidden="true" /></Link></h2>
      <p>IA & Éthique est un projet réalisé dans le cadre du cours universitaire ETH610. Ce projet propose un parcours pour comprendre les principaux enjeux éthiques liés à l’intelligence artificielle et réfléchir à un usage responsable.</p>
      <p>Le site s’adresse au public, petits et grands, qui souhaite découvrir ces enjeux. Les six modules associent lectures, questions et activités interactives, avec un quiz final pour faire le point.</p>
      <p>Ce projet est réalisé par des personnes étudiantes du baccalauréat en génie à l'École de technologie supérieure (ÉTS) :</p>
      <ul className="about-authors">
        <li><strong>Génie logiciel :</strong> Adam Belmellat, Mohammed Amine Mazigh et Samuel Richard.</li>
        <li><strong>Génie électrique :</strong> Yassine Bentajer.</li>
        <li><strong>Génie de la construction :</strong> Trixie Biligan Casuga.</li>
      </ul>
      <p>Tout le contenu pédagogique a été rédigé et recherché par les personnes à l'origine du projet. Le développement a consisté à organiser le parcours en modules et à l’intégrer dans une interface interactive. L’utilisation d’outils d’IA pour cette interface est détaillée dans la <Link to="#declaration-utilisation-ia">déclaration ci-dessous</Link>.</p>
    </section>

    <section className="about-section" aria-labelledby="declaration-utilisation-ia">
      <h2 id="declaration-utilisation-ia" tabIndex={-1}><Link to="#declaration-utilisation-ia">Déclaration de l’utilisation de l’IA <Link2 size={18} aria-hidden="true" /></Link></h2>
      <p>Une partie de l’interface du site a été conçue et implémentée avec l’aide d'outils d'intelligence artificielle générative. Certaines sections du contenu ont également été reformulées. Le contenu pédagogique est authentique et demeure attribué aux auteurs du projet.</p>
      <div className="about-table-scroll" role="region" aria-label="Outils d’IA utilisés pour l’interface" tabIndex={0}>
        <table>
          <caption>Utilisation de l’IA pour l’interface du site</caption>
          <thead><tr><th scope="col">Outil utilisé</th><th scope="col">Type d’utilisation</th><th scope="col">Précision</th></tr></thead>
          <tbody>
            <tr><td>Claude Code</td><td>Génération de code</td><td>La génération du site de base et de l'interface a été réalisée avec cet outil.</td></tr>
            <tr><td>Codex</td><td>Génération de code</td><td>L'ajustement de certaines sections et de quelques fonctionnalités a été réalisé avec cet outil.</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>;
}
