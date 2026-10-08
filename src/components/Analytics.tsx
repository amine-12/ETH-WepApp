import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { analyticsService, flush, track } from '../services/analyticsService';
import { modules } from '../data/modules';
import { resources } from '../data/resources';

export function AnalyticsTracker() {
  const { pathname } = useLocation();
  const ready = useSyncExternalStore(analyticsService.subscribe, analyticsService.isReady);
  useEffect(() => analyticsService.start(), []);
  useEffect(() => {
    if (pathname === '/statistiques') void flush();
    if (ready && ['/', '/modules', '/quiz', '/ressources', '/progression', ...modules.map(m => `/modules/${m.id}`)].includes(pathname)) track('page_view', { path: pathname });
  }, [pathname, ready]);
  useEffect(() => {
    const click = (event: MouseEvent) => {
      const link = (event.target as Element)?.closest?.('a');
      const resource = resources.find(r => r.url === link?.href);
      if (resource) track('resource_clicked', { entityId: resource.id });
    };
    const error = (event: ErrorEvent) => track('technical_error', { entityId: event.message ? 'runtime' : 'resource' });
    const rejection = () => track('technical_error', { entityId: 'runtime' });
    document.addEventListener('click', click);
    window.addEventListener('error', error, true);
    window.addEventListener('unhandledrejection', rejection);
    return () => { document.removeEventListener('click', click); window.removeEventListener('error', error, true); window.removeEventListener('unhandledrejection', rejection); };
  }, []);
  return null;
}

export function useChapterAnalytics(moduleId: string, sectionId: string) {
  const ready = useSyncExternalStore(analyticsService.subscribe, analyticsService.isReady);
  useEffect(() => {
    if (!ready) return;
    track('module_started', { moduleId }, true);
    track('chapter_view', { moduleId, sectionId });
    let lastTick = Date.now();
    let lastInteraction = Date.now();
    let seconds = 0;
    let wasVisible = !document.hidden;
    const collect = () => {
      const now = Date.now();
      if (wasVisible && now - lastInteraction <= 60000) seconds += Math.min((now - lastTick) / 1000, 5);
      lastTick = now;
      wasVisible = !document.hidden;
    };
    const send = () => {
      collect();
      const value = Math.min(60, Math.floor(seconds));
      if (value > 0) { track('active_time', { moduleId, sectionId, value }); seconds -= value; }
    };
    const interaction = () => { collect(); lastInteraction = Date.now(); };
    const visibility = () => { send(); if (document.hidden) void flush(true); };
    const leave = () => { send(); void flush(true); };
    const tick = window.setInterval(collect, 1000);
    const timer = window.setInterval(send, 30000);
    for (const name of ['pointerdown', 'keydown', 'scroll']) window.addEventListener(name, interaction, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', leave);
    return () => {
      send(); clearInterval(tick); clearInterval(timer);
      for (const name of ['pointerdown', 'keydown', 'scroll']) window.removeEventListener(name, interaction);
      document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', leave);
    };
  }, [moduleId, sectionId, ready]);
}

function ConsentDialog({ onChoice, onDismiss }: { onChoice: (value: 'accepted' | 'declined') => void; onDismiss: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const element = dialog.current;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(<dialog ref={dialog} className="analytics-consent-dialog" aria-labelledby="analytics-consent-title" aria-describedby="analytics-consent-description" onCancel={event => { event.preventDefault(); onDismiss(); }} onKeyDown={event => {
    if (event.key !== 'Tab') return;
    const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>('button');
    if (!buttons?.length) return;
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }}>
    <div className="analytics-choice">
      <div><span className="eyebrow">VOTRE VIE PRIVÉE</span><h2 id="analytics-consent-title">Nous aider à améliorer le parcours</h2><p id="analytics-consent-description">Acceptez-vous la mesure de votre utilisation : pages, temps actif, activités et réussite aux questions ? Aucun nom ni texte libre n’est envoyé. Les données sont associées à un identifiant aléatoire de session. Les rapports couvrent 90 jours ; les anciens événements sont supprimés lors des visites suivantes. Votre choix peut être modifié dans le pied de page à tout moment.</p><p>Vous pouvez utiliser tous les modules même si vous refusez.</p></div>
      <div className="button-row"><button className="button secondary" onClick={() => onChoice('declined')}>Refuser</button><button className="button primary" onClick={() => onChoice('accepted')}>Accepter les statistiques</button></div>
    </div>
  </dialog>, document.body);
}

export function AnalyticsPreference({ initial = false }: { initial?: boolean }) {
  const choice = useSyncExternalStore(analyticsService.subscribe, analyticsService.getChoice);
  const status = useSyncExternalStore(analyticsService.subscribe, analyticsService.getStatus);
  const [editing, setEditing] = useState(false);
  if ((initial && choice !== null) || (!initial && choice === null)) return null;
  const open = choice === null || editing;
  const choose = (value: 'accepted' | 'declined') => { analyticsService.choose(value); setEditing(false); };
  const popup = <ConsentDialog onChoice={choose} onDismiss={() => { if (choice === null) choose('declined'); else setEditing(false); }} />;
  if (open && initial) return popup;
  return <div className="analytics-preference page-width">
    <button className="text-button" onClick={() => setEditing(true)}>Statistiques facultatives : {choice === 'accepted' ? 'acceptées' : 'refusées'} · Modifier mon choix</button>{choice === 'accepted' && <p className="analytics-note" role="status">{status === 'active' ? 'La collecte des statistiques est active.' : status === 'checking' ? 'Vérification de la collecte…' : status === 'error' ? 'L’envoi des statistiques a échoué. Une nouvelle tentative sera effectuée.' : 'La collecte est indisponible pour le moment. Votre parcours reste utilisable.'}</p>}
    {open && popup}
  </div>;
}
