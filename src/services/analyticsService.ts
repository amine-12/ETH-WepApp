import { modules } from '../data/modules';

export type AnalyticsChoice = 'accepted' | 'declined' | null;
type EventData = { path?: string; moduleId?: string; sectionId?: string; entityId?: string; context?: 'course' | 'quiz'; value?: number; total?: number; correct?: boolean };
type Event = EventData & { id: string; name: string };
type QueuedEvent = { sessionId: string; device: string; event: Event };
const CHOICE_KEY = 'ia-ethique.analytics.choice';
const SESSION_KEY = 'ia-ethique.analytics.session';
const TIMEOUT = 30 * 60 * 1000;
const paths = new Set(['/', '/modules', '/quiz', '/progression', '/ressources', ...modules.map(m => `/modules/${m.id}`)]);
let choice: AnalyticsChoice = null;
try {
  const saved = localStorage.getItem(CHOICE_KEY);
  if (saved === 'accepted' || saved === 'declined') choice = saved;
} catch { /* Le choix peut rester en mémoire. */ }
let ready = false;
let status: 'inactive' | 'checking' | 'active' | 'unavailable' | 'error' = 'inactive';
let generation = 0;
let session: { id: string; last: number; seen: string[]; device: string } | null = null;
let queue: QueuedEvent[] = [];
let sending = false;
let failures = 0;
let chapter: { moduleId?: string; sectionId?: string } | null = null;
let controller: AbortController | null = null;
let pendingRequest: Promise<Response> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(listener => listener());
const device = () => window.innerWidth < 700 ? 'mobile' : window.innerWidth < 1100 ? 'tablet' : 'desktop';

function persistSession() {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* Mémoire seulement. */ }
}
function ensureSession() {
  if (!session) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null');
      if (saved && /^[0-9a-f-]{36}$/i.test(saved.id) && typeof saved.last === 'number' && Array.isArray(saved.seen) && ['mobile', 'tablet', 'desktop'].includes(saved.device)) session = saved;
    } catch { /* Nouvelle session. */ }
  }
  if (!session || Date.now() - session.last > TIMEOUT) {
    session = { id: crypto.randomUUID(), last: Date.now(), seen: [], device: device() };
    queue.push({ sessionId: session.id, device: session.device, event: { id: crypto.randomUUID(), name: 'session_started' } });
  }
  session.last = Date.now();
  persistSession();
  return session;
}

async function configure() {
  const currentGeneration = ++generation;
  if (choice !== 'accepted') return;
  status = 'checking'; emit();
  try {
    const response = await fetch('/api/analytics', { cache: 'no-store' });
    const config = response.ok ? await response.json() : null;
    if (currentGeneration !== generation || choice !== 'accepted') return;
    ready = config?.enabled === true;
    status = ready ? 'active' : 'unavailable';
    emit();
  } catch {
    if (currentGeneration === generation) { ready = false; status = 'unavailable'; emit(); }
  }
}

export function track(name: string, data: EventData = {}, once = false) {
  if (!ready || choice !== 'accepted' || !paths.has(window.location.pathname)) return;
  if (name === 'chapter_view') chapter = { moduleId: data.moduleId, sectionId: data.sectionId };
  const current = ensureSession();
  // Une reprise après une longue inactivité constitue un nouveau parcours.
  if (name !== 'module_started' && data.moduleId && window.location.pathname === `/modules/${data.moduleId}` && !current.seen.includes(`module_started:${data.moduleId}:`)) {
    track('module_started', { moduleId: data.moduleId }, true);
    if (name !== 'chapter_view' && chapter?.moduleId === data.moduleId) track('chapter_view', chapter);
  }
  const key = `${name}:${data.moduleId ?? ''}:${data.entityId ?? ''}`;
  if (once && current.seen.includes(key)) return;
  if (once) { current.seen.push(key); persistSession(); }
  queue.push({ sessionId: current.id, device: current.device, event: { id: crypto.randomUUID(), name, path: window.location.pathname, ...data } });
  if (queue.length > 100) queue.splice(0, queue.length - 100);
  if (queue.length >= 20 || ['question_answered', 'module_completed', 'quiz_completed', 'activity_completed'].includes(name)) void flush();
}

export async function flush(keepalive = false) {
  if (!ready || choice !== 'accepted') return;
  if (sending) {
    await pendingRequest?.catch(() => undefined);
    return flush(keepalive);
  }
  if (!queue.length || !session) return;
  const { sessionId, device: sessionDevice } = queue[0];
  const count = queue.findIndex((item, i) => i >= 20 || item.sessionId !== sessionId);
  const batch = queue.splice(0, count === -1 ? Math.min(20, queue.length) : count);
  const currentGeneration = generation;
  sending = true;
  controller = new AbortController();
  const timeout = window.setTimeout(() => controller?.abort(), 8000);
  try {
    pendingRequest = fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, device: sessionDevice, events: batch.map(item => item.event) }), keepalive, signal: controller.signal });
    const response = await pendingRequest;
    if (!response.ok) throw new Error('Collecte indisponible');
    failures = 0;
    if (currentGeneration === generation) { status = 'active'; emit(); }
  } catch {
    if (currentGeneration === generation && choice === 'accepted') {
      status = 'error'; emit();
      if (++failures <= 3) queue.unshift(...batch);
    }
  } finally {
    clearTimeout(timeout);
    sending = false;
    controller = null;
    pendingRequest = null;
  }
  if (currentGeneration === generation && failures === 0 && queue.length) await flush(keepalive);
}

export const analyticsService = {
  getChoice: () => choice,
  isReady: () => ready,
  getStatus: () => status,
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  choose(value: Exclude<AnalyticsChoice, null>) {
    choice = value;
    ready = false;
    status = 'inactive';
    generation++;
    controller?.abort();
    queue = [];
    session = null;
    failures = 0;
    try { localStorage.setItem(CHOICE_KEY, value); sessionStorage.removeItem(SESSION_KEY); } catch { /* Mémoire seulement. */ }
    emit();
    if (value === 'accepted') void configure();
  },
  start() {
    void configure();
    const timer = window.setInterval(() => { void flush(); }, 15000);
    const leave = () => { void flush(true); };
    const hidden = () => { if (document.hidden) leave(); };
    const recover = () => { if (choice === 'accepted' && !ready) void configure(); };
    window.addEventListener('online', recover);
    window.addEventListener('focus', recover);
    window.addEventListener('pagehide', leave);
    document.addEventListener('visibilitychange', hidden);
    return () => { clearInterval(timer); window.removeEventListener('pagehide', leave); document.removeEventListener('visibilitychange', hidden); window.removeEventListener('online', recover); window.removeEventListener('focus', recover); };
  },
};

const activityModules: Record<string, string> = { prompt: 'bien-utiliser-ia', hallucination: 'hallucinations', eco: 'environnement', privacy: 'vie-privee' };
export function startActivity(id: string) { track('activity_started', { entityId: id, moduleId: activityModules[id] }, true); }
export function finishActivity(id: string, correct: boolean) {
  startActivity(id);
  track('activity_completed', { entityId: id, moduleId: activityModules[id], correct }, true);
}
