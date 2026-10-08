import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { modules } from '../data/modules';
import { questions } from '../data/questions';
import { resources } from '../data/resources';
import { flush } from '../services/analyticsService';

interface Report {
  days: number; generatedAt: string;
  overview: { sessions: number; page_views: number; engaged_sessions: number; errors: number }[];
  daily: { day: string; sessions: number; page_views: number }[];
  pages: { path: string; views: number; sessions: number }[];
  modules: { module_id: string; started: number; completed: number }[];
  chapters: { module_id: string; section_id: string; sessions: number; active_seconds: number }[];
  exits: { module_id: string; section_id: string; sessions: number }[];
  questions: { entity_id: string; context: string; attempts: number; first_attempts: number; first_correct: number }[];
  activities: { entity_id: string; started: number; completed: number }[];
  quiz: { started: number; completed: number; average_score: number | null }[];
  scores: { score: number; runs: number }[];
  resources: { entity_id: string; clicks: number }[];
  devices: { device: string; sessions: number }[];
}
const percent = (n: number, total: number) => total ? `${Math.round(n / total * 100)} %` : '—';
const moduleName = (id: string) => modules.find(m => m.id === id)?.title ?? id;
const chapterName = (moduleId: string, sectionId: string) => sectionId === 'summary' ? 'Ce qu’il faut retenir' : modules.find(m => m.id === moduleId)?.sections.find(s => s.id === sectionId)?.title ?? sectionId;
const activityNames: Record<string, string> = { prompt: 'Construction du prompt', hallucination: 'Détection d’hallucination', eco: 'Conception responsable', privacy: 'Classement des données' };
function Table({ title, columns, rows }: { title: string; columns: string[]; rows: ReactNode[][] }) {
  return <section className="analytics-panel"><h2>{title}</h2>{rows.length ? <div className="analytics-table-scroll"><table><caption className="sr-only">{title}</caption><thead><tr>{columns.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead><tbody>{rows.map((cells, i) => <tr key={i}>{cells.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div> : <p>Aucune donnée pour cette période.</p>}</section>;
}

export function StatisticsPage() {
  const [password, setPassword] = useState('');
  const token = useRef('');
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);
  async function load(period = days, credential = token.current) {
    const id = ++requestId.current;
    setBusy(true); setError('');
    try {
      await flush();
      const response = await fetch(`/api/statistics?days=${period}`, { headers: { Authorization: `Bearer ${credential}` }, cache: 'no-store' });
      if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Les statistiques nécessitent la configuration Cloudflare. Consultez le guide de déploiement du projet.');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Statistiques indisponibles.');
      if (id !== requestId.current) return;
      token.current = credential; setPassword(''); setData(result); setDays(period);
    } catch (e) { if (id === requestId.current) setError(e instanceof Error ? e.message : 'Connexion impossible.'); }
    finally { if (id === requestId.current) setBusy(false); }
  }
  function login(event: FormEvent) { event.preventDefault(); void load(days, password); }
  function logout() { requestId.current++; token.current = ''; setPassword(''); setData(null); setError(''); setBusy(false); }
  const overview = data?.overview[0];
  const quiz = data?.quiz[0];
  return <div className="page-width section-space analytics-page">
    <div className="page-heading"><span className="eyebrow">ADMINISTRATION</span><h1>Statistiques d’utilisation</h1><p>Comprendre la fréquentation et améliorer le parcours pédagogique.</p></div>
    {!data ? <form className="analytics-login analytics-panel" onSubmit={login}><h2>Accès administrateur</h2><p>Ce tableau de bord est réservé à la personne qui gère le site.</p><label htmlFor="analytics-password">Mot de passe administrateur</label><input id="analytics-password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required maxLength={256} /><button className="button primary" disabled={busy}>{busy ? 'Connexion…' : 'Consulter les statistiques'}</button></form> : <>
      <div className="analytics-toolbar"><label>Période <select value={days} disabled={busy} onChange={e => void load(Number(e.target.value))}><option value={7}>7 derniers jours</option><option value={30}>30 derniers jours</option><option value={90}>90 derniers jours</option></select></label><button className="button secondary" disabled={busy} onClick={() => void load()}>{busy ? 'Actualisation…' : 'Actualiser'}</button><button className="text-button" onClick={() => { const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `statistiques-${days}jours.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }}>Exporter les données agrégées</button><button className="text-button" onClick={logout}>Se déconnecter</button></div>
      <p className="analytics-note">Uniquement les visites ayant accepté la mesure. Une session correspond à un parcours dans un onglet, avec une nouvelle session après 30 minutes d’inactivité. Les premières réponses sont mesurées par session ; elles ne prouvent pas une première exposition au contenu. Les dates des rapports sont en UTC.</p>
      <div className="analytics-kpis">{[
        ['Sessions', overview?.sessions ?? 0], ['Pages vues', overview?.page_views ?? 0],
        ['Sessions avec un module', percent(overview?.engaged_sessions ?? 0, overview?.sessions ?? 0)],
        ['Quiz terminés', `${quiz?.completed ?? 0} / ${quiz?.started ?? 0}`],
        ['Score moyen au quiz', quiz?.average_score == null ? '—' : `${Math.round(quiz.average_score)} %`],
        ['Erreurs techniques', overview?.errors ?? 0],
      ].map(([label, value]) => <div className="analytics-kpi" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
      <Table title="Fréquentation quotidienne" columns={['Date (UTC)', 'Sessions', 'Pages vues']} rows={data.daily.map(r => [r.day, r.sessions, r.page_views])} />
      <Table title="Modules commencés et terminés" columns={['Module', 'Sessions ayant commencé', 'Terminés', 'Complétion']} rows={data.modules.map(r => [moduleName(r.module_id), r.started, r.completed, percent(r.completed, r.started)])} />
      <p className="analytics-note">La complétion est calculée parmi les sessions ayant ouvert le module pendant la période. « Terminé » correspond au bouton de confirmation du visiteur.</p>
      <Table title="Lecture des chapitres" columns={['Module', 'Chapitre', 'Sessions', 'Temps actif total', 'Temps actif / session']} rows={data.chapters.map(r => [moduleName(r.module_id), chapterName(r.module_id, r.section_id), r.sessions, `${Math.round(r.active_seconds / 60)} min`, r.sessions ? `${Math.round(r.active_seconds / r.sessions)} s` : '—'])} />
      <Table title="Dernière étape des sessions sans module terminé" columns={['Module', 'Dernier chapitre consulté', 'Sessions']} rows={data.exits.map(r => [moduleName(r.module_id), chapterName(r.module_id, r.section_id), r.sessions])} />
      <p className="analytics-note">Ces sessions peuvent encore être en cours. Un chapitre affiché ou du temps actif ne garantit pas que le texte a été lu.</p>
      <Table title="Compréhension et tentatives" columns={['Question', 'Contexte', 'Premières réponses', 'Réussite à la première réponse', 'Tentatives / session']} rows={data.questions.map(r => [questions.find(q => q.id === r.entity_id)?.question ?? r.entity_id, r.context === 'quiz' ? 'Quiz' : 'Module', r.first_attempts, percent(r.first_correct, r.first_attempts), (r.attempts / r.first_attempts).toFixed(1)])} />
      <Table title="Activités utilisées" columns={['Activité', 'Sessions ayant commencé', 'Sessions ayant terminé']} rows={data.activities.map(r => [activityNames[r.entity_id] ?? r.entity_id, r.started, r.completed])} />
      <Table title="Distribution des résultats du quiz" columns={['Score', 'Quiz terminés']} rows={data.scores.map(r => [`${r.score} / 10`, r.runs])} />
      <Table title="Ressources ouvertes" columns={['Ressource', 'Clics']} rows={data.resources.map(r => [resources.find(s => s.id === r.entity_id)?.title ?? r.entity_id, r.clicks])} />
      <Table title="Pages consultées" columns={['Page', 'Vues', 'Sessions']} rows={data.pages.map(r => [r.path, r.views, r.sessions])} />
      <Table title="Appareils (selon la largeur d’écran)" columns={['Appareil', 'Sessions']} rows={data.devices.map(r => [({ mobile: 'Mobile', tablet: 'Tablette', desktop: 'Ordinateur' }[r.device] ?? r.device), r.sessions])} />
      <p className="analytics-note">Actualisé le {new Date(data.generatedAt).toLocaleString('fr-CA')}. Le mot de passe reste uniquement en mémoire dans cet onglet.</p>
    </>}
    {error && <p className="feedback review" role="alert">{error}</p>}
  </div>;
}
