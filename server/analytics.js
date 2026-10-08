import { catalog } from './catalog.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const names = new Set(['session_started', 'page_view', 'module_started', 'module_completed', 'chapter_view', 'active_time', 'question_answered', 'activity_started', 'activity_completed', 'quiz_started', 'quiz_completed', 'resource_clicked', 'technical_error']);
const activities = { prompt: 'bien-utiliser-ia', hallucination: 'hallucinations', eco: 'environnement', privacy: 'vie-privee' };
const paths = new Set(['/', '/modules', '/quiz', '/progression', '/ressources', ...Object.keys(catalog.modules).map(id => `/modules/${id}`)]);

// Reconstituer chaque ligne depuis une liste fermée : pas de texte libre, URL,
// adresse IP, user-agent, réponse sélectionnée ou paramètres de navigation.
export function validateBatch(input) {
  if (!input || !UUID.test(input.sessionId) || !['mobile', 'tablet', 'desktop'].includes(input.device) || !Array.isArray(input.events) || input.events.length < 1 || input.events.length > 20) return null;
  const events = [];
  for (const e of input.events) {
    if (!e || !UUID.test(e.id) || !names.has(e.name)) return null;
    const row = { id: e.id, name: e.name, path: '', moduleId: '', sectionId: '', entityId: '', context: '', value: 0, total: 0, correct: 0 };
    if (e.name !== 'session_started') {
      if (!paths.has(e.path)) return null;
      row.path = e.path;
    }
    if (['module_started', 'module_completed', 'chapter_view', 'active_time', 'question_answered', 'activity_started', 'activity_completed'].includes(e.name)) {
      if (!Object.hasOwn(catalog.modules, e.moduleId)) return null;
      row.moduleId = e.moduleId;
    }
    if (['chapter_view', 'active_time'].includes(e.name)) {
      if (!catalog.modules[e.moduleId].includes(e.sectionId)) return null;
      row.sectionId = e.sectionId;
    }
    if (e.name === 'active_time') {
      if (!Number.isInteger(e.value) || e.value < 1 || e.value > 60) return null;
      row.value = e.value;
    }
    if (e.name === 'question_answered') {
      if (catalog.questions[e.entityId] !== e.moduleId || !['course', 'quiz'].includes(e.context) || typeof e.correct !== 'boolean') return null;
      row.entityId = e.entityId; row.context = e.context; row.correct = Number(e.correct);
    }
    if (['activity_started', 'activity_completed'].includes(e.name)) {
      if (activities[e.entityId] !== e.moduleId) return null;
      row.entityId = e.entityId;
      if (e.name === 'activity_completed') {
        if (typeof e.correct !== 'boolean') return null;
        row.correct = Number(e.correct);
      }
    }
    if (['quiz_started', 'quiz_completed'].includes(e.name)) {
      if (!UUID.test(e.entityId)) return null;
      row.entityId = e.entityId;
      if (e.name === 'quiz_completed') {
        if (e.total !== 10 || !Number.isInteger(e.value) || e.value < 0 || e.value > e.total) return null;
        row.value = e.value; row.total = e.total;
      }
    }
    if (e.name === 'resource_clicked') {
      if (!Object.hasOwn(catalog.resources, e.entityId)) return null;
      row.entityId = e.entityId;
    }
    if (e.name === 'technical_error') {
      if (!['runtime', 'resource'].includes(e.entityId)) return null;
      row.entityId = e.entityId;
    }
    events.push(row);
  }
  return { sessionId: input.sessionId, device: input.device, events };
}

export function json(value, status = 200) {
  return Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

export async function ingest({ request, env }) {
  if (!env.ANALYTICS_DB || !env.ANALYTICS_ADMIN_TOKEN) return json({ error: 'Collecte non configurée.' }, 503);
  if (request.headers.get('Origin') !== new URL(request.url).origin) return json({ error: 'Origine invalide.' }, 403);
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({ error: 'JSON attendu.' }, 415);
  let input;
  try {
    if (!request.body) return json({ error: 'Lot invalide.' }, 400);
    const reader = request.body.getReader();
    const chunks = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 16000) { await reader.cancel(); return json({ error: 'Lot trop volumineux.' }, 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const body = new TextDecoder().decode(bytes);
    input = validateBatch(JSON.parse(body));
  } catch { return json({ error: 'Lot invalide.' }, 400); }
  if (!input) return json({ error: 'Lot invalide.' }, 400);
  const now = new Date().toISOString();
  const cutoff = new Date(Date.now() - 90 * 86400000).toISOString();
  try {
    const insert = 'INSERT OR IGNORE INTO analytics_events (id, session_id, name, created_at, path, module_id, section_id, entity_id, context, device, value, total, correct) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await env.ANALYTICS_DB.batch([
      env.ANALYTICS_DB.prepare('DELETE FROM analytics_events WHERE id IN (SELECT id FROM analytics_events WHERE created_at < ? LIMIT 200)').bind(cutoff),
      ...input.events.map(e => env.ANALYTICS_DB.prepare(insert).bind(e.id, input.sessionId, e.name, now, e.path, e.moduleId, e.sectionId, e.entityId, e.context, input.device, e.value, e.total, e.correct)),
    ]);
    return json({ accepted: true });
  } catch { return json({ error: 'Collecte temporairement indisponible.' }, 503); }
}

