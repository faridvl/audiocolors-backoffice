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
const DESKTOP_VIEWPORT = { width: 1280, height: 900 };
const HTTP_ERROR_MIN = 400;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const FETCH_RESOURCE_ERROR = "Failed to load resource";
const CLINIC_TIME_ZONE = "America/Costa_Rica";
// Costa Rica no cambia de horario: siempre UTC-6.
const CLINIC_UTC_OFFSET_HOURS = 6;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MINUTES_IN_HOUR = 60;
const TIMELINE_START_MINUTE = 8 * MINUTES_IN_HOUR;
const TIMELINE_PIXELS_PER_MINUTE = 1.4;
// Centro del paso de media hora, para no caer en el borde entre dos pasos.
const DROP_OFFSET_PX = 5;
const MOVE_DAYS_AHEAD = 14;
const TUESDAY = 2;
const DOCKER_CONTAINER = "audiocolors-prueba-db";
const DB_USER = "admin";
const DB_NAME = "saas_medical_records";

const EMPTY_VALUE_TEXTS = ["Sin registrar", "—", "–", "N/A"];
const MONTH_FILTER_NAME = "Próxima cita";
const TIMELINE_NAME = "Horarios del día";
const UNKNOWN_ACTION_TEXT = "Otra acción";
const ACTION_UNKNOWN = "ACCION_FUTURA_XYZ";
const ACTION_WARRANTY = "WARRANTY_CHANGED";
const ACTION_MAINTENANCE_CHECK = "MAINTENANCE_CHECK_CHANGED";
const AUTHOR_NAME = "Farid Villacis";
const NOTE_TEXT = "Nota de la bitácora";
const OTHER_CLINIC_PATIENT = "aaaaaaaa-0000-4000-8000-000000000001";
const OTHER_CLINIC_SECRET = "NOTA SECRETA DE OTRA CLINICA";
const OTHER_CLINIC_ENTRY = "aaaaaaaa-0000-4000-8000-000000000004";
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

/** Instante UTC (ISO) de una hora de Costa Rica: dayKey "YYYY-MM-DD" y minuto del día. */
function clinicInstant(dayKey: string, minuteOfDay: number): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(
    Date.UTC(year, month - 1, day, CLINIC_UTC_OFFSET_HOURS, minuteOfDay),
  ).toISOString();
}

/** Primer martes a partir de MOVE_DAYS_AHEAD días: un día laborable de la clínica. */
function nextTuesday(): string {
  for (let offset = MOVE_DAYS_AHEAD; ; offset += 1) {
    const dayKey = clinicDay(offset);
    if (new Date(`${dayKey}T12:00:00Z`).getUTCDay() === TUESDAY) return dayKey;
  }
}

