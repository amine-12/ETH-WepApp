import { BrandLogo } from './components/BrandLogo';
import { StatisticsPage } from './pages/StatisticsPage';
import { AnalyticsPreference, AnalyticsTracker, useChapterAnalytics } from './components/Analytics';
import { track } from './services/analyticsService';
import { ResourcesPage } from './pages/ResourcesPage';
import { ModuleReading } from './components/ModuleReading';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { BookOpen, Check, CheckCircle2, Clock3, GraduationCap, Menu, X, Target, Lightbulb } from 'lucide-react';
import { modules } from './data/modules';
import { finalQuizIds, questions } from './data/questions';
import { useProgress } from './context/ProgressContext';
import { ModuleCard, moduleIcons, ProgressBar } from './components/common';
import { QuestionCard } from './components/QuestionCard';
import { EcoAiGame, HallucinationGame, InteractiveDiagram, PrivacyGame, PromptBuilder } from './components/activities';
import type { LearningModule } from './types/course';

function Header() {
  const { progress } = useProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const completed = modules.filter(m => progress.completedModules.includes(m.id)).length;
  const resume = modules.find(m => m.id === progress.lastModule) ?? modules[0];
  useEffect(() => setMenuOpen(false), [location.pathname]);
  return <header className="site-header"><div className="header-inner"><Link to="/" className="brand" aria-label="IA et Éthique, accueil"><span className="brand-mark"><BrandLogo /></span><span>IA & Éthique<small>EXPLORER, COMPRENDRE, AGIR</small></span></Link><button className="menu-toggle" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X /> : <Menu />}</button><nav id="main-nav" className={menuOpen ? 'open' : ''} aria-label="Navigation principale" onClick={() => setMenuOpen(false)}><NavLink to="/" end>Accueil</NavLink><NavLink to="/modules">Modules</NavLink><NavLink to="/quiz">Quiz</NavLink><NavLink to="/ressources">Ressources</NavLink><NavLink to="/progression">Ma progression</NavLink></nav><div className="header-actions"><span className="header-progress">{completed} / 6<ProgressBar value={completed / 6 * 100} label="Modules terminés" /></span><Link className="button small primary" to={`/modules/${resume.id}`}>Reprendre</Link></div></div></header>;
}

function RouteEffects() {
  const { pathname } = useLocation();
  const firstRender = useRef(true);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const current = modules.find(m => pathname === `/modules/${m.id}`);
    const label = current?.title ?? ({ '/': 'Accueil', '/modules': 'Les modules', '/quiz': 'Quiz final', '/ressources': 'Ressources', '/progression': 'Ma progression', '/statistiques': 'Statistiques' }[pathname] ?? 'Page introuvable');
    document.title = `${label} · IA & Éthique`;
    if (!firstRender.current) document.getElementById('main-content')?.focus({ preventScroll: true });
    firstRender.current = false;
  }, [pathname]);
  return null;
}

