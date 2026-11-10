import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import {
  APIRequestContext,
  Locator,
  Page,
  expect,
  request as playwrightRequest,
  test,
} from '@playwright/test';

// Solo lectura: corre contra el API remoto de desarrollo, así que toda escritura se aborta.
const SESSION_FILE = 'e2e/.auth/session.json';
const SESSION_COOKIE = 'SESSION_ACCESS_TOKEN';
const SCREENSHOT_DIR = 'test-results/qa-configuracion-estandar/acordeones';
const QUESTIONS_ROUTE = '/configuracion/preguntas';
const PATIENTS_ROUTE = '/pacientes';
const HTTP_ERROR_MIN = 400;
const VIEWPORT_WIDTH = 1440;
const VIEWPORT_HEIGHT = 900;
const SETTLE_MS = 400;
const PATIENTS_PAGE_SIZE = 50;
const MAX_PATIENTS_TO_PROBE = 40;
const READ_ONLY_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const AUDIOMETRY_QUERY_PARAM = 'audiometria';
const PATIENT_ENV = 'E2E_PATIENT_UUID';
const AUDIOMETRY_ENV = 'E2E_AUDIOMETRY_UUID';
const API_URL_ENV = 'E2E_RECORDS_URL';
const ENV_LOCAL_FILE = '.env.local';
const RECORDS_URL_KEY = 'NEXT_PUBLIC_MEDICAL_RECORDS_API_URL';

const TITLE_QUESTIONS = /^Formularios/;
const TITLE_AUDIOMETRY = /^Audiometría/;
const EXPANDED_SELECTOR = 'main [aria-expanded]';

test.use({ storageState: SESSION_FILE });

const consoleErrors: string[] = [];
const badResponses: string[] = [];

interface PatientListItem {
  uuid: string;
}

interface AudiometryListItem {
  uuid: string;
}

function readToken(): string {
  const state = JSON.parse(readFileSync(SESSION_FILE, 'utf-8')) as {
    cookies: { name: string; value: string }[];
  };
  const cookie = state.cookies.find((item) => item.name === SESSION_COOKIE);
  if (!cookie) throw new Error('La sesión no trae SESSION_ACCESS_TOKEN: corre e2e/login.spec.ts');
  return decodeURIComponent(cookie.value);
}

function readRecordsUrl(): string | null {
  const fromEnv = process.env[API_URL_ENV];
  if (fromEnv) return fromEnv;
  if (!existsSync(ENV_LOCAL_FILE)) return null;
  const line = readFileSync(ENV_LOCAL_FILE, 'utf-8')
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(`${RECORDS_URL_KEY}=`));
  return line ? line.slice(RECORDS_URL_KEY.length + 1).trim() : null;
}

interface PatientFixture {
  patientUuid: string;
  audiometryUuid: string;
}

let fixture: PatientFixture | null = null;
let skipReason = '';

async function listFrom<T>(api: APIRequestContext, url: string): Promise<T[]> {
  const response = await api.get(url);
  if (!response.ok()) return [];
  const body = (await response.json()) as { data?: T[] } | T[];
  return Array.isArray(body) ? body : (body.data ?? []);
}

async function resolveFixture(): Promise<void> {
  const patientFromEnv = process.env[PATIENT_ENV];
  const audiometryFromEnv = process.env[AUDIOMETRY_ENV];
  if (patientFromEnv && audiometryFromEnv) {
    fixture = { patientUuid: patientFromEnv, audiometryUuid: audiometryFromEnv };
    return;
  }

  const recordsUrl = readRecordsUrl();
  if (!recordsUrl) {
    skipReason = `No se pudo resolver el API: define ${API_URL_ENV} o ${PATIENT_ENV} y ${AUDIOMETRY_ENV}`;
    return;
  }

  const api = await playwrightRequest.newContext({
    baseURL: recordsUrl,
    extraHTTPHeaders: { Authorization: `Bearer ${readToken()}` },
  });
  try {
    const patients = await listFrom<PatientListItem>(
      api,
      `/patients?page=1&limit=${PATIENTS_PAGE_SIZE}`,
    );
    for (const patient of patients.slice(0, MAX_PATIENTS_TO_PROBE)) {
      const entries = await listFrom<AudiometryListItem>(
        api,
        `/patients/${patient.uuid}/audiometry-entries`,
      );
      if (entries.length > 0) {
        fixture = { patientUuid: patient.uuid, audiometryUuid: entries[0].uuid };
        return;
      }
    }
    skipReason = `Ningún paciente de los primeros ${MAX_PATIENTS_TO_PROBE} tiene audiometría: define ${PATIENT_ENV} y ${AUDIOMETRY_ENV}`;
  } finally {
    await api.dispose();
  }
}

