import { expect, test } from '@playwright/test';

test('statistiques facultatives : aucun envoi sans accord, puis événements et retrait du choix', async ({ page }) => {
  const received: any[] = [];
  let configRequests = 0;
  await page.route('**/api/analytics', async route => {
    if (route.request().method() === 'GET') { configRequests++; await route.fulfill({ json: { enabled: true } }); }
    else { received.push(route.request().postDataJSON()); await route.fulfill({ json: { accepted: true } }); }
  });
  await page.clock.install();
  await page.goto('/modules/comprendre-ia');
  await page.clock.runFor(16000);
  expect(configRequests).toBe(0); expect(received).toHaveLength(0);
  await page.getByRole('button', { name: 'Accepter les statistiques', exact: true }).click();
  await expect(page.getByRole('button', { name: /Statistiques facultatives : acceptées/ })).toBeVisible();
  await expect.poll(() => configRequests).toBe(1);
  await page.getByRole('button', { name: 'Apprentissage et utilisation' }).click();
  await page.getByRole('radio').nth(1).check();
  await page.getByRole('button', { name: 'Valider ma réponse' }).first().click();
  await page.clock.runFor(16000);
  await expect.poll(() => received.length).toBeGreaterThan(0);
  const events = received.flatMap(batch => batch.events);
  expect(events.filter(e => e.name === 'module_started')).toHaveLength(1);
  expect(events.find(e => e.name === 'question_answered')).toMatchObject({ moduleId: 'comprendre-ia', entityId: 'comprendre-ia_q1', context: 'course', correct: true });
  expect(JSON.stringify(received)).not.toContain('selectedAnswer');
  expect(JSON.stringify(received)).not.toContain('userAgent');
  const sessionId = received[0].sessionId;
  await page.reload();
  await expect.poll(() => configRequests).toBe(2);
  await page.clock.runFor(16000);
  expect(received.every(batch => batch.sessionId === sessionId)).toBe(true);
  expect(received.flatMap(batch => batch.events).filter(e => e.name === 'module_started')).toHaveLength(1);
  await page.getByRole('button', { name: /Modifier mon choix/ }).click();
  await page.getByRole('button', { name: 'Refuser', exact: true }).click();
  const previous = received.length;
  await page.getByRole('button', { name: 'Continuer', exact: true }).click();
  await page.clock.runFor(32000);
  expect(received).toHaveLength(previous);
  expect(await page.evaluate(() => sessionStorage.getItem('ia-ethique.analytics.session'))).toBeNull();
});

test('temps actif : exclure les périodes masquées et les longues périodes sans interaction', async ({ page }) => {
  const received: any[] = [];
  await page.route('**/api/analytics', async route => {
    if (route.request().method() === 'GET') await route.fulfill({ json: { enabled: true } });
    else { received.push(route.request().postDataJSON()); await route.fulfill({ json: { accepted: true } }); }
  });
  await page.addInitScript(() => localStorage.setItem('ia-ethique.analytics.choice', 'accepted'));
  await page.clock.install();
  await page.goto('/modules/comprendre-ia');
  await page.clock.runFor(95000);
  const active = () => received.flatMap(batch => batch.events).filter(e => e.name === 'active_time').reduce((n, e) => n + e.value, 0);
  await expect.poll(active).toBeGreaterThan(0);
  expect(active()).toBeLessThanOrEqual(61);
  const previous = active();
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.clock.runFor(60000);
  expect(active()).toBe(previous);
});

test('administration : connexion, tableau agrégé, affichage mobile et déconnexion', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('ia-ethique.analytics.choice', 'declined'));
  await page.route('**/api/statistics?*', async route => {
    if (route.request().headers().authorization !== 'Bearer test-password') return route.fulfill({ status: 401, json: { error: 'Mot de passe incorrect.' } });
    await route.fulfill({ json: {
      days: 30, generatedAt: new Date().toISOString(), overview: [{ sessions: 10, page_views: 30, engaged_sessions: 5, errors: 0 }],
      daily: [{ day: '2026-10-07', sessions: 10, page_views: 30 }], pages: [{ path: '/', views: 10, sessions: 10 }],
      modules: [{ module_id: 'comprendre-ia', started: 5, completed: 2 }], chapters: [], exits: [], questions: [], activities: [],
      quiz: [{ started: 3, completed: 2, average_score: 80 }], scores: [], resources: [], devices: [{ device: 'mobile', sessions: 10 }],
    } });
  });
  await page.goto('/statistiques');
  await page.getByLabel('Mot de passe administrateur').fill('incorrect');
  await page.getByRole('button', { name: 'Consulter les statistiques' }).click();
  await expect(page.getByRole('alert')).toHaveText('Mot de passe incorrect.');
  await page.getByLabel('Mot de passe administrateur').fill('test-password');
  await page.getByRole('button', { name: 'Consulter les statistiques' }).click();
  await expect(page.getByRole('heading', { name: 'Modules commencés et terminés' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '40 %', exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain('test-password');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Se déconnecter' }).click();
  await expect(page.getByLabel('Mot de passe administrateur')).toHaveValue('');
  await expect(page.getByRole('heading', { name: 'Accès administrateur' })).toBeVisible();
});

test('popup : premier accès, clavier, refus mémorisé et réouverture sur mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const popup = page.getByRole('dialog', { name: 'Nous aider à améliorer le parcours' });
  await expect(popup).toBeVisible();
  await expect(page.getByRole('button', { name: 'Refuser', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Accepter les statistiques', exact: true })).toBeFocused();
  expect(await popup.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(popup).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.reload();
  await expect(popup).toHaveCount(0);
  await page.getByRole('button', { name: /Modifier mon choix/ }).click();
  await expect(popup).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /Modifier mon choix/ })).toBeFocused();
});

test('une réponse après 30 minutes d’inactivité démarre une nouvelle session et son module', async ({ page }) => {
  const received: any[] = [];
  await page.route('**/api/analytics', async route => {
    if (route.request().method() === 'GET') await route.fulfill({ json: { enabled: true } });
    else { received.push(route.request().postDataJSON()); await route.fulfill({ json: { accepted: true } }); }
  });
  await page.addInitScript(() => localStorage.setItem('ia-ethique.analytics.choice', 'accepted'));
  await page.clock.install();
  await page.goto('/modules/comprendre-ia');
  await page.getByRole('button', { name: 'Apprentissage et utilisation' }).click();
  await page.clock.runFor(16000);
  await expect.poll(() => received.length).toBeGreaterThan(0);
  const firstSession = received[0].sessionId;
  await page.clock.fastForward(31 * 60 * 1000);
  await page.getByRole('radio').nth(1).check();
  await page.getByRole('button', { name: 'Valider ma réponse' }).first().click();
  await page.clock.runFor(16000);
  await expect.poll(() => received.filter(batch => batch.sessionId !== firstSession).length).toBeGreaterThan(0);
  const next = received.filter(batch => batch.sessionId !== firstSession).flatMap(batch => batch.events);
  expect(next.map(e => e.name)).toEqual(expect.arrayContaining(['session_started', 'module_started', 'chapter_view', 'question_answered']));
});
