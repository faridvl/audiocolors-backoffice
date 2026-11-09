import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { Locator, Page, expect, test } from '@playwright/test';

// Solo lectura: corre contra el API remoto de desarrollo, así que toda escritura se aborta.
const SESSION_FILE = 'e2e/.auth/session.json';
const MESSAGES_FILE = 'src/static/texts/es.json';
const SCREENSHOT_DIR = 'test-results/qa-configuracion-estandar/C';
const SETTINGS_ROOT = '/configuracion';
const HTTP_ERROR_MIN = 400;
const VIEWPORT_HEIGHT = 900;
const MAX_TAB_PRESSES = 60;
const PIXEL_TOLERANCE = 2;
const FIELD_TOLERANCE = 8;
const SETTLE_MS = 400;
const NAV_SELECTOR = 'nav[aria-label="Configuración"]';
const CONTENT_COLUMN = 'aside + div';
const CARD_SELECTOR = '[class*="rounded-card"]';
const READ_ONLY_METHODS = ['GET', 'HEAD', 'OPTIONS'];

const WIDTH_MOBILE = 375;
const WIDTH_LAPTOP = 1024;
const WIDTH_DESKTOP = 1440;
const WIDTHS = [WIDTH_MOBILE, WIDTH_LAPTOP, WIDTH_DESKTOP];

const WIDTH_PHONE = 320;
const WIDTH_WIDE_FIELD = 448;
const WIDTH_DURATION = 192;

interface SectionSpec {
  key: string;
  route: string;
  title: string;
  description: string;
}

const SECTIONS: SectionSpec[] = [
  { key: 'CLINIC', route: '/configuracion/clinica', title: 'Clínica', description: '' },
  { key: 'USERS', route: '/configuracion/usuarios', title: 'Usuarios', description: '' },
  {
    key: 'APPOINTMENT_TYPES',
    route: '/configuracion/tipos-de-cita',
    title: 'Tipos de cita',
    description: '',
  },
  { key: 'QUESTIONS', route: '/configuracion/preguntas', title: 'Formularios', description: '' },
  { key: 'TEMPLATES', route: '/configuracion/plantillas', title: 'Plantillas', description: '' },
];

const EXPECTED_MENU = [
  { group: 'Tu clínica', items: ['Clínica', 'Usuarios'] },
  { group: 'Atención', items: ['Tipos de cita', 'Formularios', 'Plantillas'] },
];

interface SettingsMessages {
  settings: { sections: Record<string, { title: string; description: string }> };
}

const messages = JSON.parse(readFileSync(MESSAGES_FILE, 'utf-8')) as SettingsMessages;
const sections = SECTIONS.map((section) => ({
  ...section,
  title: messages.settings.sections[section.key].title,
  description: messages.settings.sections[section.key].description,
}));

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

async function openSection(page: Page, route: string, width: number) {
  await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
  await page.goto(route);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(SETTLE_MS);
}

async function box(locator: Locator, label: string) {
  await expect(locator.first(), `${label} visible`).toBeVisible();
  const result = await locator.first().boundingBox();
  if (!result) throw new Error(`${label}: sin caja`);
  return result;
}

async function hasVisibleFocus(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const hasOutline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
    return hasOutline || style.boxShadow !== 'none';
  });
}

/** Avanza con Tab hasta que el foco cae en el enlace; devuelve cuántos Tab hicieron falta. */
async function tabTo(page: Page, link: Locator) {
  for (let presses = 1; presses <= MAX_TAB_PRESSES; presses += 1) {
    await page.keyboard.press('Tab');
    const isFocused = await link.evaluate((element) => element === document.activeElement);
    if (isFocused) return presses;
  }
  return -1;
}