test.beforeAll(async () => {
  if (!existsSync(SESSION_FILE)) {
    throw new Error('Falta e2e/.auth/session.json: corre primero e2e/login.spec.ts');
  }
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  await resolveFixture();
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

async function openPage(page: Page, route: string) {
  await page.setViewportSize({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
  await page.goto(route);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(SETTLE_MS);
}

async function reloadPage(page: Page) {
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(SETTLE_MS);
}

/** Estado de cada elemento con aria-expanded: nombre y si está abierto. */
async function expandedStates(scope: Locator) {
  return scope.evaluateAll((elements) =>
    elements.map((element) => ({
      name: (element.textContent ?? '').trim().slice(0, 40),
      isExpanded: element.getAttribute('aria-expanded') === 'true',
    })),
  );
}

async function expectAllClosed(scope: Locator, label: string) {
  const states = await expandedStates(scope);
  expect(states.length, `${label}: hay acordeones`).toBeGreaterThan(0);
  expect(
    states.filter((state) => state.isExpanded),
    `${label}: abiertos`,
  ).toEqual([]);
}

async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}.png`, fullPage: true });
}

function patientRoute(): string {
  if (!fixture) throw new Error('Sin paciente de prueba');
  return `${PATIENTS_ROUTE}/${fixture.patientUuid}`;
}

test('Configuración → Formularios: cerrados al entrar y tras recargar; tocar abre', async ({
  page,
}) => {
  await openPage(page, QUESTIONS_ROUTE);
  const accordions = page.locator(EXPANDED_SELECTOR);
  await expectAllClosed(accordions, 'al entrar');
  await screenshot(page, 'formularios-al-entrar');

  await reloadPage(page);
  await expectAllClosed(page.locator(EXPANDED_SELECTOR), 'tras recargar');

  const first = page.locator(EXPANDED_SELECTOR).first();
  await first.click();
  await expect(first, 'la sección tocada se abre').toHaveAttribute('aria-expanded', 'true');
  await screenshot(page, 'formularios-seccion-abierta');
});

test.describe('Expediente de paciente', () => {
  test.beforeEach(() => {
    test.skip(!fixture, skipReason);
  });

  test('todos los acordeones cerrados al entrar y tras recargar', async ({ page }) => {
    await openPage(page, patientRoute());
    await expectAllClosed(page.locator(EXPANDED_SELECTOR), 'al entrar');
    await screenshot(page, 'expediente-al-entrar');

    await reloadPage(page);
    await expectAllClosed(page.locator(EXPANDED_SELECTOR), 'tras recargar');
  });

  test('abrir "Formularios" no abre su sección interna', async ({ page }) => {
    await openPage(page, patientRoute());
    const questions = page.getByRole('button', { name: TITLE_QUESTIONS }).first();
    await questions.click();
    await expect(questions).toHaveAttribute('aria-expanded', 'true');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(SETTLE_MS);

    const regionId = await questions.getAttribute('aria-controls');
    const inner = page.locator(`[id="${regionId}"] [aria-expanded]`);
    await expectAllClosed(inner, 'secciones internas');
    await screenshot(page, 'expediente-formularios-abierto');
  });

  test('"Audiometría" se abre a mano', async ({ page }) => {
    await openPage(page, patientRoute());
    const audiometry = page.getByRole('button', { name: TITLE_AUDIOMETRY }).first();
    await expect(audiometry).toHaveAttribute('aria-expanded', 'false');
    await audiometry.click();
    await expect(audiometry).toHaveAttribute('aria-expanded', 'true');
    await screenshot(page, 'expediente-audiometria-manual');
  });

  test('?audiometria=<uuid> de una entrada real abre Audiometría', async ({ page }) => {
    if (!fixture) throw new Error('Sin paciente de prueba');
    await openPage(page, `${patientRoute()}?${AUDIOMETRY_QUERY_PARAM}=${fixture.audiometryUuid}`);
    const audiometry = page.getByRole('button', { name: TITLE_AUDIOMETRY }).first();
    await expect(audiometry).toHaveAttribute('aria-expanded', 'true');
    await screenshot(page, 'expediente-audiometria-por-enlace');
  });
});
