# ARCHITECTURE.md

## Qué es

Back-office de **AudioColors** (centro auditivo, Costa Rica). Solo frontend: consume
`standard-saas-api`, compartido con Zynka. Lo usa el personal de la clínica; no hay
registro público y las cuentas las crea el administrador. Datos del tenant, repos
relacionados y usuarios: ver `CLAUDE.md`.

## Alcance actual (v1.0.0)

- **Pacientes:** lista con resumen y filtros, alta, edición, estado (activo, inactivo,
  fallecido), indicadores, contactos y notas.
- **Expediente:** datos del paciente, próxima cita (mes tentativo → día confirmado),
  archivos adjuntos (subir, renombrar, rotar, cambiar de sección), historia clínica
  (hoja por secciones, PDF de cambios con jsPDF en el navegador, D18) y Control de evolución.
- **Agenda** (`/agenda`): franja semanal y pestañas en móvil; en escritorio, línea de
  tiempo del día con arrastre (D10); calendario del iPhone (`calendar-feed`).
- **Bitácora** (`/bitacora`): actividad de pacientes, con resumen y filtros.
- **Configuración** (`/configuracion`): tipos de cita y Preguntas, que por ahora contiene la historia clínica
  (D21, D22). `/configuracion/historia-clinica` redirige a `/configuracion/preguntas`.
- **Notificaciones y versiones:** bandeja con las novedades de cada versión (D23).
- **Permisos por rol:** `OWNER`, `ADMIN`, `DOCTOR`, `STAFF` (RULES.md §7).

Sin audiograma ni inventario.

## Stack

Next.js 14 (Pages Router) · React 18 · TypeScript · Tailwind 3 · TanStack Query 5 ·
Formik + Yup · i18next · Sonner · Fira Sans · jsPDF. Detalle de las diferencias con
los estándares globales: RULES.md §1.

## Estructura

```
src/
├── pages/                    rutas finas, en español
│   ├── _app.tsx              QueryClient + Toaster + i18n + metadatos
│   ├── _document.tsx         favicons, splash y fuente
│   ├── api/site.webmanifest.ts
│   ├── index.tsx  login/  agenda/  bitacora/
│   ├── configuracion/        index, preguntas, tipos-de-cita  (historia-clinica solo redirige)
│   └── pacientes/            index, nuevo, [uuid]/{index, editar}
├── components/
│   ├── common/               action-menu, badge, brand, button, checkbox, color-dot,
│   │                         drop-zone, filter-bar, filter-dropdown, form, input,
│   │                         layout (AppLayout, SplitScreenLayout), month-grid,
│   │                         permission (RequirePermission), pill-select,
│   │                         segmented-control, switch, table, tabs, typography
│   └── containers/
│       ├── login/  documents/  notifications/  patient-activity/
│       ├── agenda/           móvil, desktop/, calendar-sync/
│       ├── settings/         navegación de Configuración
│       ├── appointment-types-settings/  clinical-history-template/
│       └── patients/         list, create, edit, detail, contacts, flags, notes,
│                             status, background (historia clínica),
│                             schedule-appointment, form, validation
├── shared/
│   ├── api/                  api-service-client.ts (ApiError), config.ts (URLs),
│   │                         querys/, mutations/ (use-api-mutation.ts)
│   ├── auth/permissions.ts   Permission y ROLE_PERMISSIONS
│   ├── design/tokens.ts      significado de cada token y BRAND_COLORS
│   ├── i18n/i18n.ts          inicialización de i18next
│   ├── navigation/routes.ts  routesPrivate / routesPublic
│   └── utils/                cookies, dates, formatters, file-name, whatsapp, calendar-feed
├── hocs/auth.tsx             guard de página privada
├── hooks/                    use-session, use-permissions, use-navigation, use-logout…
├── static/                   releases.ts (versiones) y texts/ (i18n.ts + es.json)
└── types/                    por dominio: appointments, auth, branches, patients…
```

Cada feature son dos archivos: `{feature}-container.tsx` (solo JSX) y
`use-{feature}.ts` (queries, mutations, estado, handlers). El container nunca
importa React Query.

## Autenticación y permisos

1. `POST /auth/login` → `{ access_token, user }`.
2. Cookies `SESSION_ACCESS_TOKEN` (7 días) y `SESSION_USER_NAME`.
3. Cada request lleva `Authorization: Bearer <token>`.
4. `useSession()` → `GET /auth/me` (`staleTime` 30 min).
5. `authorizeServerSidePage()` comprueba la cookie en `getServerSideProps`. **Solo
   comprueba que exista**: firma y expiración las valida el API.
6. Un 401 con token presente cierra sesión y redirige a `/login?expired=true`.
7. `usePermissions().can(...)` lee `shared/auth/permissions.ts`; debe coincidir con
   `CLINICAL_ACCESS_ROLES` del API. En la historia clínica, un 403 (`ApiError`) oculta la tarjeta y no se reintenta.

**Multi-tenant:** el aislamiento lo resuelve el JWT; el frontend nunca envía `tenantUuid`.

## Endpoints consumidos

Dos servicios: Identity (`NEXT_PUBLIC_IDENTITY_API_URL`) y Medical Records
(`NEXT_PUBLIC_MEDICAL_RECORDS_API_URL`).

| Recurso | Endpoints |
|---|---|
| Identity | `POST /auth/login`, `GET /auth/me` |
| Pacientes | `GET/POST /patients`, `GET/PATCH /patients/:uuid`, `PUT /patients/:uuid/status`, `PUT /patients/:uuid/flags` |
| Contactos y notas | `GET/PUT /patients/:uuid/contacts`, `GET/POST /patients/:uuid/notes` |
| Historia clínica del paciente | `GET/PUT /patients/:uuid/background` |
| Próxima cita | `POST /patients/:uuid/next-appointment`, `PUT /patients/:uuid/next-appointment/tentative-month` |
| Archivos | `GET/POST /patients/:uuid/documents`, `PATCH/DELETE /patients/:uuid/documents/:documentUuid` |
| Citas | `GET /appointments`, `GET /appointments/months`, `PATCH /appointments/:uuid` |
| Catálogos | `GET /branches`, `GET /appointment-types`, `PATCH /appointment-types/:uuid` |
| Plantilla de historia clínica | `GET /clinical-templates/speciality/:speciality`, `POST /clinical-templates`, `PATCH /clinical-templates/:uuid` |
| Bitácora | `GET /patient-activity`, `/patient-activity/actors`, `/patient-activity/summary`, `/patient-activity/months` |
| Calendario del iPhone | `GET/POST /calendar-feed`, `PATCH /calendar-feed/calendars` |

Disponible sin usar: `POST /patients/bulk` (importación masiva, hasta 500 con
deduplicación por cédula).

## React Query

`staleTime` según la query: de 30 s (`appointments-query.ts`) a 30 min
(`use-session.ts`); la mayoría, de 2 a 5 min. `patients-query.ts` y
`calendar-feed-query.ts` no definen uno (0) y el `QueryClient` de `_app.tsx` no
tiene default (solo `refetchOnWindowFocus: false` y `retry: 1`).

## Almacenamiento de archivos

Cloudflare R2, operado por el API. Límite 20 MB por archivo; solo imágenes y PDF. El
upload va por `fetch` directo (con `FormData` el navegador fija el `Content-Type`).
