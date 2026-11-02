import { execFileSync } from "node:child_process";
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
const SCREENSHOT_DIR = "test-results/otoscopia";
const DB_CONTAINER = "audiocolors-prueba-db";
const DB_USER = "admin";
const DB_NAME = "saas_medical_records";
const AGED_DAYS = 3;
const VIEWPORTS = [375, 1024, 1440];
const VIEWPORT_HEIGHT = 900;
const DEFAULT_VIEWPORT = { width: 1280, height: 720 };
const HTTP_CONFLICT = 409;
const HTTP_ERROR_MIN = 400;
const FETCH_RESOURCE_ERROR = "Failed to load resource";

const CARD_TITLE = "Exploración física (Otoscopia)";
const SAVE_BUTTON = "Guardar otoscopia";

test.use({ storageState: SESSION_FILE });
test.describe.configure({ mode: "serial" });

let api: APIRequestContext;
let patientUuid = "";
let token = "";

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

async function createEntryViaApi(
  otoscopyRight?: string,
  otoscopyLeft?: string,
): Promise<string> {
  const response = await api.post(`/patients/${patientUuid}/otoscopy-entries`, {
    data: { otoscopyRight, otoscopyLeft },
  });
  expect(response.status()).toBe(201);
  return ((await response.json()) as { uuid: string }).uuid;
}

function ageEntryInDatabase(entryUuid: string) {
  const sql = `UPDATE "PatientOtoscopyEntry" SET "createdAt" = now() - interval '${AGED_DAYS} days' WHERE uuid = '${entryUuid}'`;
  execFileSync("docker", [
    "exec",
    DB_CONTAINER,
    "psql",
    "-U",
    DB_USER,
    "-d",
    DB_NAME,
    "-v",
    "ON_ERROR_STOP=1",
    "-c",
    sql,
  ]);
}

const card = (page: Page): Locator =>
  page
    .locator("section")
    .filter({ has: page.getByText(CARD_TITLE, { exact: true }) })
    .last();

const gotoPatient = async (page: Page) => {
  await page.goto(`${PATIENT_ROUTE}/${patientUuid}`);
  await expect(page.getByText(CARD_TITLE, { exact: true })).toBeVisible();
};

async function fillAndSave(
  page: Page,
  right: string | null,
  left: string | null,
) {
  if (right !== null) await page.locator("#otoscopyRight").fill(right);
  if (left !== null) await page.locator("#otoscopyLeft").fill(left);
}

const isOtoscopyPost = (response: Response) =>
  response.url().endsWith(`/patients/${patientUuid}/otoscopy-entries`) &&
  response.request().method() === "POST";

async function shootAt(
  page: Page,
  name: string,
  target: (page: Page) => Locator,
) {
  for (const width of VIEWPORTS) {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    const locator = target(page);
    await locator.scrollIntoViewIfNeeded();
    await locator.screenshot({
      path: `${SCREENSHOT_DIR}/${name}-${width}.png`,
    });
  }
  await page.setViewportSize(DEFAULT_VIEWPORT);
}

const openOlder = async (page: Page) => {
  await card(page)
    .getByRole("button", { name: /Ver anteriores \(\d+\)/ })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return dialog;
};

