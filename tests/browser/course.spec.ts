import { expect, test } from '@playwright/test';
import { modules } from '../../src/data/modules';
import { finalQuizIds, questions } from '../../src/data/questions';
import { educationalReadings, resources } from '../../src/data/resources';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('ia-ethique.analytics.choice', 'declined'));
});

test('toutes les routes et les chapitres fonctionnent sans erreur console', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  for (const route of ['/', '/modules', '/quiz', '/progression', '/ressources', ...modules.map(m => `/modules/${m.id}`)]) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    if (route.startsWith('/modules/')) {
      const m = modules.find(m => route.endsWith(m.id))!;
      for (const section of m.sections) {
        await page.getByRole('button', { name: section.title, exact: false }).first().click();
        await expect(page.getByRole('heading', { level: 2, name: section.title, exact: true })).toBeVisible();
      }
    }
  }
  expect(errors).toEqual([]);
  await page.goto('/inexistant');
  await expect(page.getByRole('heading', { name: 'Cette page n’existe pas.' })).toBeVisible();
});

test('réponse, chapitre et module persistent après rafraîchissement', async ({ page }) => {
  await page.goto('/modules/comprendre-ia');
  await page.getByRole('button', { name: 'Apprentissage et utilisation' }).click();
  await page.getByRole('radio').nth(1).check();
  await page.getByRole('button', { name: 'Valider ma réponse' }).first().click();
  await expect(page.getByText('Bonne réponse', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Bonne réponse', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Apprentissage et utilisation : deux moments distincts' })).toBeVisible();
  await page.getByRole('button', { name: 'Continuer', exact: true }).click();
  await page.getByRole('button', { name: 'Marquer le module comme terminé' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Module terminé' })).toBeVisible();
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('eth610.progress.v1')!));
  expect(progress.completedModules).toEqual(['comprendre-ia']);
  expect(progress.answers['comprendre-ia_q1'].attempts).toBe(1);
});

test('les jeux fournissent une rétroaction et calculent leurs résultats', async ({ page }) => {
  await page.goto('/modules/hallucinations');
  await page.getByRole('button', { name: 'Mini-jeu : trouvez l’hallucination' }).click();
  await page.getByRole('button', { name: /01 Une hallucination/ }).click();
  await expect(page.getByText('Cherchez encore', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Afficher un indice' }).click();
  await page.getByRole('button', { name: /02 En 2024/ }).click();
  await expect(page.getByText('Hallucination démasquée', { exact: true })).toBeVisible();
  await page.goto('/modules/environnement');
  await page.getByRole('button', { name: 'Concevez une IA performante et responsable' }).click();
  await page.getByRole('button', { name: /Modèle dédié et frugal/ }).click();
  await page.getByRole('button', { name: /Région nordique et hydroélectricité/ }).click();
  await page.getByRole('button', { name: /Serveurs mutualisés et reconditionnés/ }).click();
  await expect(page.getByText('Mission accomplie', { exact: true })).toBeVisible();
  await expect(page.getByText('70 %', { exact: true })).toBeVisible();
  await expect(page.locator('.gauges').getByText('60 %', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Rejouer' }).click();
  await page.getByRole('button', { name: /Modèle de fondation massif/ }).click();
  await page.getByRole('button', { name: /Région chaude et énergie fossile/ }).click();
  await page.getByRole('button', { name: /Nouveaux accélérateurs IA/ }).click();
  await expect(page.getByText('Dépassement des limites de ressources', { exact: true })).toBeVisible();
  await page.goto('/modules/vie-privee');
  await page.getByRole('button', { name: 'Est-ce une information à partager ?' }).click();
  for (const [i, safe] of [false, false, true, false, false, true].entries()) {
    await page.getByRole('button', { name: safe ? 'Généralement acceptable' : 'À éviter', exact: true }).click();
    await page.getByRole('button', { name: i === 5 ? 'Voir le bilan' : 'Information suivante' }).click();
  }
  await expect(page.getByText('Classement terminé : 6 / 6')).toBeVisible();
});

test('le quiz final tient compte uniquement des réponses de la tentative en cours', async ({ page }) => {
  await page.goto('/quiz');
  await page.getByRole('button', { name: 'Commencer le quiz', exact: true }).click();
  for (let i = 0; i < finalQuizIds.length; i++) {
    const q = questions.find(q => q.id === finalQuizIds[i])!;
    await page.getByRole('radio').nth(q.options.findIndex(o => o.id === q.correctAnswer)).check();
    await page.getByRole('button', { name: 'Valider ma réponse' }).click();
    await page.getByRole('button', { name: i === 9 ? 'Voir mon résultat' : 'Question suivante' }).click();
  }
  await expect(page.locator('.score-display')).toHaveText('10/ 10');
  await page.getByRole('button', { name: 'Recommencer', exact: true }).click();
  await expect(page.getByRole('radio').first()).not.toBeChecked();
  await expect(page.getByRole('button', { name: 'Question suivante' })).toBeDisabled();
});

test('mobile : menu, parcours et absence de débordement', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('navigation')).not.toBeVisible();
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Modules', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Les modules' })).toBeVisible();
  await expect(page.getByRole('navigation')).not.toBeVisible();
  for (const route of ['/', '/modules', '/progression', '/quiz', '/ressources', ...modules.map(m => `/modules/${m.id}`)]) {
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (route.startsWith('/modules/')) {
      const m = modules.find(m => route.endsWith(m.id))!;
      for (const section of m.sections) {
        await page.getByRole('button', { name: section.title, exact: false }).first().click();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      }
    }
  }
});

