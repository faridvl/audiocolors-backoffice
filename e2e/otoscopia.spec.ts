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
const VIEWPORTS = [375, 1024, 1440];
const VIEWPORT_HEIGHT = 900;
const DEFAULT_VIEWPORT = { width: 1280, height: 720 };
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
    if (status >= HTTP_ERROR_MIN) {
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

const CLEAR_BUTTON = "Limpiar";

test("1. la tarjeta siempre trae el formulario de otoscopia nueva", async ({
  page,
}) => {
  await gotoPatient(page);
  const current = card(page);
  await expect(current.locator("#otoscopyRight")).toBeVisible();
  await expect(current.locator("#otoscopyLeft")).toBeVisible();
  await expect(current.getByText("0/1000")).toHaveCount(2);
  await expect(
    current.getByRole("button", { name: SAVE_BUTTON }),
  ).toBeDisabled();
  await expect(current.getByRole("button", { name: CLEAR_BUTTON })).toHaveCount(
    0,
  );
  await expect(current.getByText("Último registro")).toHaveCount(0);
  await expect(
    current.getByRole("button", { name: /Ver anteriores/ }),
  ).toHaveCount(0);
  await expect(
    current.getByRole("button", { name: "Nueva otoscopia" }),
  ).toHaveCount(0);
  await expect(current.getByRole("button", { name: "Editar" })).toHaveCount(0);
  await shootAt(page, "tarjeta-formulario", card);
});

test("2. guarda con OD y OI, el doble clic genera un solo POST y la tarjeta queda limpia", async ({
  page,
}) => {
  await gotoPatient(page);
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

  await expect(page.getByText("Otoscopia guardada")).toBeVisible();
  await expect(page.locator("#otoscopyRight")).toHaveValue("");
  await expect(page.locator("#otoscopyLeft")).toHaveValue("");
  await expect(
    card(page).getByRole("button", { name: SAVE_BUTTON }),
  ).toBeDisabled();
  await expect(
    card(page).getByRole("button", { name: CLEAR_BUTTON }),
  ).toHaveCount(0);
  expect(posts).toHaveLength(1);
});

test("3. guarda con solo OD y deja la tarjeta lista para otra", async ({
  page,
}) => {
  await gotoPatient(page);
  await fillAndSave(page, text("OD solo"), null);
  const post = page.waitForResponse(isOtoscopyPost);
  await page.getByRole("button", { name: SAVE_BUTTON }).click();
  expect((await post).status()).toBe(201);

  await expect(page.getByText("Otoscopia guardada")).toBeVisible();
  await expect(page.locator("#otoscopyRight")).toHaveValue("");
  await expect(page.locator("#otoscopyLeft")).toHaveValue("");
});

test('4. "Limpiar" solo aparece con texto y vacía los campos sin guardar', async ({
  page,
}) => {
  await gotoPatient(page);
  const clear = card(page).getByRole("button", { name: CLEAR_BUTTON });
  await expect(clear).toHaveCount(0);

  await fillAndSave(page, text("OD borrador"), text("OI borrador"));
  await expect(clear).toBeVisible();
  await expect(
    card(page).getByRole("button", { name: SAVE_BUTTON }),
  ).toBeEnabled();
  await clear.click();

  await expect(page.locator("#otoscopyRight")).toHaveValue("");
  await expect(page.locator("#otoscopyLeft")).toHaveValue("");
  await expect(clear).toHaveCount(0);
  await expect(
    card(page).getByRole("button", { name: SAVE_BUTTON }),
  ).toBeDisabled();
});

test("5. la tarjeta ya no muestra la nota de corrección del mismo día", async ({
  page,
}) => {
  await gotoPatient(page);
  await expect(
    card(page).getByText("Lo puedes corregir hoy; después queda fijo."),
  ).toHaveCount(0);
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

test("7. guardar y cerrar el acordeón de Formularios: sale el aviso y la tarjeta queda limpia", async ({
  page,
}) => {
  await gotoPatient(page);
  await fillAndSave(page, text("OD siete"), text("OI siete"));
  await page.getByRole("button", { name: SAVE_BUTTON }).click();
  // Enseguida, sin esperar al guardado, se abre y cierra el acordeón de Formularios.
  const questions = page.getByRole("button", { name: /^Formularios/ });
  await questions.click();
  await questions.click();

  await expect(page.getByText("Otoscopia guardada")).toBeVisible();
  await expect(page.locator("#otoscopyRight")).toHaveValue("");
});

test("8. la tarjeta de Formularios carga sin errores y tiene captura", async ({
  page,
}) => {
  await gotoPatient(page);
  const questions = page.getByRole("button", { name: /^Formularios/ });
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
