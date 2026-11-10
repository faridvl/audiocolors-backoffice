import { existsSync, mkdirSync } from 'node:fs';
import { expect, Page, test } from '@playwright/test';

// Solo lectura: corre contra el API remoto de desarrollo, así que toda escritura se aborta.
const SESSION_FILE = 'e2e/.auth/session.json';
const SCREENSHOT_DIR = process.env.E2E_SCREENSHOT_DIR ?? 'test-results/mi-perfil';
const PROFILE_ROUTE = '/perfil';
const HTTP_ERROR_MIN = 400;
const VIEWPORT_HEIGHT = 900;
const SETTLE_MS = 400;
const PIXEL_TOLERANCE = 1;
const REM_PX = 16;
const MAX_FIELD_REM = 16;
const READ_ONLY_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const LICENSE_TEST_VALUE = '98765';
const LICENSE_PREFIX = 'Cód.';

const WIDTH_MOBILE = 390;
const WIDTH_TABLET = 768;
const WIDTH_DESKTOP = 1440;
const WIDTH_WIDE = 1920;

test.use({ storageState: SESSION_FILE });

const consoleErrors: string[] = [];
const badResponses: string[] = [];

test.beforeAll(() => {
  if (!existsSync(SESSION_FILE)) {
    throw new Error('Falta e2e/.auth/session.json: corre primero e2e/login.spec.ts');
  }
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.beforeEach(async ({ page }) => {
  consoleErrors.length = 0;
  badResponses.length = 0;

  await page.route('**/*', (route) => {
    const method = route.request().method();
    return READ_ONLY_METHODS.includes(method) ? route.continue() : route.abort();
  });
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));
  page.on('response', (response) => {
    if (response.request().method() === 'GET' && response.status() >= HTTP_ERROR_MIN) {
      badResponses.push(`${response.status()} ${response.url()}`);
    }
  });
});

test.afterEach(() => {
  expect(consoleErrors, 'errores de consola').toEqual([]);
  expect(badResponses, 'respuestas GET >= 400').toEqual([]);
});

async function openProfile(page: Page, width: number) {
  await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
  await page.goto(PROFILE_ROUTE);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#professionalTitle')).toBeVisible();
  await page.waitForTimeout(SETTLE_MS);
}

async function hasHorizontalScroll(page: Page) {
  return page.evaluate(
    (tolerance) => document.documentElement.scrollWidth > window.innerWidth + tolerance,
    PIXEL_TOLERANCE,
  );
}

for (const width of [WIDTH_MOBILE, WIDTH_TABLET, WIDTH_DESKTOP, WIDTH_WIDE]) {
  test(`sin scroll horizontal y cabecera de identidad a ${width}`, async ({ page }) => {
    await openProfile(page, width);
    expect(await hasHorizontalScroll(page), 'scroll horizontal').toBe(false);

    const identity = page.locator('[class*="rounded-card"]').first();
    await expect(identity.locator('span.rounded-full').first(), 'avatar').toBeVisible();
    await expect(identity.getByRole('heading'), 'nombre').toBeVisible();
    await expect(identity.getByText('@'), 'correo').toBeVisible();
    await expect(identity.locator('span.rounded-full').last(), 'nivel de acceso').toBeVisible();
    await expect(page.getByRole('button', { name: 'Guardar' }), 'Guardar').toBeDisabled();
  });
}

test('Título y colegiado lado a lado a 1440, cada uno de hasta 16rem', async ({ page }) => {
  await openProfile(page, WIDTH_DESKTOP);
  const title = await page.locator('#professionalTitle').boundingBox();
  const license = await page.locator('#licenseNumber').boundingBox();
  if (!title || !license) throw new Error('Sin caja de los campos');

  expect(Math.abs(title.y - license.y), 'misma fila').toBeLessThanOrEqual(PIXEL_TOLERANCE);
  expect(license.x, 'colegiado a la derecha del título').toBeGreaterThan(title.x + title.width);
  expect(title.width, 'ancho del título').toBeLessThanOrEqual(MAX_FIELD_REM * REM_PX);
  expect(license.width, 'ancho del colegiado').toBeLessThanOrEqual(MAX_FIELD_REM * REM_PX);
});

