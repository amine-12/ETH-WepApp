import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateEcoResult } from '../src/data/games.ts';
import { modules } from '../src/data/modules.ts';
import { finalQuizIds, questions } from '../src/data/questions.ts';
import { emptyProgress, parseProgress, progressService } from '../src/services/progressService.ts';

test('les huit parcours écologiques respectent les seuils et les coûts', () => {
  for (let mask = 0; mask < 8; mask++) {
    const choices = [mask & 1, (mask >> 1) & 1, (mask >> 2) & 1];
    const result = calculateEcoResult(choices);
    const expectedPerformance = [55, 25, 25].reduce((s, n, i) => s + (choices[i] ? [35, 20, 15][i] : n), 0);
    const expectedBudget = 100 - [40, 35, 35].reduce((s, n, i) => s + (choices[i] ? [15, 15, 10][i] : n), 0);
    assert.equal(result.performance, expectedPerformance);
    assert.equal(result.ecologicalBudget, expectedBudget);
    assert.equal(result.isSuccessful, expectedPerformance >= 70 && expectedBudget > 0);
  }
  assert.deepEqual(calculateEcoResult([1, 1, 1]), { performance: 70, ecologicalBudget: 60, isSuccessful: true });
  assert.equal(calculateEcoResult([0, 0, 0]).isSuccessful, false);
  assert.throws(() => calculateEcoResult([0, 1]));
  assert.throws(() => calculateEcoResult([0, 1, 2]));
});

test('les identifiants de modules et de questions sont uniques et cohérents', () => {
  assert.equal(modules.length, 6);
  assert.equal(new Set(modules.map(m => m.id)).size, modules.length);
  assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
  for (const m of modules) {
    for (const id of m.sections.flatMap(s => s.questionIds ?? [])) assert.equal(questions.find(q => q.id === id)?.moduleId, m.id);
  }
  for (const q of questions) assert.ok(q.options.some(o => o.id === q.correctAnswer));
  assert.equal(finalQuizIds.length, 10);
  assert.equal(new Set(finalQuizIds.map(id => questions.find(q => q.id === id)?.moduleId)).size, 6);
});

test('la progression tolère un stockage absent ou corrompu', () => {
  for (const raw of [null, 'invalid', '{}', 'null', '{"version":9}']) assert.deepEqual(parseProgress(raw), emptyProgress());
  const p = emptyProgress(); p.moduleProgress['test'] = 2;
  assert.deepEqual(parseProgress(JSON.stringify(p)), p);
});

test('les tentatives sont évaluées, les choix invalides refusés et la complétion dédupliquée', () => {
  const q = questions[0];
  let p = progressService.saveAnswer(emptyProgress(), q, q.correctAnswer);
  assert.equal(p.answers[q.id].isCorrect, true);
  p = progressService.saveAnswer(p, q, 'A');
  assert.equal(p.answers[q.id].isCorrect, false);
  assert.equal(p.answers[q.id].attempts, 2);
  assert.throws(() => progressService.saveAnswer(p, q, 'INVALID'));
  p = progressService.completeModule(progressService.completeModule(p, q.moduleId), q.moduleId);
  assert.deepEqual(p.completedModules, [q.moduleId]);
});