function addDays(dayKey: string, days: number): string {
  return new Date(new Date(`${dayKey}T12:00:00Z`).getTime() + days * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
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

async function appointmentStart(appointmentUuid: string): Promise<string> {
  const response = await api.get(`/appointments/${appointmentUuid}`);
  expect(response.status(), await response.text()).toBe(200);
  const body = (await response.json()) as {
    schedule: { startTime: string };
  };
  return body.schedule.startTime;
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
  await page.setViewportSize(DESKTOP_VIEWPORT);
}

const timeline = (page: Page): Locator =>
  page.getByRole("group", { name: TIMELINE_NAME });

/** Pixel dentro de la línea de tiempo donde cae el inicio de una media hora. */
function dropY(minuteOfDay: number): number {
  return (
    (minuteOfDay - TIMELINE_START_MINUTE) * TIMELINE_PIXELS_PER_MINUTE +
    DROP_OFFSET_PX
  );
}

async function openDay(page: Page, dayKey: string) {
  await page.goto(`/agenda?vista=dia&dia=${dayKey}`);
  const dayNumber = String(Number(dayKey.slice(8)));
  await page
    .getByRole("button", { name: new RegExp(`^${dayNumber}\\b`) })
    .first()
    .click();
  await expect(timeline(page)).toBeVisible();
}

const appointmentBlock = (page: Page, patientName: string): Locator =>
  timeline(page).getByRole("button", { name: new RegExp(patientName) });

async function dragBlock(
  page: Page,
  patientName: string,
  toMinuteOfDay: number,
) {
  const patch = page.waitForResponse(
    (response) =>
      /\/appointments\/[0-9a-f-]{36}$/.test(response.url()) &&
      response.request().method() === "PATCH",
  );
  await appointmentBlock(page, patientName).dragTo(timeline(page), {
    targetPosition: { x: 120, y: dropY(toMinuteOfDay) },
  });
  expect((await patch).status()).toBe(200);
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
  // Alta, garantía prendida y apagada, nota y los cuatro eventos insertados.
  await expect(rows).toHaveCount(9);

  const noteRow = rows.filter({ hasText: "Nota agregada" });
  await expect(noteRow).toHaveCount(1);
  await expect(noteRow).toContainText(NOTE_TEXT);
  await expect(noteRow).toContainText(AUTHOR_NAME);
  await expect(noteRow).toContainText(/\d{2}:\d{2}/);

  const warrantyRows = rows.filter({ hasText: "Garantía" });
  await expect(
    warrantyRows.filter({ hasText: "Garantía activada" }),
  ).toHaveCount(1);
  await expect(
    warrantyRows.filter({ hasText: /Garantía (desactivada|quitada|apagada)/ }),
  ).toHaveCount(1);
  await expect(warrantyRows.first()).toContainText(AUTHOR_NAME);

  await expect(rows.filter({ hasText: UNKNOWN_ACTION_TEXT })).toHaveCount(2);
  await expect(page.getByText(/^hoy/i).first()).toBeVisible();
  await expect(page.getByText(/error|no se pudo/i)).toHaveCount(0);

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
    page.getByText(`Mes ${lastNameFor(letter)}`);
  await expect(patientRow("A")).toBeVisible();

  const filterByMonth = async (monthIndex: number) => {
    await page.getByRole("button", { name: MONTH_FILTER_NAME }).click();
    await page
      .getByRole("option", { name: MONTH_NAMES[monthIndex - 1], exact: true })
      .click();
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

test.describe("4. mover una cita", () => {
  const dayKey = nextTuesday();
  const nextDayKey = addDays(dayKey, 1);
  const movedLastName = `Mover ${stamp}`;
  const lateLastName = `Tarde ${stamp}`;
  const movedName = `Cita ${movedLastName}`;
  const lateName = `Cita ${lateLastName}`;
  const START_MINUTE = 10 * MINUTES_IN_HOUR;
  const AFTERNOON_MINUTE = 14 * MINUTES_IN_HOUR;
  const LATE_MINUTE = 18 * MINUTES_IN_HOUR + 30;
  const LATE_MOVED_MINUTE = 18 * MINUTES_IN_HOUR;
  let movedUuid = "";
  let lateUuid = "";

  test.beforeAll(async () => {
    const movedPatient = await createPatient("Cita", movedLastName);
    movedUuid = await createAppointment(
      movedPatient,
      clinicInstant(dayKey, START_MINUTE),
      60,
    );
    const latePatient = await createPatient("Cita", lateLastName);
    lateUuid = await createAppointment(
      latePatient,
      clinicInstant(dayKey, LATE_MINUTE),
      30,
    );
  });

  test("arrastrar una cita a otra hora del mismo día queda guardado al recargar", async ({
    page,
  }) => {
    await openDay(page, dayKey);
    await expect(appointmentBlock(page, movedName)).toBeVisible();
    await shootAt(page, "mover-antes");
    await openDay(page, dayKey);

    await dragBlock(page, movedName, AFTERNOON_MINUTE);
    expect(await appointmentStart(movedUuid)).toBe(
      clinicInstant(dayKey, AFTERNOON_MINUTE),
    );

    await openDay(page, dayKey);
    await expect(appointmentBlock(page, movedName)).toContainText(
      /2:00 p\. ?m\./,
    );
    await shootAt(page, "mover-misma-hora");
  });

  test("una cita fuera de 8:00 a 18:00 se ve en la línea de tiempo y se mueve dentro del rango ampliado", async ({
    page,
  }) => {
    await openDay(page, dayKey);
    await expect(appointmentBlock(page, lateName)).toBeVisible();
    await expect(appointmentBlock(page, lateName)).toContainText(
      /6:30 p\. ?m\./,
    );
    await expect(page.getByText("Sin hora asignada")).toHaveCount(0);

    await dragBlock(page, lateName, LATE_MOVED_MINUTE);
    expect(await appointmentStart(lateUuid)).toBe(
      clinicInstant(dayKey, LATE_MOVED_MINUTE),
    );

    await openDay(page, dayKey);
    await expect(appointmentBlock(page, lateName)).toContainText(
      /6:00 p\. ?m\./,
    );
    await shootAt(page, "mover-rango-ampliado");
  });

  test("reagendar una cita a otro día queda guardado al recargar", async ({
    page,
  }) => {
    await openDay(page, dayKey);
    await appointmentBlock(page, movedName).click();
    await page.getByRole("button", { name: "Reagendar" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/Fecha/).fill(nextDayKey);
    const patch = page.waitForResponse(
      (response) =>
        /\/appointments\/[0-9a-f-]{36}$/.test(response.url()) &&
        response.request().method() === "PATCH",
    );
    await dialog.getByRole("button", { name: "Agendar" }).click();
    expect((await patch).status()).toBe(200);

    const start = await appointmentStart(movedUuid);
    expect(start.slice(0, 10)).toBe(nextDayKey);

    await openDay(page, nextDayKey);
    await expect(appointmentBlock(page, movedName)).toBeVisible();
    await openDay(page, dayKey);
    await expect(appointmentBlock(page, movedName)).toHaveCount(0);
    await shootAt(page, "mover-otro-dia");
  });
});

test("5. otra clínica: el paciente ajeno no se puede leer ni cambiar", async () => {
  expectedStatuses = [HTTP_FORBIDDEN, HTTP_NOT_FOUND];
  const base = `/patients/${OTHER_CLINIC_PATIENT}`;
  const denied = [HTTP_FORBIDDEN, HTTP_NOT_FOUND];

  const reads = [
    base,
    `${base}/notes`,
    `${base}/lab-shipments`,
    `${base}/otoscopy-entries`,
    `${base}/background`,
    `${base}/physical-exam`,
  ];
  for (const path of reads) {
    const response = await api.get(path);
    const body = await response.text();
    expect(denied, `GET ${path}: ${response.status()} ${body}`).toContain(
      response.status(),
    );
    expect(body).not.toContain(OTHER_CLINIC_SECRET);
    expect(body).not.toContain("OtraClinica");
  }

  const writes: {
    method: "put" | "patch" | "post";
    path: string;
    data: object;
  }[] = [
    { method: "put", path: `${base}/flags`, data: { isVideoCandidate: true } },
    { method: "patch", path: base, data: { firstName: "Hackeado" } },
    { method: "put", path: `${base}/status`, data: { status: "ARCHIVED" } },
    { method: "post", path: `${base}/notes`, data: { text: "intruso" } },
    {
      method: "patch",
      path: `${base}/otoscopy-entries/${OTHER_CLINIC_ENTRY}`,
      data: { notes: "intruso" },
    },
  ];
  for (const write of writes) {
    const response = await api[write.method](write.path, { data: write.data });
    const body = await response.text();
    expect(
      denied,
      `${write.method.toUpperCase()} ${write.path}: ${response.status()} ${body}`,
    ).toContain(response.status());
    expect(body).not.toContain(OTHER_CLINIC_SECRET);
  }

  // El paciente ajeno tampoco aparece en el listado del tenant actual.
  const listResponse = await api.get("/patients?search=OtraClinica");
  expect(listResponse.status()).toBe(200);
  expect(await listResponse.text()).not.toContain(OTHER_CLINIC_PATIENT);
});
