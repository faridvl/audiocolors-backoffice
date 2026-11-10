import { mkdirSync } from 'node:fs';
import { Locator, Page, expect, test } from '@playwright/test';

// Escribe en Configuración → Sedes: solo corre contra un front local (E2E_BASE_URL) y aborta
// cualquier escritura que no vaya a localhost.
const SCREENSHOT_DIR = 'test-results/qa-sedes';
const BASE_URL_ENV = 'E2E_BASE_URL';
const EMAIL_ENV = 'E2E_EMAIL';
const PASSWORD_ENV = 'E2E_PASSWORD';
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];
const READ_ONLY_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const LOGIN_ROUTE = '/login';
const PATIENTS_ROUTE = '/pacientes';
const BRANCHES_ROUTE = '/configuracion/sedes';
const HTTP_ERROR_MIN = 400;
const SETTLE_MS = 400;
const SAVE_TIMEOUT_MS = 15_000;
const PHONE_DIGITS = 7;
const PHONE_PREFIX = '8';

const SAVE_BUTTON = 'Guardar';
const NEW_BRANCH_BUTTON = 'Nueva sede';
const NEW_BRANCH_TITLE = 'Nueva sede';
const EDIT_BRANCH_TITLE = 'Editar sede';
const NAME_LABEL = 'Nombre';
const PHONE_LABEL = 'Teléfono';
const ADDRESS_LABEL = 'Dirección';
const COLOR_BLUE = 'Azul';
const COLOR_PURPLE = 'Morado';
const DEACTIVATE_BUTTON = 'Desactivar';
const REACTIVATE_BUTTON = 'Reactivar';
const INACTIVE_BADGE = 'Inactiva';
const CREATED_TOAST = 'Sede creada';
const SAVED_TOAST = 'Sede guardada';
const DEACTIVATED_TOAST = 'Sede desactivada';
const REACTIVATED_TOAST = 'Sede reactivada';
const DUPLICATE_NAME_MESSAGE = 'Ya tienes una sede con ese nombre.';

const VIEWPORTS = [
  { label: '1440', width: 1440, height: 900 },
  { label: '375', width: 375, height: 600 },
];

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

/** Teléfono nacional de 8 dígitos distinto en cada corrida. */
function runPhone(): string {
  return `${PHONE_PREFIX}${String(Date.now()).slice(-PHONE_DIGITS)}`;
}

/** Las etiquetas de campos obligatorios terminan en "*": se compara solo el inicio. */
function labelStart(label: string): RegExp {
  return new RegExp(`^${label}`);
}