test('menú a 1440: orden, foco visible y Enter', async ({ page }) => {
  await test.step('orden de grupos e ítems', async () => {
    await openSection(page, '/configuracion/clinica', WIDTH_DESKTOP);
    const groups = page.locator(`${NAV_SELECTOR} [role="group"]`);
    await expect(groups).toHaveCount(EXPECTED_MENU.length);

    const actual = [];
    for (let index = 0; index < EXPECTED_MENU.length; index += 1) {
      const group = groups.nth(index);
      const labelId = await group.getAttribute('aria-labelledby');
      const title = (await page.locator(`[id="${labelId}"]`).innerText()).trim();
      const items = (await group.getByRole('link').allInnerTexts()).map((text) => text.trim());
      actual.push({ group: title.toLowerCase(), items });
    }
    expect(actual).toEqual(
      EXPECTED_MENU.map(({ group, items }) => ({ group: group.toLowerCase(), items })),
    );
  });

  await test.step('Tab llega a cada ítem con foco visible', async () => {
    await openSection(page, '/configuracion/clinica', WIDTH_DESKTOP);
    const links = page.locator(`${NAV_SELECTOR} a`);
    const total = await links.count();
    expect(total).toBe(sections.length);
    for (let index = 0; index < total; index += 1) {
      const link = links.nth(index);
      const name = (await link.innerText()).trim();
      const presses = await tabTo(page, link);
      expect.soft(presses, `Tab llega a "${name}"`).toBeGreaterThan(0);
      if (presses > 0) {
        expect.soft(await hasVisibleFocus(link), `foco visible en "${name}"`).toBe(true);
      }
    }
  });

  for (const section of sections) {
    await test.step(`Enter en "${section.title}" navega y deja un solo aria-current`, async () => {
      await openSection(page, '/configuracion/clinica', WIDTH_DESKTOP);
      const link = page.locator(`${NAV_SELECTOR} a`, { hasText: section.title });
      const presses = await tabTo(page, link);
      expect(presses, `Tab llega a "${section.title}"`).toBeGreaterThan(0);
      await page.keyboard.press('Enter');
      await page.waitForURL(`**${section.route}`);
      await page.waitForLoadState('networkidle');
      const current = page.locator(`${NAV_SELECTOR} [aria-current="page"]`);
      await expect(current).toHaveCount(1);
      await expect(current).toHaveText(new RegExp(section.title));
    });
  }
});

test('portada móvil a 375: grupos con descripción y navegación', async ({ page }) => {
  await openSection(page, SETTINGS_ROOT, WIDTH_MOBILE);
  const groups = page.locator(`${NAV_SELECTOR} [role="group"]`);
  await expect(groups).toHaveCount(EXPECTED_MENU.length);

  for (const section of sections) {
    const link = page.locator(`${NAV_SELECTOR} a[href="${section.route}"]`);
    await expect(link, `ítem ${section.title}`).toBeVisible();
    await expect(link, `descripción de ${section.title}`).toContainText(section.description);
  }

  const target = sections[1];
  await page.locator(`${NAV_SELECTOR} a[href="${target.route}"]`).click();
  await page.waitForURL(`**${target.route}`);
});

