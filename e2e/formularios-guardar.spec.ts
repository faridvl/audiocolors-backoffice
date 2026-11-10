import { mkdirSync } from 'node:fs';
import { Locator, Page, expect, test } from '@playwright/test';

// Escribe en Configuración → Formularios: solo corre contra un front local (E2E_BASE_URL) y
// aborta cualquier escritura que no vaya a localhost, para no tocar nunca el API remoto.
const SCREENSHOT_DIR = 'test-results/qa-configuracion-estandar/A';
const BASE_URL_ENV = 'E2E_BASE_URL';
const EMAIL_ENV = 'E2E_EMAIL';
const PASSWORD_ENV = 'E2E_PASSWORD';
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];
const READ_ONLY_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const LOGIN_ROUTE = '/login';
const PATIENTS_ROUTE = '/pacientes';
const QUESTIONS_ROUTE = '/configuracion/preguntas';
const HTTP_ERROR_MIN = 400;
const SETTLE_MS = 400;
const SAVE_TIMEOUT_MS = 15_000;
const MIN_QUESTIONNAIRE_SECTIONS = 2;

const WIDTH_DESKTOP = 1440;
const HEIGHT_DESKTOP = 900;
const WIDTH_MOBILE = 375;
const HEIGHT_MOBILE_LOW = 600;

const CLINICAL_HISTORY = 'Historia clínica';
const NEW_SECTION_BUTTON = 'Nueva sección';
const NEW_SECTION_HINT = 'Guarda o descarta la sección que estás creando para empezar otra.';
const UNSAVED_CHANGES = 'Hay cambios sin guardar';
const SECTION_NAME_LABEL = 'Nombre de la sección';
const CONTINUE_BUTTON = 'Continuar';
const SAVE_BUTTON = 'Guardar';
const QUESTION_LABEL = 'Pregunta';
const ADD_QUESTION_BUTTON = 'Agregar pregunta';
const SECTION_SAVED_TOAST = 'Sección guardada';

const baseUrl = process.env[BASE_URL_ENV] ?? '';
const isLocalBase = (() => {
  try {
    return LOCAL_HOSTS.includes(new URL(baseUrl).hostname);
  } catch {
    return false;
  }
})();

test.skip(!isLocalBase, `${BASE_URL_ENV} debe apuntar a localhost: este spec escribe datos`);
test.use({ baseURL: baseUrl || undefined });

const consoleErrors: string[] = [];
const badResponses: string[] = [];