function digitsOf(value: string): string {
  return value.replace(/\D/g, '');
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
  // El 409 de un nombre repetido es una escritura (POST), no un GET: no entra en la lista.
  expect(
    consoleErrors.filter((error) => !error.includes('409')),
    'errores de consola',
  ).toEqual([]);
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

async function openRoute(page: Page, route: string, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await login(page);
  await page.goto(route);
  await settle(page);
}

async function reload(page: Page) {
  await page.reload();
  await settle(page);
}

async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}.png`, fullPage: true });
}

async function expectToast(page: Page, text: string) {
  await expect(page.getByText(text).first(), `aviso "${text}"`).toBeVisible({
    timeout: SAVE_TIMEOUT_MS,
  });
}

async function clickSave(page: Page, name = SAVE_BUTTON) {
  const button = page.getByRole('button', { name, exact: true });
  await expect(button, `botón "${name}" habilitado`).toBeEnabled();
  await button.click();
}

function branchRow(page: Page, name: string): Locator {
  return page.getByRole('listitem').filter({ hasText: name });
}

async function pickColor(page: Page, color: string) {
  await page.getByRole('radio', { name: color }).check({ force: true });
}

/** Crea una sede con nombre, teléfono, dirección y el color azul. */
async function createBranch(page: Page, name: string, phone: string, address: string) {
  await page.getByRole('button', { name: NEW_BRANCH_BUTTON }).click();
  await expect(page.getByRole('dialog', { name: NEW_BRANCH_TITLE })).toBeVisible();
  await page.getByLabel(labelStart(NAME_LABEL)).fill(name);
  await page.getByLabel(PHONE_LABEL, { exact: true }).fill(phone);
  await page.getByLabel(ADDRESS_LABEL).fill(address);
  await pickColor(page, COLOR_BLUE);
  await clickSave(page);
  await expectToast(page, CREATED_TOAST);
}

for (const viewport of VIEWPORTS) {
  const { label, width, height } = viewport;

  test.describe(`Sedes a ${label}`, () => {
    test('crear una sede y verla tras recargar', async ({ page }) => {
      await openRoute(page, BRANCHES_ROUTE, width, height);

      const stamp = runStamp();
      const name = `Sede QA ${stamp}`;
      const phone = runPhone();
      const address = `Dirección de prueba ${stamp}`;

      await createBranch(page, name, phone, address);
      await screenshot(page, `sedes-${label}-1-creada`);

      await reload(page);
      const row = branchRow(page, name);
      await expect(row).toBeVisible();
      await expect(row).toContainText(address);
      expect(digitsOf((await row.textContent()) ?? '')).toContain(phone);
      await screenshot(page, `sedes-${label}-2-recargada`);
    });

    test('un nombre repetido se avisa en el campo del nombre', async ({ page }) => {
      await openRoute(page, BRANCHES_ROUTE, width, height);

      const name = `Sede repetida ${runStamp()}`;
      await createBranch(page, name, runPhone(), 'Dirección repetida');

      await page.getByRole('button', { name: NEW_BRANCH_BUTTON }).click();
      await page.getByLabel(labelStart(NAME_LABEL)).fill(name);
      await clickSave(page);

      await expect(page.getByText(DUPLICATE_NAME_MESSAGE)).toBeVisible({
        timeout: SAVE_TIMEOUT_MS,
      });
      await expect(page.getByRole('dialog', { name: NEW_BRANCH_TITLE })).toBeVisible();
      await screenshot(page, `sedes-${label}-3-nombre-repetido`);
    });

    test('editar el color y vaciar el teléfono', async ({ page }) => {
      await openRoute(page, BRANCHES_ROUTE, width, height);

      const name = `Sede editar ${runStamp()}`;
      await createBranch(page, name, runPhone(), 'Dirección a editar');

      await branchRow(page, name)
        .getByRole('button', { name: /^Editar/ })
        .click();
      await expect(page.getByRole('dialog', { name: EDIT_BRANCH_TITLE })).toBeVisible();
      await pickColor(page, COLOR_PURPLE);
      await page.getByLabel(PHONE_LABEL, { exact: true }).fill('');
      await screenshot(page, `sedes-${label}-4-editando`);
      await clickSave(page);
      await expectToast(page, SAVED_TOAST);

      await reload(page);
      const row = branchRow(page, name);
      await expect(row).toBeVisible();
      await expect(row).toContainText('Dirección a editar');

      await row.getByRole('button', { name: /^Editar/ }).click();
      await expect(page.getByLabel(PHONE_LABEL, { exact: true })).toHaveValue('');
      await expect(page.getByRole('radio', { name: COLOR_PURPLE })).toBeChecked();
      await screenshot(page, `sedes-${label}-5-editada`);
    });

    test('desactivar y reactivar una sede', async ({ page }) => {
      await openRoute(page, BRANCHES_ROUTE, width, height);

      const name = `Sede activar ${runStamp()}`;
      await createBranch(page, name, runPhone(), 'Dirección a desactivar');

      await branchRow(page, name).getByRole('button', { name: DEACTIVATE_BUTTON }).click();
      await page.getByRole('button', { name: DEACTIVATE_BUTTON, exact: true }).last().click();
      await expectToast(page, DEACTIVATED_TOAST);
      await expect(branchRow(page, name)).toContainText(INACTIVE_BADGE);
      await screenshot(page, `sedes-${label}-6-desactivada`);

      await reload(page);
      await expect(branchRow(page, name)).toContainText(INACTIVE_BADGE);

      await branchRow(page, name).getByRole('button', { name: REACTIVATE_BUTTON }).click();
      await expectToast(page, REACTIVATED_TOAST);
      await expect(branchRow(page, name)).not.toContainText(INACTIVE_BADGE);
      await screenshot(page, `sedes-${label}-7-reactivada`);
    });
  });
}