function HomePage() {
  return <><section className="hero page-width"><div className="hero-copy"><h1>Comprendre l’IA.<br /><span>Réfléchir à ses impacts.</span><br />L’utiliser de façon<br className="desktop-break" /> responsable.</h1><p>Explorez les enjeux éthiques de l’intelligence artificielle à travers des modules interactifs, des exemples et des mises en situation.</p><div className="button-row"><Link to="/modules/comprendre-ia" className="button primary">Commencer le parcours</Link><Link to="/modules" className="button secondary">Voir les modules</Link></div><div className="hero-meta"><span><BookOpen size={16} /> 6 modules</span><span><Clock3 size={16} /> À votre rythme</span><span><GraduationCap size={18} /> Sans compte</span></div></div><div className="hero-visual" aria-label="Trois dimensions d’une IA responsable"><div className="visual-label">LE PROGRÈS A BESOIN DE RECUL.</div><div className="ethics-orbit"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-ring ring-three" /><span className="orbit-center">IA<span>& ÉTHIQUE</span></span><span className="orbit-node node-human">01 / HUMAIN</span><span className="orbit-node node-data">02 / DONNÉES</span><span className="orbit-node node-impact">03 / IMPACTS</span></div></div></section><section className="course-strip"><div className="page-width"><span><Target size={21} /> Comprendre avant d’utiliser</span><span><Lightbulb size={21} /> Apprendre en expérimentant</span><span><ShieldIcon /> Décider en connaissance de cause</span></div></section><section className="page-width section-space"><div className="section-heading"><div><span className="eyebrow">VOTRE PARCOURS</span><h2>Six perspectives. Un regard éclairé.</h2><p>Chaque module apporte une nouvelle pièce à votre réflexion.</p></div></div><div className="module-grid">{modules.map(m => <ModuleCard module={m} key={m.id} />)}</div></section><section className="page-width quiz-banner"><div className="quiz-banner-icon"><GraduationCap size={38} /></div><div><span className="eyebrow">FAITES LE POINT</span><h2>Et vous, quels réflexes avez-vous ?</h2><p>Dix questions pour tester votre compréhension et repérer les thèmes à revoir.</p></div><Link className="button primary" to="/quiz">Tester mes connaissances</Link></section></>;
}
function ShieldIcon() { const Icon = moduleIcons.shield; return <Icon size={21} />; }

function ModulesPage() {
  return <div className="page-width section-space"><div className="page-heading"><span className="eyebrow">LE PARCOURS</span><h1>Les modules</h1><p>Commencez par les bases ou explorez le thème qui vous intéresse. Chaque étape se sauvegarde sur cet appareil.</p></div><div className="module-grid">{modules.map(m => <ModuleCard key={m.id} module={m} />)}</div></div>;
}

function ModulePage() {
  const { moduleId } = useParams();
  const module = modules.find(m => m.id === moduleId);
  return module ? <ModuleLayout key={module.id} module={module} /> : <NotFound />;
}