test('stockage indisponible : le parcours reste utilisable', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error('disabled'); }; Storage.prototype.setItem = () => { throw new Error('disabled'); }; });
  await page.goto('/modules/comprendre-ia');
  await expect(page.getByText(/Le stockage est indisponible/)).toBeVisible();
  await page.getByRole('button', { name: 'Refuser', exact: true }).click();
  await page.getByRole('button', { name: 'Continuer', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Comment une réponse est-elle produite ?' })).toBeVisible();
});

test('clavier, texte agrandi et captures de contrôle', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Aller au contenu' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
  await page.locator('#main-content').blur();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true, animations: 'disabled' });
  await page.goto('/modules/environnement');
  await page.getByRole('button', { name: 'Concevez une IA performante et responsable' }).click();
  await page.screenshot({ path: 'test-results/module-mobile.png', fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const route of ['/', '/modules', '/progression', '/quiz', '/ressources', '/modules/environnement']) {
    await page.goto(route);
    await page.evaluate(() => document.documentElement.style.fontSize = '32px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test('ressources : onglet, liens externes, lectures sourcées et navigation mobile', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'Ressources', exact: true }).click();
  await expect(page).toHaveURL(/\/ressources$/);
  await expect(page).toHaveTitle('Ressources · IA & Éthique');
  await expect(page.locator('.resource-card')).toHaveCount(resources.length);
  for (const resource of resources) {
    const card = page.locator('.resource-card').filter({ has: page.getByRole('heading', { name: resource.title, exact: true }) });
    await expect(card).toHaveAttribute('href', resource.url);
    await expect(card).toHaveAttribute('target', '_blank');
    await expect(card).toHaveAttribute('rel', 'noopener noreferrer');
  }
  await page.getByRole('link', { name: 'Textes éducatifs', exact: true }).click();
  await expect(page).toHaveURL(/#textes-educatifs$/);
  await expect(page.locator('.resource-reading')).toHaveCount(educationalReadings.length);
  for (const reading of educationalReadings) {
    const article = page.getByRole('article', { name: reading.title, exact: true });
    await expect(article.locator(':scope > p')).toHaveCount(reading.paragraphs.length);
    await expect(article.locator('.sources a')).toHaveCount(reading.sourceIds.length);
  }
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Ressources' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
  await page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'Ressources', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).not.toBeVisible();
  await page.getByRole('navigation', { name: 'Choisir un texte éducatif' }).getByRole('link', { name: /L’empreinte de l’IA/ }).click();
  await expect(page).toHaveURL(/#lecture-empreinte$/);
});
