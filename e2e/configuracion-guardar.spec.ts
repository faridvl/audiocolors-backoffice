import { mkdirSync } from 'node:fs';
import { Locator, Page, expect, test } from '@playwright/test';

// Escribe en Configuración (Clínica, Usuarios, Tipos de cita, Plantillas): solo corre contra un
// front local (E2E_BASE_URL) y aborta cualquier escritura que no vaya a localhost.
const SCREENSHOT_DIR = 'test-results/qa-configuracion-estandar/B';
const BASE_URL_ENV = 'E2E_BASE_URL';
const EMAIL_ENV = 'E2E_EMAIL';
const PASSWORD_ENV = 'E2E_PASSWORD';
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];
const READ_ONLY_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const LOGIN_ROUTE = '/login';
const PATIENTS_ROUTE = '/pacientes';
const CLINIC_ROUTE = '/configuracion/clinica';
const USERS_ROUTE = '/configuracion/usuarios';
const APPOINTMENT_TYPES_ROUTE = '/configuracion/tipos-de-cita';
const TEMPLATES_ROUTE = '/configuracion/plantillas';
const HTTP_ERROR_MIN = 400;
const SETTLE_MS = 400;
const SAVE_TIMEOUT_MS = 15_000;
const PHONE_DIGITS = 7;
const PHONE_PREFIX = '8';
const PHONE_DIGITS_TOTAL = 8;
const TEMP_PASSWORD = 'Temporal2026';

const VIEWPORTS = [
  { label: '1440', width: 1440, height: 900 },
  { label: '375', width: 375, height: 600 },
];

// PNG de 1x1 píxel.
const LOGO_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const LOGO_FILE_NAME = 'logo-qa.png';
const LOGO_MIME_TYPE = 'image/png';

const SAVE_BUTTON = 'Guardar';
const CLINIC_NAME_LABEL = 'Nombre de la clínica';
const PHONE_LABEL = 'Teléfono';
const ADDRESS_LABEL = 'Dirección';
const CLINIC_SAVED_TOAST = 'Datos de la clínica guardados';
const LOGO_UPLOADED_TOAST = 'Logo actualizado';
const NEW_USER_BUTTON = 'Nuevo usuario';
const FULL_NAME_LABEL = 'Nombre completo';
const EMAIL_LABEL = 'Correo';
const ROLE_LABEL = 'Nivel de acceso';
const ROLE_RECEPTION = 'Recepción';
const TEMP_PASSWORD_LABEL = 'Contraseña temporal';
const CREATE_USER_BUTTON = 'Crear usuario';
const USER_CREATED_TOAST = 'Usuario creado';
const USER_SAVED_TOAST = 'Cambios guardados';
const ROLE_SELF_HINT = 'No puedes cambiar tu propio nivel de acceso.';
const YOU_BADGE = 'Tú';
const NEW_APPOINTMENT_TYPE_BUTTON = 'Nuevo tipo de cita';
const APPOINTMENT_TYPE_NAME_LABEL = 'Nombre';
const APPOINTMENT_TYPE_DURATION_LABEL = 'Duración';
const APPOINTMENT_TYPE_CREATED_TOAST = 'Tipo de cita agregado';
const APPOINTMENT_TYPE_SAVED_TOAST = 'Tipo de cita guardado';
const DURATION_CREATE = '45';
const DURATION_EDIT = '90';
const NEW_TEMPLATE_BUTTON = 'Nueva plantilla';
const TEMPLATE_NAME_LABEL = 'Nombre';
const TEMPLATE_CONTENT_LABEL = 'Texto del documento';
const TEMPLATE_SAVED_TOAST = 'Plantilla guardada';

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

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

/** Una fila de la lista de usuarios: enlace en la tabla, tarjeta-botón en el celular. */
function userEntry(page: Page, name: string): Locator {
  return page
    .getByRole('link', { name })
    .or(page.getByRole('button', { name: new RegExp(`^${escapeRegExp(name)} `) }));
}

/** Desde la lista de usuarios, abre al usuario marcado con "Tú". */
async function openOwner(page: Page) {
  const ownCard = page.getByRole('button', { name: /(^|\s)Tú(\s|$)/ });
  if (await ownCard.count()) {
    await ownCard.first().click();
    return;
  }
  const youBadge = page.getByText(YOU_BADGE, { exact: true }).first();
  await expect(youBadge, 'marca "Tú" en la lista').toBeVisible();
  const ownRow = page.locator('tr, li, article, [role="row"]').filter({ has: youBadge }).last();
  await ownRow.getByRole('link').first().click();
}

