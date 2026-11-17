import { expect, test, type Page } from '@playwright/test';
import { emptyProgress } from '../../src/services/progressService';

const progressKey = 'eth610.progress.v1';
const choiceKey = 'ia-ethique.analytics.choice';
const sessionKey = 'ia-ethique.analytics.session';
const seededProgress = {
  ...emptyProgress(), completedModules: ['comprendre-ia'], moduleProgress: { 'comprendre-ia': 2 }, lastModule: 'comprendre-ia',
  answers: { 'comprendre-ia_q1': { selectedAnswer: 'B', isCorrect: true, answeredAt: '2026-11-01T12:00:00Z', attempts: 3 } },
  games: { hallucination: { isSuccessful: true, completedAt: '2026-11-01T12:00:00Z' } },
  quizResult: { score: 8, total: 10, completedAt: '2026-11-01T12:00:00Z' },
};
const readProgress = (page: Page) => page.evaluate(key => JSON.parse(localStorage.getItem(key)!), progressKey);
async function confirmReset(page: Page) {
  await page.getByRole('button', { name: 'Réinitialiser ma progression', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Réinitialiser', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Votre progression a été réinitialisée' })).toBeVisible();
}
async function answerCourseQuestion(page: Page) {
  await page.getByRole('button', { name: 'Apprentissage et utilisation' }).click();
  await page.getByRole('radio').nth(1).check();
  await page.getByRole('button', { name: 'Valider ma réponse' }).first().click();
}

// Seed only once so reload verifies persisted changes rather than restoring the fixture.
async function seed(page: Page, choice: 'accepted' | 'declined' | null = 'declined') {
  await page.addInitScript(({ progress, choice }) => {
    if (localStorage.getItem('reset-test-seeded')) return;
    localStorage.setItem('reset-test-seeded', 'yes');
    localStorage.setItem('eth610.progress.v1', JSON.stringify(progress));
    localStorage.setItem('unrelated-data', 'keep');
    sessionStorage.setItem('ia-ethique.analytics.session', JSON.stringify({
      id: '11111111-1111-4111-8111-111111111111', last: Date.now(), seen: ['module_started:comprendre-ia:'], device: 'desktop',
    }));
    if (choice) localStorage.setItem('ia-ethique.analytics.choice', choice);
  }, { progress: seededProgress, choice });
}

test('annuler ou fermer au clavier conserve la progression et la session', async ({ page }) => {
  await seed(page);
  await page.goto('/progression');
  const button = page.getByRole('button', { name: 'Réinitialiser ma progression', exact: true });
  const session = await page.evaluate(key => sessionStorage.getItem(key), sessionKey);
  await button.click();
  const dialog = page.getByRole('dialog', { name: 'Réinitialiser votre progression ?' });
  await expect(dialog.getByRole('button', { name: 'Annuler' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Réinitialiser', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Annuler' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(button).toBeFocused();
  await button.click();
  await dialog.getByRole('button', { name: 'Annuler' }).click();
  expect(await readProgress(page)).toEqual(seededProgress);
  expect(await page.evaluate(key => sessionStorage.getItem(key), sessionKey)).toBe(session);
});

test('réinitialisation complète persistante, nouveau parcours et affichage mobile', async ({ page }) => {
  await seed(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/progression');
  await page.getByRole('button', { name: 'Réinitialiser ma progression', exact: true }).click();
  const dialog = page.getByRole('dialog');
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/reset-dialog-mobile.png', fullPage: true });
  await dialog.getByRole('button', { name: 'Réinitialiser', exact: true }).click();
  await expect.poll(() => readProgress(page)).toEqual(emptyProgress());
  await expect(page.getByRole('link', { name: 'Commencer mon parcours' })).toBeVisible();
  await expect(page.locator('.overall-progress h2')).toHaveText('0 / 6');
  await expect(page.locator('.stat').last().getByRole('link')).toHaveText('Passer le quiz');
  expect(await page.evaluate(key => localStorage.getItem(key), choiceKey)).toBe('declined');
  expect(await page.evaluate(() => localStorage.getItem('unrelated-data'))).toBe('keep');
  expect(await page.evaluate(key => sessionStorage.getItem(key), sessionKey)).toBeNull();
  await page.reload();
  expect(await readProgress(page)).toEqual(emptyProgress());
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: 'test-results/reset-progress-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'Commencer mon parcours' }).click();
  await answerCourseQuestion(page);
  await expect.poll(async () => (await readProgress(page)).answers['comprendre-ia_q1']?.attempts).toBe(1);
});

test('stockage indisponible : effacer en mémoire et signaler que le reset ne peut être enregistré', async ({ page }) => {
  await seed(page);
  await page.goto('/progression');
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); }; });
  await confirmReset(page);
  await expect(page.getByRole('status').filter({ hasText: 'la réinitialisation n’a pas pu être enregistrée' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Commencer mon parcours' })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Le stockage est indisponible' })).toBeVisible();
});