for (const section of sections) {
  for (const width of WIDTHS) {
    test(`sección ${section.title} a ${width}: sin desborde, tarjeta y botón`, async ({
      page,
    }, testInfo) => {
      await openSection(page, section.route, width);

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect
        .soft(overflow.scrollWidth, `scrollWidth ${overflow.scrollWidth} vs clientWidth`)
        .toBeLessThanOrEqual(overflow.clientWidth);

      const column = page.locator(CONTENT_COLUMN).first();
      if (width === WIDTH_DESKTOP) {
        const card = await box(column.locator(CARD_SELECTOR), 'tarjeta de contenido');
        testInfo.annotations.push({
          type: 'tarjeta',
          description: `x=${card.x} ancho=${card.width}`,
        });
        await testInfo.attach('tarjeta', {
          body: JSON.stringify({ section: section.title, x: card.x, width: card.width }),
          contentType: 'application/json',
        });
        console.log(`CARD ${section.title} x=${card.x} ancho=${card.width}`);
      }

      const addButton = column.getByRole('button', { name: /^Nuev[oa]\b/ }).first();
      if ((await addButton.count()) > 0) {
        const button = await box(addButton, 'botón Nuevo');
        const parent = await box(addButton.locator('..'), 'contenedor del botón');
        console.log(
          `BTN ${section.title} @${width} x=${button.x} ancho=${button.width} contenedor x=${parent.x} ancho=${parent.width}`,
        );
        if (width === WIDTH_MOBILE) {
          expect
            .soft(
              Math.abs(button.width - parent.width),
              `botón ${button.width} vs contenedor ${parent.width}`,
            )
            .toBeLessThanOrEqual(PIXEL_TOLERANCE);
        }
        if (width === WIDTH_DESKTOP) {
          const buttonRight = button.x + button.width;
          const parentRight = parent.x + parent.width;
          expect
            .soft(
              Math.abs(buttonRight - parentRight),
              `borde derecho del botón ${buttonRight} vs contenedor ${parentRight}`,
            )
            .toBeLessThanOrEqual(PIXEL_TOLERANCE);
        }
      }

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/${section.route.split('/').pop()}-${width}.png`,
        fullPage: true,
      });
    });
  }
}

test('las 5 tarjetas de contenido a 1440 comparten x y ancho', async ({ page }) => {
  const measured: { title: string; x: number; width: number }[] = [];
  for (const section of sections) {
    await openSection(page, section.route, WIDTH_DESKTOP);
    const card = await box(page.locator(CONTENT_COLUMN).locator(CARD_SELECTOR), section.title);
    measured.push({ title: section.title, x: card.x, width: card.width });
  }
  const [first] = measured;
  for (const item of measured) {
    expect
      .soft(
        Math.abs(item.x - first.x),
        `x de ${item.title}: ${item.x} vs ${first.title}: ${first.x}`,
      )
      .toBeLessThanOrEqual(PIXEL_TOLERANCE);
    expect
      .soft(
        Math.abs(item.width - first.width),
        `ancho de ${item.title}: ${item.width} vs ${first.title}: ${first.width}`,
      )
      .toBeLessThanOrEqual(PIXEL_TOLERANCE);
  }
});

function expectWidth(measured: number, expected: number, label: string) {
  expect
    .soft(Math.abs(measured - expected), `${label}: medido ${measured}, esperado ${expected}`)
    .toBeLessThanOrEqual(FIELD_TOLERANCE);
}

test('anchos de campos a 1440: clínica', async ({ page }) => {
  await openSection(page, '/configuracion/clinica', WIDTH_DESKTOP);
  const phone = await box(page.locator('input[name="phone"]'), 'teléfono');
  const name = await box(page.locator('input[name="name"]'), 'nombre');
  const email = await box(page.locator('input[name="email"]'), 'correo');
  console.log(`CLINICA telefono=${phone.width} nombre=${name.width} correo=${email.width}`);
  expectWidth(phone.width, WIDTH_PHONE, 'clínica: teléfono');
  expectWidth(name.width, WIDTH_WIDE_FIELD, 'clínica: nombre');
  expectWidth(email.width, WIDTH_WIDE_FIELD, 'clínica: correo');
});

test('anchos de campos a 1440: editor de usuario', async ({ page }) => {
  await openSection(page, '/configuracion/usuarios', WIDTH_DESKTOP);
  const userLink = page
    .locator('a[href^="/configuracion/usuarios/"]:not([href$="/nuevo"])')
    .first();
  await expect(userLink, 'hay al menos un usuario').toBeVisible();
  await userLink.click();
  await page.waitForURL(/\/configuracion\/usuarios\/[^/]+$/);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(SETTLE_MS);

  const role = await box(
    page.locator('select[name="role"], input[name="role"]'),
    'nivel de acceso',
  );
  const phone = await box(page.locator('input[name="phone"]'), 'teléfono');
  console.log(`USUARIO nivel=${role.width} telefono=${phone.width}`);
  expectWidth(role.width, WIDTH_PHONE, 'usuario: nivel de acceso');
  expectWidth(phone.width, WIDTH_PHONE, 'usuario: teléfono');
});

test('anchos de campos a 1440: modal de tipo de cita', async ({ page }) => {
  await openSection(page, '/configuracion/tipos-de-cita', WIDTH_DESKTOP);
  const row = page.getByRole('button', { name: /^Editar /i }).first();
  await expect(row, 'hay al menos un tipo de cita').toBeVisible();
  await row.click();
  await expect(page.getByRole('dialog')).toBeVisible();

  const duration = await box(page.locator('#appointment-type-duration'), 'duración');
  console.log(`TIPO_CITA duracion=${duration.width}`);
  expectWidth(duration.width, WIDTH_DURATION, 'tipo de cita: duración');
});