function ModuleLayout({ module }: { module: LearningModule }) {
  const { progress, openModule, setSection, completeModule } = useProgress();
  const [index, setIndex] = useState(Math.min(progress.moduleProgress[module.id] ?? 0, module.sections.length));
  const Icon = moduleIcons[module.icon];
  const completed = progress.completedModules.includes(module.id);
  const current = module.sections[index];
  useChapterAnalytics(module.id, current?.id ?? 'summary');
  const total = module.sections.length + 1;
  useEffect(() => { openModule(module.id); }, [module.id, openModule]);
  function move(to: number) {
    setIndex(to); setSection(module.id, to);
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => document.getElementById('chapter-title')?.focus({ preventScroll: true }));
  }
  const allQuestionIds = module.sections.flatMap(s => s.questionIds ?? []);
  const answeredCount = allQuestionIds.filter(id => progress.answers[id]).length;
  const score = allQuestionIds.filter(id => progress.answers[id]?.isCorrect).length;
  const nextModule = modules[module.number];
  return <div className={`page-width module-page theme-${module.icon}`}><Link className="breadcrumb" to="/modules">Tous les modules / Module {String(module.number).padStart(2, '0')}</Link><div className="module-page-heading"><span className="icon-tile"><Icon size={30} /></span><div><span className="eyebrow">MODULE {String(module.number).padStart(2, '0')} · {module.estimatedMinutes} MIN</span><h1>{module.title}</h1><p>{module.description}</p></div></div><div className="module-shell"><aside className="chapter-nav" aria-label="Chapitres du module"><div className="chapter-progress"><span>Votre avancée</span><strong>{completed ? 100 : Math.round(index / total * 100)} %</strong><ProgressBar value={completed ? 100 : index / total * 100} label="Avancée dans le module" /></div>{[...module.sections.map(s => s.title), 'Ce qu’il faut retenir'].map((title, i) => <button key={title} className={index === i ? 'active' : ''} onClick={() => move(i)} aria-current={index === i ? 'step' : undefined}><span>{completed || index > i ? <Check size={14} /> : String(i + 1).padStart(2, '0')}</span>{title}</button>)}<p className="sidebar-note"><BookOpen size={17} /> Prenez votre temps.<br />Comprendre compte plus que terminer.</p></aside><article className="chapter-content" key={index}><span className="eyebrow">CHAPITRE {index + 1} / {total}</span><h2 id="chapter-title" tabIndex={-1}>{current?.title ?? 'Ce qu’il faut retenir'}</h2>{current ? <><ModuleReading paragraphs={current.paragraphs} />{current.diagram && <InteractiveDiagram steps={current.diagram} />}{current.concept && <div className="concept-box"><Lightbulb size={23} /><div><span className="eyebrow">LE REPÈRE ÉTHIQUE</span><h3>{current.concept.title}</h3><p>{current.concept.text}</p></div></div>}{current.example && <div className="example-box"><span className="eyebrow">MISE EN SITUATION</span><h3>{current.example.title}</h3><p>{current.example.text}</p></div>}{current.points && <ul className="checklist">{current.points.map(p => <li key={p}><Check size={18} />{p}</li>)}</ul>}{current.activity === 'prompt' && <PromptBuilder />}{current.activity === 'hallucination' && <HallucinationGame />}{current.activity === 'eco' && <EcoAiGame />}{current.activity === 'privacy' && <PrivacyGame />}{current.cases && <div className="course-cases"><span className="eyebrow">CAS PROPOSÉS DANS LE DOSSIER DU COURS</span>{current.cases.map(c => <details key={c.title}><summary>{c.title}</summary><p>{c.text}</p></details>)}</div>}{!!current.questionIds?.length && <div className="reading-followup"><span className="eyebrow">APRÈS LA LECTURE</span><h3>Vérifiez votre compréhension</h3><p>Appuyez-vous sur le texte que vous venez de lire pour répondre aux questions.</p></div>}{current.questionIds?.map(id => { const q = questions.find(q => q.id === id); return q ? <QuestionCard key={id} question={q} /> : null; })}{current.sources && <div className="sources"><strong>Pour approfondir</strong>{current.sources.map(s => <a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.label} <span className="sr-only">(nouvel onglet)</span></a>)}</div>}</> : <><ul className="takeaways">{module.takeaways.map((t, i) => <li key={t}><span>{String(i + 1).padStart(2, '0')}</span>{t}</li>)}</ul><div className="module-result"><h3>{completed ? 'Module terminé' : 'Un nouveau regard sur l’IA'}</h3><p>{answeredCount ? `${score} bonne${score > 1 ? 's' : ''} réponse${score > 1 ? 's' : ''} sur ${answeredCount} question${answeredCount > 1 ? 's' : ''} répondue${answeredCount > 1 ? 's' : ''}.` : 'Vous pouvez revenir aux questions pour mettre vos connaissances à l’épreuve.'}</p>{!completed && <button className="button primary" onClick={() => completeModule(module.id)}><CheckCircle2 size={18} /> Marquer le module comme terminé</button>}{completed && <p className="inline-success"><CheckCircle2 size={18} /> Progression enregistrée sur cet appareil.</p>}<div className="button-row"><Link className="button secondary" to="/quiz">Tester mes connaissances</Link>{nextModule && <Link className="button secondary" to={`/modules/${nextModule.id}`}>Module suivant</Link>}</div></div></>}
    <div className="chapter-footer"><button className="button secondary" disabled={index === 0} onClick={() => move(index - 1)}>Précédent</button><span>{index + 1} / {total}</span>{index < total - 1 ? <button className="button primary" onClick={() => move(index + 1)}>Continuer</button> : <Link className="button primary" to="/progression">Ma progression</Link>}</div></article></div></div>;
}