test.beforeAll(async () => {
  token = readToken();
  api = await playwrightRequest.newContext({
    baseURL: RECORDS_URL,
    extraHTTPHeaders: { Authorization: `Bearer ${token}` },
  });
  const response = await api.post("/patients", {
    data: {
      firstName: "Otoscopia",
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

test("1. crea una otoscopia con OD y OI; el doble clic genera un solo POST", async ({
  page,
}) => {
  await gotoPatient(page);
  await page.getByRole("button", { name: "Nueva otoscopia" }).click();
  await fillAndSave(page, text("OD uno"), text("OI uno"));

  const posts: string[] = [];
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      request.url().includes("/otoscopy-entries")
    ) {
      posts.push(request.url());
    }
  });
  await page.getByRole("button", { name: SAVE_BUTTON }).dblclick();

  const latest = card(page).locator("article");
  await expect(latest.getByText("Último registro")).toBeVisible();
  await expect(latest.getByText(text("OD uno"))).toBeVisible();
  await expect(latest.getByText(text("OI uno"))).toBeVisible();
  // Fecha con año y autor: "dd mmm yyyy, hh:mm · Autor".
  await expect(latest.getByText(/\b20\d{2}\b.* · \S+/)).toBeVisible();
  expect(posts).toHaveLength(1);
  await shootAt(page, "tarjeta-con-datos", card);
});

test("2. segunda otoscopia: anteriores de la más reciente a la más vieja", async ({
  page,
}) => {
  await gotoPatient(page);
  await page.getByRole("button", { name: "Nueva otoscopia" }).click();
  await fillAndSave(page, text("OD dos"), text("OI dos"));
  await page.getByRole("button", { name: SAVE_BUTTON }).click();
  await expect(
    card(page).locator("article").getByText(text("OD dos")),
  ).toBeVisible();

  await createEntryViaApi(text("OD tres"), text("OI tres"));
  await gotoPatient(page);
  await expect(
    card(page).locator("article").getByText(text("OD tres")),
  ).toBeVisible();

  const dialog = await openOlder(page);
  const rows = dialog.locator("button[aria-expanded]");
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText(
    `OD: ${text("OD dos")} · OI: ${text("OI dos")}`,
  );
  await expect(rows.nth(1)).toContainText(
    `OD: ${text("OD uno")} · OI: ${text("OI uno")}`,
  );
  await shootAt(page, "modal-anteriores", (current) =>
    current.getByRole("dialog"),
  );
});

test('3. otoscopia solo con OD muestra "Sin registrar" en el OI', async ({
  page,
}) => {
  await gotoPatient(page);
  await page.getByRole("button", { name: "Nueva otoscopia" }).click();
  await fillAndSave(page, text("OD solo"), null);
  await page.getByRole("button", { name: SAVE_BUTTON }).click();

  const latest = card(page).locator("article");
  await expect(latest.getByText(text("OD solo"))).toBeVisible();
  await expect(latest.getByText("Sin registrar")).toBeVisible();

  await createEntryViaApi(text("OD cuatro"), text("OI cuatro"));
  await gotoPatient(page);
  const dialog = await openOlder(page);
  const soloRow = dialog
    .locator("button[aria-expanded]")
    .filter({ hasText: text("OD solo") });
  await soloRow.click();
  await expect(dialog.getByText("Sin registrar")).toBeVisible();
});

test('4. corrige la otoscopia del día: PATCH 200 y "Corregido por"', async ({
  page,
}) => {
  await gotoPatient(page);
  await card(page).getByRole("button", { name: "Editar" }).click();
  await page.locator("#otoscopyRight").fill(text("OD corregido"));

  const patch = page.waitForResponse(
    (response) =>
      response.request().method() === "PATCH" &&
      response.url().includes("/otoscopy-entries/"),
  );
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  expect((await patch).status()).toBe(200);

  const latest = card(page).locator("article");
  await expect(latest.getByText(text("OD corregido"))).toBeVisible();
  await expect(latest.getByText(/Corregido por/)).toBeVisible();
});

test("5. corregir un registro de otro día da 409, avisa y se guarda como nuevo", async ({
  page,
}) => {
  expectedStatuses = [HTTP_CONFLICT];
  const entryUuid = await createEntryViaApi(text("OD viejo"), text("OI viejo"));
  await gotoPatient(page);
  await expect(
    card(page).locator("article").getByText(text("OD viejo")),
  ).toBeVisible();
  await card(page).getByRole("button", { name: "Editar" }).click();
  await page.locator("#otoscopyRight").fill(text("OD tarde"));

  // Con el formulario abierto, el registro "envejece": el API lo rechaza como de otro día.
  ageEntryInDatabase(entryUuid);

  const patch = page.waitForResponse(
    (response) =>
      response.request().method() === "PATCH" &&
      response.url().includes("/otoscopy-entries/"),
  );
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  expect((await patch).status()).toBe(HTTP_CONFLICT);

  await expect(
    page.getByRole("alert").filter({ hasText: /no es de hoy/ }),
  ).toBeVisible();
  await expect(page.locator("#otoscopyRight")).toHaveValue(text("OD tarde"));

  const post = page.waitForResponse(isOtoscopyPost);
  await page.getByRole("button", { name: "Guardar como nuevo" }).click();
  expect((await post).status()).toBe(201);
  await expect(
    card(page).locator("article").getByText(text("OD tarde")),
  ).toBeVisible();
});

test("6. API: PUT physical-exam aparece en otoscopy-entries", async () => {
  const marker = text("OD puesta");
  const put = await api.put(`/patients/${patientUuid}/physical-exam`, {
    data: { otoscopyRight: marker, otoscopyLeft: text("OI puesta") },
  });
  expect(put.status(), await put.text()).toBeLessThan(HTTP_ERROR_MIN);

  const list = await api.get(`/patients/${patientUuid}/otoscopy-entries`);
  expect(list.status()).toBe(200);
  const entries = (await list.json()) as { otoscopyRight: string | null }[];
  expect(entries.some((entry) => entry.otoscopyRight === marker)).toBe(true);
});

test("7. guardar y cerrar el acordeón de Preguntas: sale el aviso y la lista se refresca", async ({
  page,
}) => {
  await gotoPatient(page);
  await page.getByRole("button", { name: "Nueva otoscopia" }).click();
  await fillAndSave(page, text("OD siete"), text("OI siete"));
  await page.getByRole("button", { name: SAVE_BUTTON }).click();
  // Enseguida, sin esperar al guardado, se abre y cierra el acordeón de Preguntas.
  const questions = page.getByRole("button", { name: /^Preguntas/ });
  await questions.click();
  await questions.click();

  await expect(page.getByText("Otoscopia guardada")).toBeVisible();
  await expect(
    card(page).locator("article").getByText(text("OD siete")),
  ).toBeVisible();
});

test("8. la tarjeta de Preguntas carga sin errores y tiene captura", async ({
  page,
}) => {
  await gotoPatient(page);
  const questions = page.getByRole("button", { name: /^Preguntas/ });
  await questions.click();
  await expect(questions).toHaveAttribute("aria-expanded", "true");
  await page.waitForLoadState("networkidle");
  const section = page
    .locator("section, div")
    .filter({ has: questions })
    .last();
  await shootAt(page, "preguntas", () => section);
});

test.skip("9. STAFF no ve la tarjeta de otoscopia", () => {
  // No hay un usuario STAFF a mano en el ambiente local (solo la cuenta OWNER del e2e).
});
