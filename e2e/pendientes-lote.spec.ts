import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import {
  APIRequestContext,
  Locator,
  Page,
  expect,
  request as playwrightRequest,
  test,
} from "@playwright/test";

const SESSION_FILE = "e2e/.auth/session.json";
const SESSION_COOKIE = "SESSION_ACCESS_TOKEN";
const RECORDS_URL = "http://localhost:7071";
const SCREENSHOT_DIR = "test-results/pendientes-lote";
const VIEWPORTS = [375, 1024, 1440];
const VIEWPORT_HEIGHT = 900;
const DESKTOP_WIDTH = 1280;
const HTTP_ERROR_MIN = 400;
const FETCH_RESOURCE_ERROR = "Failed to load resource";
const CLINIC_TIME_ZONE = "America/Costa_Rica";
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MINUTES_IN_HOUR = 60;
const DOCKER_CONTAINER = "audiocolors-prueba-db";
const DB_USER = "admin";
const DB_NAME = "saas_medical_records";

const EMPTY_VALUE_TEXTS = ["Sin registrar", "—", "–", "N/A"];
const MONTH_FILTER_NAME = "Próxima cita";
const UNKNOWN_ACTION_TEXT = "Otra acción";
const ACTION_UNKNOWN = "ACCION_FUTURA_XYZ";
const ACTION_WARRANTY = "WARRANTY_CHANGED";
const ACTION_MAINTENANCE_CHECK = "MAINTENANCE_CHECK_CHANGED";
const AUTHOR_NAME = "Farid Villacis";
const NOTE_TEXT = "Nota de la bitácora";
const ACTIVITY_PAGE_SIZE = 7;
const ACTIVITY_EVENTS = 8;
const MAX_EVENT_AGE_MINUTES = 10;
const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

test.use({ storageState: SESSION_FILE, timezoneId: CLINIC_TIME_ZONE });
test.describe.configure({ mode: "serial" });

let api: APIRequestContext;
let appointmentTypeUuid = "";

const stamp = Date.now().toString(36);

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

/** Día "YYYY-MM-DD" de Costa Rica, con un desfase en días respecto de hoy. */
function clinicDay(offsetDays = 0): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIME_ZONE,
  }).format(new Date(Date.now() + offsetDays * MS_PER_DAY));
}

/** Minuto del día (0-1439) en Costa Rica. */
function clinicMinutesOfDay(instant: Date): number {
  const [hours, minutes] = new Intl.DateTimeFormat("en-GB", {
    timeZone: CLINIC_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(instant)
    .split(":")
    .map(Number);
  return hours * MINUTES_IN_HOUR + minutes;
}

function sql(statement: string) {
  execFileSync(
    "docker",
    [
      "exec",
      DOCKER_CONTAINER,
      "psql",
      "-U",
      DB_USER,
      "-d",
      DB_NAME,
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      statement,
    ],
    { stdio: "pipe" },
  );
}

async function createPatient(
  firstName: string,
  lastName: string,
): Promise<string> {
  const response = await api.post("/patients", {
    data: { firstName, lastName },
  });
  expect(response.status(), await response.text()).toBeLessThan(HTTP_ERROR_MIN);
  return ((await response.json()) as { uuid: string }).uuid;
}

async function createAppointment(
  patientUuid: string,
  startIso: string,
  durationMinutes: number,
): Promise<string> {
  const endIso = new Date(
    new Date(startIso).getTime() + durationMinutes * 60 * 1000,
  ).toISOString();
  const response = await api.post("/appointments", {
    data: {
      patientUUID: patientUuid,
      typeUUID: appointmentTypeUuid,
      speciality: "AUDIOLOGY",
      status: "CONFIRMED",
      date: startIso,
      startTime: startIso,
      endTime: endIso,
    },
  });
  expect(response.status(), await response.text()).toBeLessThan(HTTP_ERROR_MIN);
  return ((await response.json()) as { uuid: string }).uuid;
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow, "scroll horizontal de la página").toBeLessThanOrEqual(0);
}

/** Captura la página a los tres anchos y exige que no haya scroll horizontal. */
async function shootAt(page: Page, name: string) {
  for (const width of VIEWPORTS) {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    await expectNoHorizontalScroll(page);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/${name}-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: DESKTOP_WIDTH, height: VIEWPORT_HEIGHT });
}