function QuizPage() {
  const { saveQuiz, progress } = useProgress();
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const quizRun = useRef('');
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);
  const quizQuestions = finalQuizIds.map(id => questions.find(q => q.id === id)!);
  const finished = index === quizQuestions.length;
  const score = Object.values(results).filter(Boolean).length;
  function restart() { quizRun.current = crypto.randomUUID(); track('quiz_started', { entityId: quizRun.current }, true); setStarted(true); setIndex(0); setResults({}); setReady(false); setRound(r => r + 1); }
  function next() {
    if (index === quizQuestions.length - 1) { saveQuiz(score, quizQuestions.length); track('quiz_started', { entityId: quizRun.current }, true); track('quiz_completed', { entityId: quizRun.current, value: score, total: quizQuestions.length }, true); }
    setIndex(i => i + 1); setReady(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  return <div className="page-width quiz-page section-space"><div className="page-heading"><span className="eyebrow">TESTER · COMPRENDRE · PROGRESSER</span><h1>Le quiz final</h1><p>Dix questions, six perspectives. Faites le point sur vos réflexes.</p></div>{!started ? <div className="quiz-intro"><span className="icon-tile"><GraduationCap size={36} /></span><h2>Prêt à mettre vos connaissances en pratique ?</h2><p>Une question à la fois, sans limite de temps. Chaque réponse est accompagnée d’une explication pour apprendre de vos choix.</p><div className="hero-meta"><span>10 questions</span><span>6 modules</span><span>Environ 5 minutes</span></div><button className="button primary" onClick={restart}>Commencer le quiz</button>{progress.quizResult && <p className="previous-score">Dernier résultat : {progress.quizResult.score} / {progress.quizResult.total}</p>}</div> : finished ? <div className="quiz-results"><span className="eyebrow">VOTRE RÉSULTAT</span><div className="score-display">{score}<span>/ {quizQuestions.length}</span></div><h2>{score >= 8 ? 'Des réflexes bien ancrés.' : 'Chaque question ouvre une piste.'}</h2><p>Votre résultat est une invitation à poursuivre la réflexion.</p><div className="result-columns"><div><h3>Points bien compris</h3>{modules.filter(m => quizQuestions.some(q => q.moduleId === m.id && results[q.id])).map(m => <p key={m.id}><CheckCircle2 size={17} /> {m.title}</p>) || null}{score === 0 && <p>Relisez les explications, puis réessayez.</p>}</div><div><h3>Points à revoir</h3>{modules.filter(m => quizQuestions.some(q => q.moduleId === m.id && results[q.id] === false)).map(m => <Link to={`/modules/${m.id}`} key={m.id}>{m.title}</Link>)}{score === quizQuestions.length && <p>Tous les thèmes ont été bien compris dans ce quiz.</p>}</div></div><div className="quiz-review">{quizQuestions.map(q => <details key={q.id}><summary>{results[q.id] ? 'Bonne réponse' : 'À revoir'} · {q.question}</summary><p>{q.explanation}</p></details>)}</div><div className="button-row"><button className="button primary" onClick={restart}>Recommencer</button><Link className="button secondary" to="/progression">Ma progression</Link></div></div> : <><div className="quiz-status"><span>Question {index + 1} sur {quizQuestions.length}</span><span>{modules.find(m => m.id === quizQuestions[index].moduleId)?.title}</span></div><ProgressBar value={index / quizQuestions.length * 100} label="Avancée du quiz" /><QuestionCard key={`${round}-${index}`} restore={false} question={quizQuestions[index]} onAnswered={correct => { setResults(r => ({ ...r, [quizQuestions[index].id]: correct })); setReady(true); }} /><div className="quiz-next"><button className="button primary" disabled={!ready} onClick={next}>{index === quizQuestions.length - 1 ? 'Voir mon résultat' : 'Question suivante'}</button></div></>}</div>;
}

function ProgressPage() {
  const { progress } = useProgress();
  const completed = modules.filter(m => progress.completedModules.includes(m.id)).length;
  const started = modules.filter(m => Object.hasOwn(progress.moduleProgress, m.id)).length;
  const answered = Object.values(progress.answers);
  const correct = answered.filter(a => a.isCorrect).length;
  const resume = modules.find(m => m.id === progress.lastModule) ?? modules[0];
  return <div className="page-width section-space"><div className="page-heading"><span className="eyebrow">VOTRE CHEMINEMENT</span><h1>Ma progression</h1><p>Votre parcours, sauvegardé sur cet appareil. Avancez à votre rythme.</p></div><div className="progress-overview"><div className="overall-progress"><span className="eyebrow">MODULES TERMINÉS</span><h2>{completed}<span> / {modules.length}</span></h2><ProgressBar value={completed / modules.length * 100} label="Progression générale" /><Link className="button primary" to={`/modules/${resume.id}`}>{started ? 'Continuer mon parcours' : 'Commencer mon parcours'}</Link></div><div className="stat"><BookOpen size={23} /><strong>{started}</strong><span>module{started > 1 ? 's' : ''} commencé{started > 1 ? 's' : ''}</span></div><div className="stat"><CheckCircle2 size={23} /><strong>{answered.length ? `${correct} / ${answered.length}` : '—'}</strong><span>dernières réponses correctes</span></div><div className="stat"><GraduationCap size={25} /><strong>{progress.quizResult ? `${progress.quizResult.score} / ${progress.quizResult.total}` : '—'}</strong><span>dernier quiz final</span><Link to="/quiz">{progress.quizResult ? 'Refaire le quiz' : 'Passer le quiz'}</Link></div></div><div className="section-heading"><div><h2>Votre parcours, module par module</h2><p>Reprenez où vous en étiez ou revenez sur une notion.</p></div></div><div className="module-grid">{modules.map(m => <ModuleCard key={m.id} module={m} />)}</div><div className="local-notice"><ShieldIcon /><p>Votre progression et vos choix de réponse restent dans ce navigateur. Si vous acceptez les statistiques facultatives, des événements d’utilisation et la réussite aux questions sont envoyés pour améliorer le parcours. Aucun compte n’est nécessaire. Effacer les données du navigateur supprime votre progression locale.</p></div></div>;
}

function NotFound() { return <div className="page-width section-space page-heading"><span className="eyebrow">404</span><h1>Cette page n’existe pas.</h1><p>Retrouvez les six modules du parcours.</p><Link className="button primary" to="/modules">Voir les modules</Link></div>; }

export default function App() {
  const { storageAvailable } = useProgress();
  return <><a className="skip-link" href="#main-content">Aller au contenu</a><Header /><RouteEffects /><AnalyticsTracker /><AnalyticsPreference initial /><main id="main-content" tabIndex={-1}>{!storageAvailable && <div className="storage-warning" role="status">Le stockage est indisponible. Vous pouvez poursuivre, mais votre progression ne sera pas conservée après fermeture.</div>}<Routes><Route path="/" element={<HomePage />} /><Route path="/modules" element={<ModulesPage />} /><Route path="/modules/:moduleId" element={<ModulePage />} /><Route path="/quiz" element={<QuizPage />} /><Route path="/ressources" element={<ResourcesPage />} /><Route path="/progression" element={<ProgressPage />} /><Route path="/statistiques" element={<StatisticsPage />} /><Route path="*" element={<NotFound />} /></Routes></main><AnalyticsPreference /><footer className="site-footer"><div className="page-width"><div><strong>IA & Éthique</strong><span>Un parcours pédagogique</span></div><p>Apprendre à utiliser l’IA, c’est aussi apprendre à la questionner.</p><Link to="/statistiques">Administration</Link></div></footer></>;
}
