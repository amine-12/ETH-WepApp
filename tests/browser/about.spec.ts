import { expect, test, type Locator, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('ia-ethique.analytics.choice', 'declined'));
});

async function expectAnchor(page: Page, heading: Locator) {
  await expect(heading).toBeFocused();
  await expect.poll(async () => {
    const top = (await heading.boundingBox())!.y;
    const header = (await page.locator('.site-header').boundingBox())!;
    return top >= header.y + header.height && top < page.viewportSize()!.height;
  }).toBe(true);
}

test('à propos : onglet actif, déclaration et retour à l’accueil', async ({ page }) => {
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Navigation principale' });
  await navigation.getByRole('link', { name: 'À propos', exact: true }).click();
  await expect(page).toHaveURL('/a-propos');
  await expect(page).toHaveTitle('À propos · IA & Éthique');
  await expect(navigation.getByRole('link', { name: 'À propos', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('table', { name: 'Utilisation de l’IA pour l’interface du site' })).toBeVisible();
  const declaration = page.getByRole('contentinfo').getByRole('link', { name: 'Déclaration de l’utilisation de l’IA' });
  await expect(declaration).toHaveAttribute('href', '/a-propos#declaration-utilisation-ia');
  await declaration.click();
  await expectAnchor(page, page.getByRole('heading', { name: 'Déclaration de l’utilisation de l’IA' }));
  await navigation.getByRole('link', { name: 'Accueil', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('#main-content')).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test('les liens permanents atteignent la section depuis une autre page et au clavier', async ({ page }) => {
  await page.goto('/ressources');
  const footerLink = page.getByRole('contentinfo').getByRole('link', { name: 'Déclaration de l’utilisation de l’IA' });
  await footerLink.click();
  await expect(page).toHaveURL('/a-propos#declaration-utilisation-ia');
  await expectAnchor(page, page.locator('#declaration-utilisation-ia'));
  // Suivre à nouveau la même URL depuis le bas de page doit aussi atteindre le titre.
  await footerLink.click();
  await expectAnchor(page, page.locator('#declaration-utilisation-ia'));
  const project = page.getByRole('heading', { name: 'Le projet', exact: true });
  await project.getByRole('link').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/a-propos#le-projet');
  await expectAnchor(page, project);
  await page.goBack();
  await expect(page).toHaveURL('/a-propos#declaration-utilisation-ia');
  await expectAnchor(page, page.locator('#declaration-utilisation-ia'));
});

test('liens directs, rafraîchissement, menu mobile et texte agrandi', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const id of ['le-projet', 'declaration-utilisation-ia']) {
    await page.goto(`/a-propos#${id}`);
    await expectAnchor(page, page.locator(`#${id}`));
    await page.reload();
    await expectAnchor(page, page.locator(`#${id}`));
  }
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
  const navigation = page.getByRole('navigation', { name: 'Navigation principale' });
  await navigation.getByRole('link', { name: 'À propos', exact: true }).click();
  await expect(page).toHaveURL('/a-propos');
  await expect(navigation).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Ouvrir le menu' })).toHaveAttribute('aria-expanded', 'false');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.screenshot({ path: 'test-results/about-mobile.png', fullPage: true, animations: 'disabled' });
  await page.evaluate(() => { document.documentElement.style.fontSize = '32px'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('contentinfo').getByRole('link', { name: 'Déclaration de l’utilisation de l’IA' }).click();
  await expectAnchor(page, page.locator('#declaration-utilisation-ia'));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
  await page.goto('/a-propos');
  await expect(page.getByRole('heading', { level: 1, name: 'À propos' })).toBeVisible();
  await page.screenshot({ path: 'test-results/about-desktop.png', fullPage: true, animations: 'disabled' });
});