for (const choice of ['declined', null, 'accepted'] as const) {
  test(`aucune collecte après reset sans consentement ou service disponible : ${choice}`, async ({ page }) => {
    let posts = 0;
    await page.route('**/api/analytics', async route => {
      if (route.request().method() === 'POST') posts++;
      await route.fulfill({ status: 503, json: { error: 'Unavailable' } });
    });
    await seed(page, choice);
    await page.clock.install();
    await page.goto('/progression');
    if (choice === null) await page.keyboard.press('Escape');
    if (choice === 'accepted') await expect(page.getByText('La collecte est indisponible pour le moment.', { exact: false })).toBeVisible();
    // Escape on the initial consent popup stores the existing default refusal.
    const savedChoice = await page.evaluate(key => localStorage.getItem(key), choiceKey);
    await confirmReset(page);
    await page.clock.runFor(32000);
    expect(posts).toBe(0);
    expect(await readProgress(page)).toEqual(emptyProgress());
    expect(await page.evaluate(key => sessionStorage.getItem(key), sessionKey)).toBeNull();
    expect(await page.evaluate(key => localStorage.getItem(key), choiceKey)).toBe(savedChoice);
    if (choice === 'accepted') {
      const batches: any[] = [];
      await page.unroute('**/api/analytics');
      await page.route('**/api/analytics', async route => {
        if (route.request().method() === 'POST') batches.push(route.request().postDataJSON());
        await route.fulfill({ json: route.request().method() === 'GET' ? { enabled: true } : { accepted: true } });
      });
      await page.evaluate(() => window.dispatchEvent(new Event('online')));
      await expect(page.getByText('La collecte des statistiques est active.', { exact: true })).toBeVisible();
      await page.clock.runFor(16000);
      await expect.poll(() => batches.length).toBeGreaterThan(0);
      expect(batches[0].sessionId).not.toBe('11111111-1111-4111-8111-111111111111');
      expect(batches.flatMap(b => b.events).some(e => e.name === 'session_started')).toBe(true);
    }
  });
}

test('nouvelle session : consentement conservé, modules et activités comptés à nouveau', async ({ page }) => {
  const batches: any[] = [];
  await page.route('**/api/analytics', async route => {
    if (route.request().method() === 'POST') batches.push(route.request().postDataJSON());
    await route.fulfill({ json: route.request().method() === 'GET' ? { enabled: true } : { accepted: true } });
  });
  await page.addInitScript(() => localStorage.setItem('ia-ethique.analytics.choice', 'accepted'));
  await page.clock.install();
  for (let run = 0; run < 2; run++) {
    await page.goto('/modules/hallucinations');
    await expect(page.getByText('La collecte des statistiques est active.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Mini-jeu : trouvez l’hallucination' }).click();
    await page.getByRole('button', { name: /02 En 2024/ }).click();
    await page.getByRole('button', { name: 'Ce qu’il faut retenir' }).click();
    await page.getByRole('button', { name: 'Marquer le module comme terminé' }).click();
    await page.clock.runFor(16000);
    if (!run) {
      await page.getByRole('navigation').getByRole('link', { name: 'Ma progression' }).click();
      await confirmReset(page);
    }
  }
  await expect.poll(() => batches.flatMap(b => b.events).filter(e => e.name === 'module_completed').length).toBe(2);
  for (const name of ['module_started', 'module_completed', 'activity_started', 'activity_completed']) {
    const sessions = batches.filter(b => b.events.some((e: any) => e.name === name)).map(b => b.sessionId);
    expect(new Set(sessions).size).toBe(2);
  }
  expect(await page.evaluate(key => localStorage.getItem(key), choiceKey)).toBe('accepted');
});

for (const retry of [false, true]) {
  test(`reset pendant un envoi : conserver les anciennes sessions et les événements en attente, retry=${retry}`, async ({ page }) => {
    const received: any[] = [];
    let firstBatch: any;
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    await page.route('**/api/analytics', async route => {
      if (route.request().method() === 'GET') return route.fulfill({ json: { enabled: true } });
      const batch = route.request().postDataJSON();
      if (!firstBatch) {
        firstBatch = batch;
        await gate;
        if (retry) return route.fulfill({ status: 503, json: { error: 'Retry' } });
      }
      received.push(batch);
      await route.fulfill({ json: { accepted: true } });
    });
    await page.addInitScript(() => localStorage.setItem('ia-ethique.analytics.choice', 'accepted'));
    await page.clock.install();
    await page.goto('/modules/comprendre-ia');
    await expect(page.getByText('La collecte des statistiques est active.', { exact: true })).toBeVisible();
    await answerCourseQuestion(page);
    await expect.poll(() => firstBatch).toBeTruthy();
    await page.getByRole('navigation').getByRole('link', { name: 'Ma progression' }).click();
    await confirmReset(page);
    const nextSession = await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)!).id, sessionKey);
    expect(nextSession).not.toBe(firstBatch.sessionId);
    release();
    await expect.poll(() => received.some(b => b.sessionId === nextSession)).toBe(true);
    expect(firstBatch.events.every((e: any) => received.some(b => b.sessionId === firstBatch.sessionId && b.events.some((sent: any) => sent.id === e.id)))).toBe(true);
    expect(received.some(b => b.sessionId === firstBatch.sessionId && b.events.some((e: any) => e.name === 'page_view' && e.path === '/progression'))).toBe(true);
    expect(received.some(b => b.sessionId === nextSession && b.events.some((e: any) => e.name === 'session_started'))).toBe(true);
    await page.getByRole('link', { name: 'Commencer mon parcours' }).click();
    await answerCourseQuestion(page);
    await expect.poll(() => received.filter(b => b.sessionId === nextSession).flatMap(b => b.events).filter(e => e.name === 'question_answered').length).toBe(1);
  });
}