for (const viewport of VIEWPORTS) {
  const { label, width, height } = viewport;

  test.describe(`Configuración a ${label}`, () => {
    test(`clínica: nombre, teléfono y dirección persisten`, async ({ page }) => {
      await openRoute(page, CLINIC_ROUTE, width, height);

      const stamp = runStamp();
      const name = `Clínica QA ${stamp}`;
      const phone = runPhone();
      const address = `Dirección de prueba ${stamp}, San José`;

      await page.getByLabel(CLINIC_NAME_LABEL).fill(name);
      await page.getByLabel(PHONE_LABEL, { exact: true }).fill(phone);
      await page.getByLabel(ADDRESS_LABEL).fill(address);
      await screenshot(page, `clinica-${label}-1-llenado`);

      await clickSave(page);
      await expectToast(page, CLINIC_SAVED_TOAST);
      await screenshot(page, `clinica-${label}-2-guardado`);

      await reload(page);
      await expect(page.getByLabel(CLINIC_NAME_LABEL)).toHaveValue(name);
      await expect(page.getByLabel(ADDRESS_LABEL)).toHaveValue(address);
      const savedPhone = await page.getByLabel(PHONE_LABEL, { exact: true }).inputValue();
      expect(digitsOf(savedPhone)).toBe(phone);
      await screenshot(page, `clinica-${label}-3-recargado`);
    });

    test(`clínica: el logo subido se ve tras recargar`, async ({ page }) => {
      await openRoute(page, CLINIC_ROUTE, width, height);

      await page.locator('input[type="file"]').setInputFiles({
        name: LOGO_FILE_NAME,
        mimeType: LOGO_MIME_TYPE,
        buffer: Buffer.from(LOGO_PNG_BASE64, 'base64'),
      });
      await expectToast(page, LOGO_UPLOADED_TOAST);
      await screenshot(page, `clinica-${label}-4-logo-subido`);

      await reload(page);
      const clinicName = await page.getByLabel(CLINIC_NAME_LABEL).inputValue();
      const logo = page.getByRole('img', { name: clinicName }).first();
      await expect(logo, 'logo visible tras recargar').toBeVisible();
      await expect
        .poll(() => logo.evaluate((image: HTMLImageElement) => image.naturalWidth))
        .toBeGreaterThan(0);
      await screenshot(page, `clinica-${label}-5-logo-recargado`);
    });

    test(`usuarios: crear y editar un usuario`, async ({ page }) => {
      await openRoute(page, USERS_ROUTE, width, height);

      const stamp = runStamp();
      const email = `qa-${stamp}@audiocolors.test`;
      const createdName = `Usuario QA ${stamp}`;
      const editedName = `Usuario QA editado ${stamp}`;
      const phone = runPhone();

      await page.getByRole('button', { name: NEW_USER_BUTTON, exact: true }).click();
      await page.getByLabel(FULL_NAME_LABEL).fill(createdName);
      await page.getByRole('textbox', { name: labelStart(EMAIL_LABEL) }).fill(email);
      await page.getByLabel(ROLE_LABEL).selectOption({ label: ROLE_RECEPTION });
      await page
        .getByRole('textbox', { name: labelStart(TEMP_PASSWORD_LABEL) })
        .fill(TEMP_PASSWORD);
      await screenshot(page, `usuarios-${label}-1-nuevo`);

      await clickSave(page, CREATE_USER_BUTTON);
      await expectToast(page, USER_CREATED_TOAST);
      await expect(userEntry(page, createdName)).toBeVisible();
      await screenshot(page, `usuarios-${label}-2-lista`);

      await userEntry(page, createdName).click();
      await expect(page.getByLabel(FULL_NAME_LABEL)).toHaveValue(createdName);
      await page.getByLabel(FULL_NAME_LABEL).fill(editedName);
      await page.getByLabel(PHONE_LABEL, { exact: true }).fill(phone);
      await screenshot(page, `usuarios-${label}-3-editando`);

      await clickSave(page);
      await expectToast(page, USER_SAVED_TOAST);

      await reload(page);
      await userEntry(page, editedName).click();
      await expect(page.getByLabel(FULL_NAME_LABEL)).toHaveValue(editedName);
      const savedPhone = await page.getByLabel(PHONE_LABEL, { exact: true }).inputValue();
      expect(digitsOf(savedPhone)).toBe(phone);
      await screenshot(page, `usuarios-${label}-4-recargado`);
    });

    test(`usuarios: el propietario cambia su teléfono con el nivel bloqueado`, async ({ page }) => {
      await openRoute(page, USERS_ROUTE, width, height);

      const phone = runPhone();
      await openOwner(page);

      const role = page.getByLabel(ROLE_LABEL);
      await expect(role, 'nivel de acceso bloqueado').toBeDisabled();
      await expect(page.getByText(ROLE_SELF_HINT)).toBeVisible();
      await page.getByLabel(PHONE_LABEL, { exact: true }).fill(phone);
      await screenshot(page, `usuarios-${label}-5-propietario`);

      await clickSave(page);
      await expectToast(page, USER_SAVED_TOAST);

      await reload(page);
      await openOwner(page);
      await expect(page.getByLabel(ROLE_LABEL)).toBeDisabled();
      const savedPhone = await page.getByLabel(PHONE_LABEL, { exact: true }).inputValue();
      expect(digitsOf(savedPhone)).toBe(phone);
      await screenshot(page, `usuarios-${label}-6-propietario-recargado`);
    });

    test(`tipos de cita: crear y editar`, async ({ page }) => {
      await openRoute(page, APPOINTMENT_TYPES_ROUTE, width, height);

      const stamp = runStamp();
      const createdName = `Tipo QA ${stamp}`;
      const editedName = `Tipo QA editado ${stamp}`;

      await page.getByRole('button', { name: NEW_APPOINTMENT_TYPE_BUTTON, exact: true }).click();
      const createDialog = page.getByRole('dialog');
      await createDialog.getByLabel(APPOINTMENT_TYPE_NAME_LABEL).fill(createdName);
      await createDialog.getByLabel(APPOINTMENT_TYPE_DURATION_LABEL).selectOption(DURATION_CREATE);
      await screenshot(page, `tipos-${label}-1-nuevo`);

      await clickSave(page);
      await expectToast(page, APPOINTMENT_TYPE_CREATED_TOAST);
      await expect(page.getByRole('button', { name: `Editar ${createdName}` })).toBeVisible();

      await page.getByRole('button', { name: `Editar ${createdName}` }).click();
      const editDialog = page.getByRole('dialog');
      await editDialog.getByLabel(APPOINTMENT_TYPE_NAME_LABEL).fill(editedName);
      await editDialog.getByLabel(APPOINTMENT_TYPE_DURATION_LABEL).selectOption(DURATION_EDIT);
      await screenshot(page, `tipos-${label}-2-editando`);

      await clickSave(page);
      await expectToast(page, APPOINTMENT_TYPE_SAVED_TOAST);

      await reload(page);
      await page.getByRole('button', { name: `Editar ${editedName}` }).click();
      const savedDialog = page.getByRole('dialog');
      await expect(savedDialog.getByLabel(APPOINTMENT_TYPE_NAME_LABEL)).toHaveValue(editedName);
      await expect(savedDialog.getByLabel(APPOINTMENT_TYPE_DURATION_LABEL)).toHaveValue(
        DURATION_EDIT,
      );
      await screenshot(page, `tipos-${label}-3-recargado`);
    });

    test(`plantillas: crear y editar`, async ({ page }) => {
      await openRoute(page, TEMPLATES_ROUTE, width, height);

      const stamp = runStamp();
      const createdName = `Plantilla QA ${stamp}`;
      const editedName = `Plantilla QA editada ${stamp}`;
      const createdText = `Texto inicial ${stamp}`;
      const editedText = `Texto editado ${stamp}`;

      await page.getByRole('button', { name: NEW_TEMPLATE_BUTTON, exact: true }).click();
      await page.getByRole('textbox', { name: labelStart(TEMPLATE_NAME_LABEL) }).fill(createdName);
      await page.getByRole('textbox', { name: TEMPLATE_CONTENT_LABEL }).fill(createdText);
      await screenshot(page, `plantillas-${label}-1-nueva`);

      await clickSave(page);
      await expectToast(page, TEMPLATE_SAVED_TOAST);
      await expect(page.getByRole('button', { name: `Editar ${createdName}` })).toBeVisible();

      await page.getByRole('button', { name: `Editar ${createdName}` }).click();
      await page.getByRole('textbox', { name: labelStart(TEMPLATE_NAME_LABEL) }).fill(editedName);
      const content = page.getByRole('textbox', { name: TEMPLATE_CONTENT_LABEL });
      await content.click();
      await content.press('ControlOrMeta+a');
      await content.pressSequentially(editedText);
      await screenshot(page, `plantillas-${label}-2-editando`);

      await clickSave(page);
      await expectToast(page, TEMPLATE_SAVED_TOAST);

      await reload(page);
      await page.getByRole('button', { name: `Editar ${editedName}` }).click();
      await expect(
        page.getByRole('textbox', { name: labelStart(TEMPLATE_NAME_LABEL) }),
      ).toHaveValue(editedName);
      await expect(page.getByRole('textbox', { name: TEMPLATE_CONTENT_LABEL })).toContainText(
        editedText,
      );
      await screenshot(page, `plantillas-${label}-3-recargado`);
    });
  });
}
