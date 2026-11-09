import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
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
const SCREENSHOT_DIR = "test-results/citas-y-clinica";
const VIEWPORTS = [375, 1024, 1440];
const VIEWPORT_HEIGHT = 900;
const DESKTOP_VIEWPORT = { width: 1280, height: 900 };
const HTTP_ERROR_MIN = 400;
const HTTP_OK = 200;
const EMPTY_LIST = "[]";
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
const DB_CONTAINER = "audiocolors-prueba-db";
const DB_USER = "admin";
const DB_NAME = "saas_medical_records";
const NOTE_INTRUDER_TEXT = "intruso";

const RESCHEDULE_HOUR_LABEL = /^10:00/;
const RESCHEDULE_HOUR_TEXT = /10:00 a\. ?m\./;
const TIMELINE_NAME = "Horarios del día";
const OTHER_CLINIC_PATIENT = "aaaaaaaa-0000-4000-8000-000000000001";
const OTHER_CLINIC_SECRET = "NOTA SECRETA DE OTRA CLINICA";
const OTHER_CLINIC_ENTRY = "aaaaaaaa-0000-4000-8000-000000000004";

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

/** Consulta SQL directa a la base local de pruebas; devuelve la primera celda sin formato. */
function runSql(sql: string): string {
  return execFileSync(
    "docker",
    [
      "exec",
      DB_CONTAINER,
      "psql",
      "-U",
      DB_USER,
      "-d",
      DB_NAME,
      "-At",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      sql,
    ],
    { encoding: "utf-8" },
  )
    .split("\n")[0]
    .trim();
}

