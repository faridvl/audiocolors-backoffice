import { readFileSync } from "node:fs";
import {
  APIRequestContext,
  Locator,
  Page,
  Response,
  expect,
  request as playwrightRequest,
  test,
} from "@playwright/test";

const SESSION_FILE = "e2e/.auth/session.json";
const SESSION_COOKIE = "SESSION_ACCESS_TOKEN";
const RECORDS_URL = "http://localhost:7071";
const PATIENT_ROUTE = "/pacientes";
const SCREENSHOT_DIR = "test-results/laboratorio";
const VIEWPORTS = [375, 1024, 1440];
const VIEWPORT_HEIGHT = 900;
const DEFAULT_VIEWPORT = { width: 1280, height: 720 };
const HTTP_BAD_REQUEST = 400;
const HTTP_ERROR_MIN = 400;
const FETCH_RESOURCE_ERROR = "Failed to load resource";
const CLINIC_TIME_ZONE = "America/Costa_Rica";
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const SENT_DAYS_AGO = 2;
const BEFORE_SENT_DAYS_AGO = 5;
const EXTRA_SHIPMENTS = 3;
const LONG_NOTE_LENGTH = 420;

const SWITCH_NAME = /Audífonos en laboratorio/;
const DELIVERY_TITLE = "Entrega de audífonos";
const SAVE_DELIVERY = "Guardar entrega";
const HISTORY_TITLE = "Historial de envíos";

test.use({ storageState: SESSION_FILE });
test.describe.configure({ mode: "serial" });

let api: APIRequestContext;
let patientUuid = "";

const stamp = Date.now().toString(36);
const text = (label: string) => `${label} ${stamp}`;

const consoleErrors: string[] = [];
const badResponses: string[] = [];
let expectedStatuses: number[] = [];

function readToken(): string {
  const state = JSON.parse(readFileSync(SESSION_FILE, "utf-8")) as {
    cookies: { name: string; value: string }[];
  };
  const cookie = state.cookies.find((item) => item.name === SESSION_COOKIE);
  if (!cookie)
    throw new Error(
      "La sesión no trae SESSION_ACCESS_TOKEN: corre yarn e2e:login",
    );
  return decodeURIComponent(cookie.value);
}

/** Día "YYYY-MM-DD" de Costa Rica, con un desfase en días respecto de hoy. */
function clinicDay(offsetDays = 0): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIME_ZONE,
  }).format(new Date(Date.now() + offsetDays * MS_PER_DAY));
}

async function setFlag(data: Record<string, unknown>) {
  const response = await api.put(`/patients/${patientUuid}/flags`, { data });
  expect(response.status(), await response.text()).toBe(200);
}

const dialog = (page: Page): Locator => page.getByRole("dialog");
const history = (page: Page): Locator =>
  dialog(page).getByRole("region", { name: HISTORY_TITLE });
const labSwitch = (page: Page): Locator =>
  dialog(page).getByRole("switch", { name: SWITCH_NAME });

async function openFlags(page: Page) {
  await page.goto(`${PATIENT_ROUTE}/${patientUuid}`);
  await page.getByRole("button", { name: "Indicadores" }).click();
  await expect(dialog(page)).toBeVisible();
  await expect(
    dialog(page).getByRole("heading", { name: HISTORY_TITLE }),
  ).toBeVisible();
}

const isFlagsPut = (response: Response) =>
  response.url().endsWith(`/patients/${patientUuid}/flags`) &&
  response.request().method() === "PUT";

async function expectNoHorizontalScroll(page: Page, locator: Locator) {
  const overflow = await locator.evaluate((element) => ({
    page: document.documentElement.scrollWidth - window.innerWidth,
    element: element.scrollWidth - element.clientWidth,
  }));
  expect(overflow.page, "scroll horizontal de la página").toBeLessThanOrEqual(
    0,
  );
  expect(overflow.element, "scroll horizontal del modal").toBeLessThanOrEqual(
    0,
  );
}