test('en celular los campos van apilados a ancho completo', async ({ page }) => {
  await openProfile(page, WIDTH_MOBILE);
  const title = await page.locator('#professionalTitle').boundingBox();
  const license = await page.locator('#licenseNumber').boundingBox();
  if (!title || !license) throw new Error('Sin caja de los campos');

  expect(license.y, 'colegiado debajo del título').toBeGreaterThan(title.y + title.height);
  expect(Math.abs(title.width - license.width)).toBeLessThanOrEqual(PIXEL_TOLERANCE);
});

test('la vista previa sigue el colegiado escrito y Guardar se habilita', async ({ page }) => {
  await openProfile(page, WIDTH_DESKTOP);
  const preview = page.locator('#profile-preview');
  const save = page.getByRole('button', { name: 'Guardar' });
  await expect(save).toBeDisabled();
  await page.screenshot({ path: `${SCREENSHOT_DIR}/perfil-1440.png`, fullPage: true });

  const before = (await preview.innerText()).trim();
  await page.locator('#licenseNumber').fill(LICENSE_TEST_VALUE);
  await expect(preview).toContainText(LICENSE_PREFIX);
  await expect(preview).toContainText(LICENSE_TEST_VALUE);
  expect((await preview.innerText()).trim()).not.toBe(before);
  await expect(save).toBeEnabled();

  await page.setViewportSize({ width: WIDTH_MOBILE, height: VIEWPORT_HEIGHT });
  await page.waitForTimeout(SETTLE_MS);
  expect(await hasHorizontalScroll(page), 'scroll horizontal').toBe(false);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/perfil-390.png`, fullPage: true });
});

test('el colegiado no se sale de su tarjeta a 768', async ({ page }) => {
  await openProfile(page, WIDTH_TABLET);
  const license = await page.locator('#licenseNumber').boundingBox();
  const card = await page
    .locator('#licenseNumber')
    .locator('xpath=ancestor::*[contains(@class,"rounded-card")][1]')
    .boundingBox();
  if (!license || !card) throw new Error('Sin caja del campo o de la tarjeta');

  expect(license.x + license.width, 'borde derecho del colegiado').toBeLessThanOrEqual(
    card.x + card.width,
  );
});

test('el select y el input miden lo mismo', async ({ page }) => {
  await openProfile(page, WIDTH_DESKTOP);
  const title = await page.locator('#professionalTitle').boundingBox();
  const license = await page.locator('#licenseNumber').boundingBox();
  if (!title || !license) throw new Error('Sin caja de los campos');

  expect(Math.abs(title.height - license.height), 'altura').toBeLessThanOrEqual(PIXEL_TOLERANCE);
});

test('sin colegiado la vista previa avisa como advertencia, con colegiado no repite texto', async ({
  page,
}) => {
  await openProfile(page, WIDTH_DESKTOP);
  const box = page.locator('#profile-preview').locator('xpath=..');
  await page.locator('#licenseNumber').fill('');
  await expect(box).toHaveClass(/border-warning-300/);
  await expect(box.getByRole('status')).toContainText('Falta tu número de colegiado');
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/perfil-1440-sin-colegiado.png`,
    fullPage: true,
  });

  await page.locator('#licenseNumber').fill(LICENSE_TEST_VALUE);
  await expect(box).not.toHaveClass(/border-warning-300/);
  await expect(box.getByRole('status')).toHaveCount(0);
  await expect(box).not.toContainText('Aparece junto a tu nombre');
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/perfil-1440-con-colegiado.png`,
    fullPage: true,
  });
});

test('la tarjeta de identidad va en fila a 390', async ({ page }) => {
  await openProfile(page, WIDTH_MOBILE);
  const identity = page.locator('[class*="rounded-card"]').first();
  const avatar = await identity.locator('span.rounded-full').first().boundingBox();
  const name = await identity.getByRole('heading').boundingBox();
  if (!avatar || !name) throw new Error('Sin caja del avatar o del nombre');

  expect(name.x, 'nombre a la derecha del avatar').toBeGreaterThan(avatar.x + avatar.width);
  expect(name.y, 'nombre dentro de la fila del avatar').toBeLessThan(avatar.y + avatar.height);
});

test('capturas a 390 y 768', async ({ page }) => {
  for (const width of [WIDTH_MOBILE, WIDTH_TABLET]) {
    await openProfile(page, width);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/perfil-${width}.png`, fullPage: true });
  }
});