function addDays(dayKey: string, days: number): string {
  return new Date(new Date(`${dayKey}T12:00:00Z`).getTime() + days * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
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
  return ((await response.json()) as { id: string }).id;
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
    await dialog.getByLabel("Hora").click();
    await page.getByRole("option", { name: RESCHEDULE_HOUR_LABEL }).click();
    const schedule = page.waitForResponse(
      (response) =>
        /\/patients\/[0-9a-f-]{36}\/next-appointment$/.test(response.url()) &&
        response.request().method() === "POST",
    );
    await dialog.getByRole("button", { name: "Agendar" }).click();
    expect((await schedule).status()).toBeLessThan(HTTP_ERROR_MIN);

    // Reagendar crea una cita nueva y cancela la anterior.
    const old = await api.get(`/appointments/${movedUuid}`);
    expect(((await old.json()) as { status: string }).status).toBe("CANCELLED");

    await openDay(page, nextDayKey);
    await expect(appointmentBlock(page, movedName)).toContainText(
      RESCHEDULE_HOUR_TEXT,
    );
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
    `${base}/questionnaire-entries`,
    `${base}/contacts`,
    `${base}/devices`,
    `${base}/documents`,
  ];
  for (const path of reads) {
    const response = await api.get(path);
    const body = await response.text();
    // Una lista filtrada por tenant puede responder 200 vacía: no filtra nada.
    const isEmptyList = response.status() === HTTP_OK && body === EMPTY_LIST;
    expect(
      isEmptyList || denied.includes(response.status()),
      `GET ${path}: ${response.status()} ${body}`,
    ).toBe(true);
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
    { method: "put", path: `${base}/status`, data: { status: "INACTIVE" } },
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

test("5b. otra clínica: no se puede agregar una nota al paciente ajeno", async () => {
  expectedStatuses = [HTTP_FORBIDDEN, HTTP_NOT_FOUND];
  const response = await api.post(`/patients/${OTHER_CLINIC_PATIENT}/notes`, {
    data: { text: NOTE_INTRUDER_TEXT },
  });
  expect(
    [HTTP_FORBIDDEN, HTTP_NOT_FOUND],
    `POST notes: ${response.status()} ${await response.text()}`,
  ).toContain(response.status());

  expect(
    runSql(
      `SELECT count(*) FROM "PatientNote" WHERE "patientUuid" = '${OTHER_CLINIC_PATIENT}' AND text = '${NOTE_INTRUDER_TEXT}'`,
    ),
  ).toBe("0");
});

test.describe("5c. otra clínica: la cita ajena no se puede ver, mover ni cancelar", () => {
  const foreignAppointment = randomUUID();
  const foreignStart = clinicInstant(
    addDays(clinicDay(), MOVE_DAYS_AHEAD),
    11 * MINUTES_IN_HOUR,
  );
  const foreignRow = () =>
    runSql(
      `SELECT status || '|' || to_char("startTime", 'YYYY-MM-DD"T"HH24:MI') FROM "Appointment" WHERE uuid = '${foreignAppointment}'`,
    );
  let initialRow = "";

  test.beforeAll(() => {
    // La clínica ajena no tiene tipos de cita: el tipo solo satisface la llave foránea.
    runSql(
      `INSERT INTO "Appointment" (uuid, "patientUUID", "userUUID", "tenantUUID", "typeUUID", speciality, status, date, "startTime", "endTime", "updatedAt")
       SELECT '${foreignAppointment}', patient.uuid, 'usuario-ajeno', patient."tenantUuid", '${appointmentTypeUuid}', 'AUDIOLOGY', 'CONFIRMED',
         '${foreignStart}', '${foreignStart}', '${foreignStart}'::timestamp + interval '30 minutes', now()
       FROM "Patient" patient WHERE patient.uuid = '${OTHER_CLINIC_PATIENT}'`,
    );
    initialRow = foreignRow();
    expect(initialRow).toContain("CONFIRMED");
  });

  test.afterAll(() => {
    runSql(`DELETE FROM "Appointment" WHERE uuid = '${foreignAppointment}'`);
    runSql(
      `DELETE FROM "Appointment" WHERE "patientUUID" = '${OTHER_CLINIC_PATIENT}' AND "userUUID" <> 'usuario-ajeno'`,
    );
  });

  test("leer, mover, cancelar y borrar responden 404 y la cita queda intacta", async () => {
    expectedStatuses = [HTTP_NOT_FOUND];
    const movedStart = new Date(
      new Date(foreignStart).getTime() + MINUTES_IN_HOUR * 60 * 1000,
    ).toISOString();
    const movedEnd = new Date(
      new Date(movedStart).getTime() + 30 * 60 * 1000,
    ).toISOString();
    const path = `/appointments/${foreignAppointment}`;

    const attempts = [
      { label: "GET", response: await api.get(path) },
      {
        label: "PATCH mover",
        response: await api.patch(path, {
          data: { startTime: movedStart, endTime: movedEnd },
        }),
      },
      {
        label: "PATCH cancelar",
        response: await api.patch(path, { data: { status: "CANCELLED" } }),
      },
      { label: "DELETE", response: await api.delete(path) },
    ];
    for (const attempt of attempts) {
      expect(
        attempt.response.status(),
        `${attempt.label}: ${await attempt.response.text()}`,
      ).toBe(HTTP_NOT_FOUND);
    }
    expect(foreignRow()).toBe(initialRow);
  });

  test("agendar la próxima cita o crear una cita al paciente ajeno responde 404 y no toca sus citas", async () => {
    expectedStatuses = [HTTP_NOT_FOUND];
    const day = addDays(clinicDay(), MOVE_DAYS_AHEAD + 1);

    const next = await api.post(
      `/patients/${OTHER_CLINIC_PATIENT}/next-appointment`,
      {
        data: { date: day },
      },
    );
    expect(next.status(), await next.text()).toBe(HTTP_NOT_FOUND);

    const startIso = clinicInstant(day, 9 * MINUTES_IN_HOUR);
    const created = await api.post("/appointments", {
      data: {
        patientUUID: OTHER_CLINIC_PATIENT,
        typeUUID: appointmentTypeUuid,
        speciality: "AUDIOLOGY",
        status: "CONFIRMED",
        date: startIso,
        startTime: startIso,
        endTime: new Date(
          new Date(startIso).getTime() + 30 * 60 * 1000,
        ).toISOString(),
      },
    });
    expect(created.status(), await created.text()).toBe(HTTP_NOT_FOUND);

    expect(
      runSql(
        `SELECT count(*) FROM "Appointment" WHERE "patientUUID" = '${OTHER_CLINIC_PATIENT}'`,
      ),
    ).toBe("1");
    expect(foreignRow()).toBe(initialRow);
  });
});