export const reportQueries = {
  overview: `SELECT COUNT(DISTINCT session_id) AS sessions,
    SUM(name = 'page_view') AS page_views,
    COUNT(DISTINCT CASE WHEN name = 'module_started' THEN session_id END) AS engaged_sessions,
    SUM(name = 'technical_error') AS errors FROM analytics_events WHERE created_at >= ?`,
  daily: `SELECT substr(created_at, 1, 10) AS day, COUNT(DISTINCT session_id) AS sessions,
    SUM(name = 'page_view') AS page_views FROM analytics_events WHERE created_at >= ? GROUP BY day ORDER BY day`,
  pages: `SELECT path, COUNT(*) AS views, COUNT(DISTINCT session_id) AS sessions FROM analytics_events
    WHERE created_at >= ? AND name = 'page_view' GROUP BY path ORDER BY views DESC`,
  modules: `WITH starts AS (SELECT DISTINCT module_id, session_id FROM analytics_events WHERE created_at >= ? AND name = 'module_started'),
    completions AS (SELECT DISTINCT module_id, session_id FROM analytics_events WHERE created_at >= ? AND name = 'module_completed')
    SELECT s.module_id, COUNT(*) AS started, COUNT(c.session_id) AS completed FROM starts s
    LEFT JOIN completions c ON c.module_id = s.module_id AND c.session_id = s.session_id GROUP BY s.module_id`,
  chapters: `SELECT module_id, section_id, COUNT(DISTINCT CASE WHEN name = 'chapter_view' THEN session_id END) AS sessions,
    SUM(CASE WHEN name = 'active_time' THEN value ELSE 0 END) AS active_seconds FROM analytics_events
    WHERE created_at >= ? AND name IN ('chapter_view', 'active_time') GROUP BY module_id, section_id`,
  exits: `WITH ranked AS (SELECT module_id, section_id, session_id, ROW_NUMBER() OVER
    (PARTITION BY module_id, session_id ORDER BY created_at DESC, rowid DESC) AS position FROM analytics_events
    WHERE created_at >= ? AND name = 'chapter_view') SELECT r.module_id, r.section_id, COUNT(*) AS sessions FROM ranked r
    WHERE position = 1 AND NOT EXISTS (SELECT 1 FROM analytics_events e WHERE e.created_at >= ?
    AND e.name = 'module_completed' AND e.session_id = r.session_id AND e.module_id = r.module_id)
    GROUP BY r.module_id, r.section_id ORDER BY sessions DESC`,
  questions: `WITH ranked AS (SELECT entity_id, context, session_id, correct, ROW_NUMBER() OVER
    (PARTITION BY entity_id, context, session_id ORDER BY created_at, rowid) AS attempt FROM analytics_events
    WHERE created_at >= ? AND name = 'question_answered') SELECT entity_id, context, COUNT(*) AS attempts,
    SUM(attempt = 1) AS first_attempts, SUM(attempt = 1 AND correct = 1) AS first_correct FROM ranked GROUP BY entity_id, context`,
  activities: `SELECT entity_id, COUNT(DISTINCT CASE WHEN name = 'activity_started' THEN session_id END) AS started,
    COUNT(DISTINCT CASE WHEN name = 'activity_completed' THEN session_id END) AS completed FROM analytics_events
    WHERE created_at >= ? AND name IN ('activity_started', 'activity_completed') GROUP BY entity_id`,
  quiz: `SELECT COUNT(DISTINCT CASE WHEN name = 'quiz_started' THEN entity_id END) AS started,
    COUNT(DISTINCT CASE WHEN name = 'quiz_completed' THEN entity_id END) AS completed,
    AVG(CASE WHEN name = 'quiz_completed' THEN value * 100.0 / total END) AS average_score FROM analytics_events WHERE created_at >= ?`,
  scores: `SELECT value AS score, COUNT(*) AS runs FROM analytics_events WHERE created_at >= ? AND name = 'quiz_completed' GROUP BY value ORDER BY value`,
  resources: `SELECT entity_id, COUNT(*) AS clicks FROM analytics_events WHERE created_at >= ? AND name = 'resource_clicked' GROUP BY entity_id ORDER BY clicks DESC`,
  devices: `SELECT device, COUNT(DISTINCT session_id) AS sessions FROM analytics_events WHERE created_at >= ? GROUP BY device`,
};

async function authorized(request, token) {
  const supplied = request.headers.get('Authorization')?.replace(/^Bearer /, '') ?? '';
  if (!token || supplied.length > 256) return false;
  const hash = async v => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v)));
  const [a, b] = await Promise.all([hash(supplied), hash(token)]);
  return a.reduce((diff, byte, i) => diff | (byte ^ b[i]), 0) === 0;
}

export async function report({ request, env }) {
  if (!env.ANALYTICS_DB || !env.ANALYTICS_ADMIN_TOKEN) return json({ error: 'Les statistiques ne sont pas encore configurées.' }, 503);
  if (!await authorized(request, env.ANALYTICS_ADMIN_TOKEN)) return json({ error: 'Mot de passe incorrect.' }, 401);
  const days = Number(new URL(request.url).searchParams.get('days') ?? 30);
  if (![7, 30, 90].includes(days)) return json({ error: 'Période invalide.' }, 400);
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  try {
    const keys = Object.keys(reportQueries);
    const results = await env.ANALYTICS_DB.batch(keys.map(key => {
      const sql = reportQueries[key];
      return env.ANALYTICS_DB.prepare(sql).bind(...Array((sql.match(/\?/g) ?? []).length).fill(cutoff));
    }));
    return json({ days, generatedAt: new Date().toISOString(), ...Object.fromEntries(keys.map((key, i) => [key, results[i].results])) });
  } catch { return json({ error: 'Statistiques temporairement indisponibles.' }, 503); }
}