function isLocalUrl(url: string): boolean {
  try {
    return LOCAL_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

function runStamp(): string {
  return Date.now().toString(36);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test.beforeAll(() => {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
});

test.beforeEach(async ({ page }) => {
  consoleErrors.length = 0;
  badResponses.length = 0;

  await page.route('**/*', (route) => {
    const request = route.request();
    const isWrite = !READ_ONLY_METHODS.includes(request.method());
    return isWrite && !isLocalUrl(request.url()) ? route.abort() : route.continue();
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

async function login(page: Page) {
  const email = process.env[EMAIL_ENV];
  const password = process.env[PASSWORD_ENV];
  if (!email || !password) throw new Error(`Faltan ${EMAIL_ENV} y ${PASSWORD_ENV}`);

  await page.goto(LOGIN_ROUTE);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(new RegExp(`${PATIENTS_ROUTE}$`));
}

async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(SETTLE_MS);
}

async function openQuestions(page: Page, width = WIDTH_DESKTOP, height = HEIGHT_DESKTOP) {
  await page.setViewportSize({ width, height });
  await login(page);
  await page.goto(QUESTIONS_ROUTE);
  await settle(page);
}

async function reloadQuestions(page: Page) {
  await page.reload();
  await settle(page);
}

async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}.png`, fullPage: true });
}

/** Cabecera del acordeón de una sección: el botón con aria-expanded y su nombre. */
function sectionHeader(page: Page, title: string): Locator {
  return page
    .locator('main')
    .getByRole('button', { name: new RegExp(`^${escapeRegExp(title)}`) })
    .first();
}

async function openSection(page: Page, title: string): Promise<Locator> {
  const header = sectionHeader(page, title);
  await expect(header, `cabecera de "${title}"`).toBeVisible();
  if ((await header.getAttribute('aria-expanded')) !== 'true') await header.click();
  await expect(header).toHaveAttribute('aria-expanded', 'true');
  return panelOf(page, header);
}

/** El panel de una cabecera, por su aria-controls. */
async function panelOf(page: Page, header: Locator): Promise<Locator> {
  const panelId = await header.getAttribute('aria-controls');
  if (!panelId) throw new Error('La cabecera no tiene aria-controls');
  return page.locator(`[id="${panelId}"]`);
}

/** El botón Guardar de la barra de una sección: se enlaza a su formulario por el atributo form. */
async function saveButtonOf(page: Page, panel: Locator): Promise<Locator> {
  const formId = await panel.locator('form').first().getAttribute('id');
  if (!formId) throw new Error('El panel no tiene formulario con id');
  return page
    .getByRole('button', { name: SAVE_BUTTON, exact: true })
    .and(page.locator(`[form="${formId}"]`));
}

/** La barra de guardar (tarjeta fuera del acordeón) que contiene ese botón. */
function barOf(saveButton: Locator): Locator {
  return saveButton.locator('xpath=ancestor::div[contains(@class,"rounded-card")][1]');
}

function firstQuestionInput(panel: Locator): Locator {
  return panel.getByLabel(QUESTION_LABEL, { exact: true }).first();
}

/** Títulos de las secciones propias (todas menos la historia clínica), en el orden de la lista. */
async function questionnaireTitles(page: Page): Promise<string[]> {
  const headers = page.locator('main [aria-expanded][aria-controls]');
  const names = await headers.evaluateAll((elements) =>
    elements.map((element) => (element.querySelector('span span')?.textContent ?? '').trim()),
  );
  return names.filter((name) => name && name !== CLINICAL_HISTORY);
}

async function box(locator: Locator, label: string) {
  await expect(locator, `${label} visible`).toBeVisible();
  const result = await locator.boundingBox();
  if (!result) throw new Error(`${label}: sin caja`);
  return result;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function intersects(first: Rect, second: Rect): boolean {
  return (
    first.x < second.x + second.width &&
    second.x < first.x + first.width &&
    first.y < second.y + second.height &&
    second.y < first.y + first.height
  );
}

async function viewportSize(page: Page) {
  const size = page.viewportSize();
  if (!size) throw new Error('Sin viewport');
  return size;
}

function isInsideViewport(rect: Rect, viewport: { width: number; height: number }): boolean {
  return (
    rect.x >= 0 &&
    rect.y >= 0 &&
    rect.x + rect.width <= viewport.width &&
    rect.y + rect.height <= viewport.height
  );
}

/** El borrador trae una fila vacía; si no la trae, se agrega una para no dejar filas sin llenar. */
async function fillFirstQuestion(panel: Locator, question: string) {
  if ((await panel.getByLabel(QUESTION_LABEL, { exact: true }).count()) === 0) {
    await panel.getByRole('button', { name: ADD_QUESTION_BUTTON }).first().click();
  }
  await firstQuestionInput(panel).fill(question);
}

/** Crea una sección propia desde la pantalla: nombre, una pregunta y Guardar. */
async function createSection(page: Page, name: string, question: string) {
  await page.getByRole('button', { name: NEW_SECTION_BUTTON, exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel(SECTION_NAME_LABEL).fill(name);
  await dialog.getByRole('button', { name: CONTINUE_BUTTON }).click();
  const header = sectionHeader(page, name);
  await expect(header).toHaveAttribute('aria-expanded', 'true');
  const panel = await panelOf(page, header);
  await fillFirstQuestion(panel, question);
  const save = await saveButtonOf(page, panel);
  await save.click();
  await expect(page.getByText(SECTION_SAVED_TOAST).first()).toBeVisible({
    timeout: SAVE_TIMEOUT_MS,
  });
  await settle(page);
}

/** Devuelve dos secciones propias; si el ambiente tiene menos, crea las que falten. */
async function ensureQuestionnaireSections(page: Page): Promise<string[]> {
  let titles = await questionnaireTitles(page);
  const stamp = runStamp();
  for (let index = titles.length; index < MIN_QUESTIONNAIRE_SECTIONS; index += 1) {
    await createSection(page, `QA base ${stamp}-${index}`, `Pregunta base ${index}`);
  }
  if (titles.length < MIN_QUESTIONNAIRE_SECTIONS) {
    await reloadQuestions(page);
    titles = await questionnaireTitles(page);
  }
  return titles.slice(0, MIN_QUESTIONNAIRE_SECTIONS);
}

test('1. editar un campo muestra la barra "Cambios en {sección}" y guardar persiste', async ({
  page,
}) => {
  await openQuestions(page);
  const [title] = await ensureQuestionnaireSections(page);
  const panel = await openSection(page, title);
  const save = await saveButtonOf(page, panel);
  const label = page.getByText(`Cambios en ${title}`, { exact: true });

  await expect(label, 'la barra dice qué guarda').toBeVisible();
  await expect(save, 'sin cambios, Guardar está deshabilitado').toBeDisabled();

  const edited = `QA caso1 ${runStamp()}`;
  await firstQuestionInput(panel).fill(edited);
  await expect(save, 'con cambios, Guardar se habilita').toBeEnabled();
  await screenshot(page, 'caso1-barra-con-cambios');

  await save.click();
  await expect(save, 'tras guardar, Guardar vuelve a deshabilitarse').toBeDisabled({
    timeout: SAVE_TIMEOUT_MS,
  });

  await reloadQuestions(page);
  const reopened = await openSection(page, title);
  await expect(firstQuestionInput(reopened), 'el cambio persiste tras recargar').toHaveValue(
    edited,
  );
  await screenshot(page, 'caso1-tras-recargar');
});

test('2. dos secciones abiertas: dos barras sin taparse; guardar una no guarda la otra', async ({
  page,
}) => {
  await openQuestions(page);
  const [titleA, titleB] = await ensureQuestionnaireSections(page);
  const panelA = await openSection(page, titleA);
  const panelB = await openSection(page, titleB);

  const stamp = runStamp();
  const originalB = await firstQuestionInput(panelB).inputValue();
  const editedA = `QA caso2 A ${stamp}`;
  const editedB = `QA caso2 B ${stamp}`;
  await firstQuestionInput(panelA).fill(editedA);
  await firstQuestionInput(panelB).fill(editedB);

  const saveA = await saveButtonOf(page, panelA);
  const saveB = await saveButtonOf(page, panelB);
  const barA = barOf(saveA);
  const barB = barOf(saveB);
  await expect(page.getByText(`Cambios en ${titleA}`, { exact: true })).toBeAttached();
  await expect(page.getByText(`Cambios en ${titleB}`, { exact: true })).toBeAttached();

  // En el documento: las dos barras ocupan lugares distintos.
  const [documentA, documentB] = await Promise.all([
    barA.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y + window.scrollY, width: rect.width, height: rect.height };
    }),
    barB.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y + window.scrollY, width: rect.width, height: rect.height };
    }),
  ]);
  console.log(`CASO2 documento A=${JSON.stringify(documentA)} B=${JSON.stringify(documentB)}`);
  expect(intersects(documentA, documentB), 'barras traslapadas en el documento').toBe(false);

  // En la pantalla: al llevar una a la vista, no tapa ni queda tapada por la otra.
  for (const [name, bar, other] of [
    ['A', barA, barB],
    ['B', barB, barA],
  ] as const) {
    await bar.scrollIntoViewIfNeeded();
    await page.waitForTimeout(SETTLE_MS);
    const own = await box(bar, `barra ${name}`);
    const otherBox = await other.boundingBox();
    const viewport = await viewportSize(page);
    console.log(
      `CASO2 vista ${name}=${JSON.stringify(own)} otra=${JSON.stringify(otherBox)} viewport=${viewport.width}x${viewport.height}`,
    );
    expect(isInsideViewport(own, viewport), `barra ${name} dentro de la vista`).toBe(true);
    if (otherBox) {
      expect(intersects(own, otherBox), `barra ${name} traslapada con la otra`).toBe(false);
    }
    await screenshot(page, `caso2-barra-${name}`);
  }

  await saveA.click();
  await expect(saveA).toBeDisabled({ timeout: SAVE_TIMEOUT_MS });
  await expect(saveB, 'la otra barra sigue con cambios').toBeEnabled();

  await reloadQuestions(page);
  const reopenedA = await openSection(page, titleA);
  const reopenedB = await openSection(page, titleB);
  await expect(firstQuestionInput(reopenedA), 'la guardada persiste').toHaveValue(editedA);
  await expect(firstQuestionInput(reopenedB), 'la otra no se guardó').toHaveValue(originalB);
  await screenshot(page, 'caso2-tras-recargar');
});

test('3. editar sin guardar y cerrar la sección: el subtítulo avisa', async ({ page }) => {
  await openQuestions(page);
  const [title] = await ensureQuestionnaireSections(page);
  const panel = await openSection(page, title);
  const header = sectionHeader(page, title);

  await expect(header, 'sin cambios no hay aviso').not.toContainText(UNSAVED_CHANGES);
  await firstQuestionInput(panel).fill(`QA caso3 ${runStamp()}`);
  await header.click();
  await expect(header).toHaveAttribute('aria-expanded', 'false');
  await expect(header, 'cerrada con cambios').toContainText(UNSAVED_CHANGES);
  await screenshot(page, 'caso3-cerrada-con-aviso');
});

for (const viewport of [
  { width: WIDTH_MOBILE, height: HEIGHT_MOBILE_LOW },
  { width: WIDTH_DESKTOP, height: HEIGHT_DESKTOP },
]) {
  test(`4. Nueva sección a ${viewport.width}: borrador, ayuda a la vista, guardado y recarga`, async ({
    page,
  }) => {
    await openQuestions(page, viewport.width, viewport.height);
    const name = `QA nueva ${runStamp()}`;
    const question = `Pregunta de ${name}`;
    const newButton = page.getByRole('button', { name: NEW_SECTION_BUTTON, exact: true });

    await expect(newButton, 'antes de crear el borrador, el botón está habilitado').toBeEnabled();
    await newButton.click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(SECTION_NAME_LABEL).fill(name);
    await dialog.getByRole('button', { name: CONTINUE_BUTTON }).click();

    const header = sectionHeader(page, name);
    await expect(header, 'el borrador queda abierto').toHaveAttribute('aria-expanded', 'true');
    await expect(header, 'el borrador avisa que no está guardado').toContainText(UNSAVED_CHANGES);
    await settle(page);

    await expect(newButton, 'con borrador, el botón se deshabilita').toBeDisabled();
    // Al crear, la página baja al borrador; la ayuda solo importa cuando el usuario sube y ve el botón deshabilitado.
    await newButton.scrollIntoViewIfNeeded();
    const hint = page.getByText(NEW_SECTION_HINT);
    const hintRect = await box(hint, 'ayuda del botón');
    const buttonRect = await box(newButton, 'botón Nueva sección');
    const size = await viewportSize(page);
    console.log(
      `CASO4 @${viewport.width} ayuda y=${hintRect.y} alto=${hintRect.height} boton y=${buttonRect.y} viewport alto=${size.height}`,
    );
    expect(isInsideViewport(hintRect, size), `la ayuda está junto al botón: y=${hintRect.y}`).toBe(
      true,
    );
    await screenshot(page, `caso4-borrador-${viewport.width}`);

    const panel = await panelOf(page, header);
    await fillFirstQuestion(panel, question);
    const save = await saveButtonOf(page, panel);
    await save.click();
    await expect(page.getByText(SECTION_SAVED_TOAST).first()).toBeVisible({
      timeout: SAVE_TIMEOUT_MS,
    });
    await settle(page);

    await expect(header, 'la sección guardada queda abierta').toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(header, 'ya no avisa cambios sin guardar').not.toContainText(UNSAVED_CHANGES);
    await expect(newButton, 'el botón vuelve a habilitarse').toBeEnabled();
    await screenshot(page, `caso4-guardada-${viewport.width}`);

    await reloadQuestions(page);
    const reloaded = sectionHeader(page, name);
    await expect(reloaded, 'tras recargar, la sección existe').toBeVisible();
    await expect(reloaded, 'tras recargar, está cerrada').toHaveAttribute('aria-expanded', 'false');
    await screenshot(page, `caso4-tras-recargar-${viewport.width}`);
  });
}

test('5. a 375x600 la barra de guardar y su botón se alcanzan y guardan', async ({ page }) => {
  await openQuestions(page, WIDTH_MOBILE, HEIGHT_MOBILE_LOW);
  const [title] = await ensureQuestionnaireSections(page);
  const panel = await openSection(page, title);
  const save = await saveButtonOf(page, panel);
  const bar = barOf(save);

  const edited = `QA caso5 ${runStamp()}`;
  await firstQuestionInput(panel).fill(edited);
  await expect(save).toBeEnabled();

  const size = await viewportSize(page);
  const beforeScroll = await save.boundingBox();
  console.log(
    `CASO5 antes del desplazamiento boton=${JSON.stringify(beforeScroll)} viewport=${size.width}x${size.height}`,
  );

  await save.scrollIntoViewIfNeeded();
  await page.waitForTimeout(SETTLE_MS);
  const buttonRect = await box(save, 'botón Guardar');
  const barRect = await box(bar, 'barra de guardar');
  console.log(`CASO5 boton=${JSON.stringify(buttonRect)} barra=${JSON.stringify(barRect)}`);
  expect(isInsideViewport(buttonRect, size), 'el botón cabe en la vista').toBe(true);

  // Nada lo tapa: el elemento en el centro del botón es el botón mismo.
  const isReachable = await save.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const top = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    return !!top && element.contains(top);
  });
  expect(isReachable, 'el botón no está tapado').toBe(true);
  await screenshot(page, 'caso5-barra-375x600');

  await save.click();
  await expect(save).toBeDisabled({ timeout: SAVE_TIMEOUT_MS });

  await reloadQuestions(page);
  const reopened = await openSection(page, title);
  await expect(firstQuestionInput(reopened), 'el cambio persiste tras recargar').toHaveValue(
    edited,
  );
});
