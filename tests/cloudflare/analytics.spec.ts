import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { finalQuizIds, questions } from '../../src/data/questions';

test('Cloudflare local : collecte réelle D1, quiz complet et tableau de bord protégé', async ({ page, request }) => {
  const secret = readFileSync('.dev.vars', 'utf8').match(/^ANALYTICS_ADMIN_TOKEN=(.+)$/m)?.[1].trim().replace(/^['"]|['"]$/g, '');
  expect(secret).toBeTruthy();
  const headers = { Authorization: `Bearer ${secret}` };
  const before = await (await request.get('/api/statistics?days=30', { headers })).json();
  const initial = before.modules.find((m: any) => m.module_id === 'comprendre-ia')?.started ?? 0;
  const initialQuizzes = before.quiz[0].completed;
  expect((await request.get('/api/statistics')).status()).toBe(401);
  expect((await request.post('/api/analytics', { headers: { Origin: 'https://other.example' }, data: {} })).status()).toBe(403);
  await page.clock.install();
  await page.goto('/modules/comprendre-ia');
  await page.getByRole('button', { name: 'Accepter les statistiques', exact: true }).click();
  await page.getByRole('button', { name: 'Apprentissage et utilisation' }).click();
  await page.getByRole('radio').nth(1).check();
  await page.getByRole('button', { name: 'Valider ma réponse' }).first().click();
  await page.clock.runFor(16000);
  await expect.poll(async () => {
    const report = await (await request.get('/api/statistics?days=30', { headers })).json();
    return report.modules.find((m: any) => m.module_id === 'comprendre-ia')?.started ?? 0;
  }).toBe(initial + 1);
  await page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'Quiz', exact: true }).click();
  await page.getByRole('button', { name: 'Commencer le quiz', exact: true }).click();
  for (let i = 0; i < finalQuizIds.length; i++) {
    const q = questions.find(q => q.id === finalQuizIds[i])!;
    await page.getByRole('radio').nth(q.options.findIndex(o => o.id === q.correctAnswer)).check();
    await page.getByRole('button', { name: 'Valider ma réponse' }).click();
    await page.getByRole('button', { name: i === 9 ? 'Voir mon résultat' : 'Question suivante' }).click();
  }
  await page.clock.runFor(16000);
  await expect.poll(async () => (await (await request.get('/api/statistics?days=30', { headers })).json()).quiz[0].completed).toBe(initialQuizzes + 1);
  await page.goto('/statistiques');
  await page.getByLabel('Mot de passe administrateur').fill(secret!);
  await page.getByRole('button', { name: 'Consulter les statistiques' }).click();
  await expect(page.getByRole('heading', { name: 'Distribution des résultats du quiz' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '10 / 10', exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/statistics-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/statistics-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Se déconnecter' }).click();
  await expect(page.getByRole('heading', { name: 'Accès administrateur' })).toBeVisible();
});