async function shootAt(
  page: Page,
  name: string,
  target: (page: Page) => Locator,
) {
  for (const width of VIEWPORTS) {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    const locator = target(page);
    await locator.scrollIntoViewIfNeeded();
    await expectNoHorizontalScroll(page, locator);
    await locator.screenshot({
      path: `${SCREENSHOT_DIR}/${name}-${width}.png`,
    });
  }
  await page.setViewportSize(DEFAULT_VIEWPORT);
}

test.beforeAll(async () => {
  api = await playwrightRequest.newContext({
    baseURL: RECORDS_URL,
    extraHTTPHeaders: { Authorization: `Bearer ${readToken()}` },
  });
  const response = await api.post("/patients", {
    data: {
      firstName: "Laboratorio",
      lastName: `Prueba ${stamp}`,
      birthDate: "1985-06-15",
    },
  });
  expect(response.status(), await response.text()).toBeLessThan(HTTP_ERROR_MIN);
  patientUuid = ((await response.json()) as { uuid: string }).uuid;
});

test.afterAll(async () => {
  await api.dispose();
});

test.beforeEach(async ({ page }) => {
  consoleErrors.length = 0;
  badResponses.length = 0;
  expectedStatuses = [];
  page.on("console", (message) => {
    // El navegador repite cada 4xx/5xx como "Failed to load resource": ya lo cubre el guard de respuestas.
    if (
      message.type() === "error" &&
      !message.text().includes(FETCH_RESOURCE_ERROR)
    ) {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("response", (response) => {
    const status = response.status();
    if (status >= HTTP_ERROR_MIN && !expectedStatuses.includes(status)) {
      badResponses.push(
        `${status} ${response.request().method()} ${response.url()}`,
      );
    }
  });
});

test.afterEach(() => {
  expect(consoleErrors, "console.error inesperado").toEqual([]);
  expect(badResponses, "respuestas 4xx/5xx inesperadas").toEqual([]);
});

test("1. prender con fecha guarda el envío y lo muestra en el historial", async ({
  page,
}) => {
  await openFlags(page);
  await expect(
    history(page).getByText("Todavía no hay envíos registrados."),
  ).toBeVisible();

  await labSwitch(page).click();
  await page.locator("#lab-shipment-date").fill(clinicDay(-SENT_DAYS_AGO));
  const put = page.waitForResponse(isFlagsPut);
  await dialog(page)
    .getByRole("button", { name: "Guardar", exact: true })
    .click();
  expect((await put).status()).toBe(200);

  await expect(labSwitch(page)).toBeChecked();
  await expect(history(page).getByText(/^En laboratorio desde /)).toBeVisible();
  await expect(history(page).locator("li")).toHaveCount(1);
});

test("2. apagar y cancelar deja el envío abierto", async ({ page }) => {
  await openFlags(page);
  await labSwitch(page).click();

  await expect(dialog(page).getByText(DELIVERY_TITLE)).toBeVisible();
  await expect(page.locator("#lab-delivery-date")).toHaveValue(clinicDay());
  await expect(dialog(page).getByText("0 / 1000")).toBeVisible();
  await expect(
    dialog(page).getByRole("button", { name: "Listo" }),
  ).toBeHidden();
  await shootAt(page, "formulario-entrega", dialog);

  await dialog(page).getByRole("button", { name: "Cancelar" }).click();
  await expect(dialog(page).getByText(DELIVERY_TITLE)).toBeHidden();
  await expect(labSwitch(page)).toBeChecked();
  await expect(
    dialog(page).getByRole("button", { name: "Listo" }),
  ).toBeVisible();
  await expect(history(page).locator("li")).toHaveCount(1);
});

test("3. una fecha anterior al envío muestra el error del API y deja abierto el formulario", async ({
  page,
}) => {
  expectedStatuses = [HTTP_BAD_REQUEST];
  await openFlags(page);
  await labSwitch(page).click();
  await page
    .locator("#lab-delivery-date")
    .fill(clinicDay(-BEFORE_SENT_DAYS_AGO));

  const put = page.waitForResponse(isFlagsPut);
  await dialog(page).getByRole("button", { name: SAVE_DELIVERY }).click();
  expect((await put).status()).toBe(HTTP_BAD_REQUEST);

  const error = dialog(page).locator("[aria-live='polite']");
  await expect(error).not.toBeEmpty();
  await expect(dialog(page).getByText(DELIVERY_TITLE)).toBeVisible();
  await expect(
    dialog(page).getByRole("button", { name: SAVE_DELIVERY }),
  ).toBeEnabled();
  await shootAt(page, "error-fecha", dialog);
});

test("4. entregar con nota: doble clic da un solo PUT, queda en el historial y en Control de evolución", async ({
  page,
}) => {
  const note = text("Entregados con ajuste");
  await openFlags(page);
  await labSwitch(page).click();
  await page.locator("#lab-delivery-note").fill(note);
  await expect(dialog(page).getByText(`${note.length} / 1000`)).toBeVisible();

  const puts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "PUT" && request.url().endsWith("/flags")) {
      puts.push(request.url());
    }
  });
  await dialog(page).getByRole("button", { name: SAVE_DELIVERY }).dblclick();

  await expect(
    page.getByText("Entrega registrada", { exact: true }),
  ).toBeVisible();
  await expect(labSwitch(page)).not.toBeChecked();
  expect(puts).toHaveLength(1);

  const row = history(page).locator("li").first();
  await expect(row).toContainText(/Enviado .* · Entregado /);
  await expect(row).toContainText(note);
  await expect(row).toContainText(/Entrega registrada por \S+/);
  await shootAt(page, "historial-entregado", dialog);

  await dialog(page).getByRole("button", { name: "Listo" }).click();
  await expect(dialog(page)).toBeHidden();
  await expect(page.getByText(note).first()).toBeVisible();
});