test.beforeAll(async () => {
  api = await playwrightRequest.newContext({
    baseURL: RECORDS_URL,
    extraHTTPHeaders: { Authorization: `Bearer ${readToken()}` },
  });
  const typesResponse = await api.get("/appointment-types");
  expect(typesResponse.status()).toBe(200);
  const types = (await typesResponse.json()) as {
    uuid: string;
    isControl: boolean;
    duration: number;
  }[];
  const regular = types.find((type) => !type.isControl);
  if (!regular) throw new Error("El tenant no tiene un tipo de cita normal");
  appointmentTypeUuid = regular.uuid;
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

test("1. dato vacío: la ficha y la historia muestran el campo en blanco", async ({
  page,
}) => {
  const lastName = `Vacio ${stamp}`;
  const patientUuid = await createPatient("Dato", lastName);

  await page.goto(`/pacientes/${patientUuid}`);
  await expect(page.getByText(`Dato ${lastName}`)).toBeVisible();

  // Nacimiento y Sedes siguen apareciendo, con su valor en blanco.
  for (const label of ["Nacimiento", "Sedes"]) {
    const term = page.locator("dt", { hasText: label });
    await expect(term).toBeVisible();
    await expect(term.locator("xpath=following-sibling::dd[1]")).toHaveText("");
  }

  await page.getByRole("button", { name: /Preguntas/ }).click();
  const main = page.locator("main");
  await expect(main).toBeVisible();
  const mainText = await main.innerText();
  for (const placeholder of EMPTY_VALUE_TEXTS) {
    expect(mainText, `"${placeholder}" no debe salir`).not.toContain(
      placeholder,
    );
  }
  // Todos los <dd> sin dato quedan vacíos, sin guion ni leyenda.
  const values = await page.locator("dd").allInnerTexts();
  for (const value of values) {
    expect(EMPTY_VALUE_TEXTS).not.toContain(value.trim());
  }

  await shootAt(page, "dato-vacio");
});

test("2. bitácora: indicador, nota y acciones desconocidas o viejas", async ({
  page,
}) => {
  const lastName = `Bitacora ${stamp}`;
  const patientName = `Evento ${lastName}`;
  const patientUuid = await createPatient("Evento", lastName);

  const flagsOn = await api.put(`/patients/${patientUuid}/flags`, {
    data: { hasActiveWarranty: true },
  });
  expect(flagsOn.status(), await flagsOn.text()).toBe(200);
  const flagsOff = await api.put(`/patients/${patientUuid}/flags`, {
    data: { hasActiveWarranty: false },
  });
  expect(flagsOff.status(), await flagsOff.text()).toBe(200);
  const note = await api.post(`/patients/${patientUuid}/notes`, {
    data: { text: NOTE_TEXT, category: "EVOLUTION_CONTROL" },
  });
  expect(note.status(), await note.text()).toBeLessThan(HTTP_ERROR_MIN);

  // Eventos como los dejaría otra versión: acción desconocida (con y sin detalle)
  // y acciones conocidas con un detalle viejo o vacío.
  const insertEvent = (action: string, detail: string) =>
    sql(
      `insert into "PatientActivity" (uuid, "tenantUuid", "patientUuid", "patientName", "actorUuid", action, detail) ` +
        `select gen_random_uuid()::text, "tenantUuid", "patientUuid", "patientName", "actorUuid", '${action}', ${detail} ` +
        `from "PatientActivity" where "patientUuid" = '${patientUuid}' and action = 'PATIENT_CREATED' limit 1`,
    );
  insertEvent(ACTION_UNKNOWN, `'{"campoNuevo": 1}'::jsonb`);
  insertEvent(ACTION_UNKNOWN, "null");
  insertEvent(ACTION_WARRANTY, "null");
  insertEvent(ACTION_MAINTENANCE_CHECK, `'{"viejo": true}'::jsonb`);

  await page.goto("/bitacora");
  await page.getByPlaceholder("Buscar por nombre o cédula").fill(lastName);
  const rows = page.getByRole("row").filter({ hasText: patientName });
  // 8 eventos: alta, garantía prendida y apagada, nota y los cuatro insertados.
  // La tabla muestra ACTIVITY_PAGE_SIZE por página: el más viejo (el alta) queda en la 2.
  await expect(page.getByText(`${ACTIVITY_EVENTS} registros`).first()).toBeVisible();
  await expect(rows).toHaveCount(ACTIVITY_PAGE_SIZE);

  // Fecha y hora de Costa Rica: el grupo del día dice "Hoy" con la fecha de hoy.
  const todayLabel = new Intl.DateTimeFormat("es-CR", {
    timeZone: CLINIC_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  await expect(
    page.getByRole("cell", { name: new RegExp(`^hoy · ${todayLabel}$`, "i") }),
  ).toBeVisible();
  const nowMinutes = clinicMinutesOfDay(new Date());
  for (const time of await rows.locator("td:first-child").allInnerTexts()) {
    const [hours, minutes] = time.trim().split(":").map(Number);
    expect(
      Math.abs(hours * MINUTES_IN_HOUR + minutes - nowMinutes),
      `hora ${time} lejos de la hora actual`,
    ).toBeLessThanOrEqual(MAX_EVENT_AGE_MINUTES);
  }
  // Todos los eventos los registró la misma persona.
  for (const row of await rows.all()) {
    await expect(row).toContainText(AUTHOR_NAME);
  }

  const noteRow = rows.filter({ hasText: "Nota agregada" });
  await expect(noteRow).toHaveCount(1);
  await expect(noteRow).toContainText(NOTE_TEXT);

  // Prender y apagar la garantía deja un evento cada vez; el insertado con
  // detalle vacío cuenta como apagado.
  const warrantyRows = rows.filter({ hasText: /^\s*\d{2}:\d{2}[\s\S]*Garantía/ });
  await expect(warrantyRows.filter({ hasText: "Garantía activada" })).toHaveCount(
    1,
  );
  await expect(
    warrantyRows.filter({ hasText: "Garantía desactivada" }),
  ).toHaveCount(2);

  // Acciones que este front no conoce o con un detalle viejo: se muestran sin romper.
  await expect(rows.filter({ hasText: UNKNOWN_ACTION_TEXT })).toHaveCount(2);
  await expect(rows.filter({ hasText: "Mantenimiento" })).toHaveCount(1);
  await expect(page.getByText(ACTION_UNKNOWN)).toHaveCount(0);
  await expect(page.getByText(/error|no se pudo/i)).toHaveCount(0);

  await page
    .getByRole("navigation", { name: "Paginación" })
    .getByRole("button", { name: "2", exact: true })
    .click();
  await expect(rows).toHaveCount(ACTIVITY_EVENTS - ACTIVITY_PAGE_SIZE);
  await expect(rows.first()).toContainText("Paciente registrado");
  await expect(rows.first()).toContainText(AUTHOR_NAME);

  await shootAt(page, "bitacora");
});

test("3. filtro de pacientes por mes: citas en el borde del mes de Costa Rica", async ({
  page,
}) => {
  const [currentYear, currentMonth] = clinicDay().split("-").map(Number);
  const year = currentMonth === 12 ? currentYear + 1 : currentYear;
  const lastNameFor = (letter: string) => `Borde${letter} ${stamp}`;

  const seeds: { letter: string; start: string; month: number }[] = [
    // 1 dic 00:30 en CR: UTC también es 1 dic.
    { letter: "A", start: `${year}-12-01T06:30:00.000Z`, month: 12 },
    // 31 dic 23:30 en CR: en UTC ya es enero, pero la cita es de diciembre.
    { letter: "B", start: `${year + 1}-01-01T05:30:00.000Z`, month: 12 },
    // 30 nov 23:30 en CR: en UTC ya es diciembre, pero la cita es de noviembre.
    { letter: "C", start: `${year}-12-01T05:30:00.000Z`, month: 11 },
    // 1 ene 00:30 en CR.
    { letter: "D", start: `${year + 1}-01-01T06:30:00.000Z`, month: 1 },
  ];
  for (const seed of seeds) {
    const patientUuid = await createPatient("Mes", lastNameFor(seed.letter));
    await createAppointment(patientUuid, seed.start, 30);
  }

  // El API agrupa por el mes de Costa Rica, no por el de UTC.
  const monthsResponse = await api.get("/appointments/months");
  expect(monthsResponse.status()).toBe(200);
  const { months } = (await monthsResponse.json()) as { months: string[] };
  expect(months).toEqual(
    expect.arrayContaining([`${year}-11`, `${year}-12`, `${year + 1}-01`]),
  );

  await page.goto("/pacientes");
  await page.getByPlaceholder("Buscar por nombre o cédula").fill(stamp);
  const patientRow = (letter: string) =>
    page.getByRole("table").getByText(`Mes ${lastNameFor(letter)}`);
  await expect(patientRow("A")).toBeVisible();

  const toggleMonth = async (monthIndex: number) => {
    await page.getByRole("button", { name: MONTH_FILTER_NAME }).click();
    await page
      .getByRole("option", { name: MONTH_NAMES[monthIndex - 1], exact: true })
      .click();
    await page.keyboard.press("Escape");
  };
  let selectedMonth: number | null = null;
  const filterByMonth = async (monthIndex: number) => {
    if (selectedMonth !== null) await toggleMonth(selectedMonth);
    await toggleMonth(monthIndex);
    selectedMonth = monthIndex;
  };

  await filterByMonth(12);
  await expect(patientRow("A")).toBeVisible();
  await expect(patientRow("B")).toBeVisible();
  await expect(patientRow("C")).toHaveCount(0);
  await expect(patientRow("D")).toHaveCount(0);
  await shootAt(page, "filtro-mes-diciembre");

  await filterByMonth(11);
  await expect(patientRow("C")).toBeVisible();
  await expect(patientRow("A")).toHaveCount(0);
  await expect(patientRow("B")).toHaveCount(0);

  await filterByMonth(1);
  await expect(patientRow("D")).toBeVisible();
  await expect(patientRow("A")).toHaveCount(0);
  await expect(patientRow("B")).toHaveCount(0);
  await expect(patientRow("C")).toHaveCount(0);
  await shootAt(page, "filtro-mes-enero");
});
