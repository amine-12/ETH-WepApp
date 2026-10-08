import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { ingest, report, validateBatch } from '../server/analytics.js';
import { catalog } from '../server/catalog.js';
import { modules } from '../src/data/modules.ts';
import { questions } from '../src/data/questions.ts';
import { resources } from '../src/data/resources.ts';

const event = (name: string, data = {}) => ({ id: crypto.randomUUID(), name, path: '/modules/comprendre-ia', ...data });
const batch = (events: object[], sessionId = crypto.randomUUID()) => ({ sessionId, device: 'desktop', events });
function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../migrations/0001_analytics.sql', import.meta.url), 'utf8'));
  return {
    sqlite,
    binding: {
      prepare(sql: string) { return { bind(...args: any[]) { return { sql, args }; } }; },
      async batch(statements: { sql: string; args: any[] }[]) {
        sqlite.exec('BEGIN');
        try {
          const results = statements.map(({ sql, args }) => ({ results: sqlite.prepare(sql).all(...args) }));
          sqlite.exec('COMMIT'); return results;
        } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
      },
    },
  };
}
const post = (body: unknown, origin = 'https://example.com') => new Request('https://example.com/api/analytics', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('le catalogue de validation correspond aux contenus et aux questions actuels', () => {
  assert.deepEqual(catalog.modules, Object.fromEntries(modules.map(m => [m.id, m.sections.map(s => s.id).concat('summary')])));
  assert.deepEqual(catalog.questions, Object.fromEntries(questions.map(q => [q.id, q.moduleId])));
  assert.deepEqual(catalog.resources, Object.fromEntries(resources.map(r => [r.id, r.url])));
});

test('la collecte rejette les valeurs invalides et élimine les données non autorisées', () => {
  const valid = batch([event('question_answered', { moduleId: 'comprendre-ia', entityId: 'comprendre-ia_q1', context: 'course', correct: true, selectedAnswer: 'B', text: 'privé', ip: '1.2.3.4' })]);
  const result = validateBatch(valid)!;
  assert.equal(result.events[0].correct, 1);
  assert.equal(JSON.stringify(result).includes('privé'), false);
  assert.equal(JSON.stringify(result).includes('selectedAnswer'), false);
  for (const invalid of [batch([event('unknown')]), batch([event('page_view', { path: '/?email=private' })]), batch([event('active_time', { moduleId: 'comprendre-ia', sectionId: 'intro', value: 61 })]), batch([event('question_answered', { moduleId: 'environnement', entityId: 'comprendre-ia_q1', context: 'course', correct: true })]), batch(Array.from({ length: 21 }, () => event('page_view')))]) assert.equal(validateBatch(invalid), null);
});

test('API : origine, authentification, déduplication et expiration des données', async () => {
  const { sqlite, binding } = database();
  const env = { ANALYTICS_DB: binding, ANALYTICS_ADMIN_TOKEN: 'test-secret-long' };
  const events = batch([event('page_view')]);
  assert.equal((await ingest({ request: post(events, 'https://other.example'), env })).status, 403);
  assert.equal((await ingest({ request: post(events), env: {} })).status, 503);
  assert.equal((await ingest({ request: post({ text: 'a'.repeat(16001) }), env })).status, 413);
  assert.equal((await ingest({ request: post(events), env })).status, 200);
  assert.equal((await ingest({ request: post(events), env })).status, 200);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM analytics_events').get()!.n, 1);
  sqlite.prepare('UPDATE analytics_events SET created_at = ?').run(new Date(Date.now() - 91 * 86400000).toISOString());
  await ingest({ request: post(batch([event('page_view')])), env });
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM analytics_events').get()!.n, 1);
  for (const token of ['', 'wrong']) {
    const response = await report({ request: new Request('https://example.com/api/statistics', { headers: { Authorization: `Bearer ${token}` } }), env });
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(JSON.stringify(await response.json()).includes('sessions'), false);
  }
  sqlite.close();
});

test('rapports SQL : cohortes, premières réponses, dernières étapes et scores de quiz', async () => {
  const { sqlite, binding } = database();
  const env = { ANALYTICS_DB: binding, ANALYTICS_ADMIN_TOKEN: 'test-secret-long' };
  const moduleId = 'comprendre-ia';
  const quizId = crypto.randomUUID();
  await ingest({ request: post(batch([
    event('page_view'), event('module_started', { moduleId }), event('chapter_view', { moduleId, sectionId: 'intro' }),
    event('active_time', { moduleId, sectionId: 'intro', value: 30 }),
    event('question_answered', { moduleId, entityId: 'comprendre-ia_q1', context: 'course', correct: false }),
    event('question_answered', { moduleId, entityId: 'comprendre-ia_q1', context: 'course', correct: true }),
    event('question_answered', { moduleId, entityId: 'comprendre-ia_q1', context: 'quiz', correct: true }),
    event('module_completed', { moduleId }), event('quiz_started', { entityId: quizId }),
    event('quiz_completed', { entityId: quizId, value: 8, total: 10 }),
  ])), env });
  await ingest({ request: post(batch([
    event('module_started', { moduleId }), event('chapter_view', { moduleId, sectionId: 'intro' }),
    event('chapter_view', { moduleId, sectionId: 'pipeline' }),
  ])), env });
  const response = await report({ request: new Request('https://example.com/api/statistics?days=30', { headers: { Authorization: 'Bearer test-secret-long' } }), env });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.overview[0].sessions, 2);
  assert.deepEqual(data.modules[0], { module_id: moduleId, started: 2, completed: 1 });
  assert.deepEqual(data.exits[0], { module_id: moduleId, section_id: 'pipeline', sessions: 1 });
  const course = data.questions.find((q: any) => q.context === 'course');
  assert.equal(course.first_correct, 0); assert.equal(course.first_attempts, 1); assert.equal(course.attempts, 2);
  assert.equal(data.questions.find((q: any) => q.context === 'quiz').first_correct, 1);
  assert.equal(data.chapters.find((c: any) => c.section_id === 'intro').active_seconds, 30);
  assert.equal(data.quiz[0].average_score, 80);
  sqlite.close();
});