test("5. historial con varios envíos: 3 visibles, Ver todos y nota larga con Ver más", async ({
  page,
}) => {
  const longNote = `${text("Nota larga")} ${"detalle del ajuste ".repeat(
    LONG_NOTE_LENGTH / 19,
  )}`.slice(0, LONG_NOTE_LENGTH);
  for (let index = 0; index < EXTRA_SHIPMENTS; index += 1) {
    await setFlag({
      hearingAidsInLab: true,
      hearingAidsInLabDate: clinicDay(),
    });
    await setFlag({
      hearingAidsInLab: false,
      deliveredAt: clinicDay(),
      ...(index === EXTRA_SHIPMENTS - 1 ? { note: longNote } : {}),
    });
  }

  await openFlags(page);
  const total = EXTRA_SHIPMENTS + 1;
  await expect(history(page).locator("li")).toHaveCount(3);
  await expect(
    history(page).getByRole("button", { name: `Ver todos (${total})` }),
  ).toBeVisible();

  const moreNote = history(page).getByRole("button", { name: "Ver más" });
  await expect(moreNote).toBeVisible();
  await moreNote.click();
  await expect(
    history(page).getByRole("button", { name: "Ver menos" }).first(),
  ).toBeVisible();
  await shootAt(page, "historial-nota-larga", dialog);

  await history(page)
    .getByRole("button", { name: `Ver todos (${total})` })
    .click();
  await expect(history(page).locator("li")).toHaveCount(total);
  await shootAt(page, "historial-completo", dialog);
});

test("6. la bitácora registra la entrega", async ({ page }) => {
  const response = await api.get(`/patients/${patientUuid}/lab-shipments`);
  expect(response.status()).toBe(200);
  const shipments = (await response.json()) as { deliveredAt: string | null }[];
  expect(shipments.every((shipment) => shipment.deliveredAt)).toBe(true);

  await page.goto("/bitacora");
  await expect(
    page.getByText(/Registró la entrega de audífonos del laboratorio/).first(),
  ).toBeVisible();
});
