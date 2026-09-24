# ARCHITECTURE.md

## Qué es

Back-office de **AudioColors** (centro auditivo, Costa Rica). Frontend
únicamente. Alcance deliberadamente mínimo: **pacientes y sus archivos**.

No es un portal de pacientes: lo usa el personal de la clínica, no hay registro
público y las cuentas las crea el administrador.

## De dónde viene

Recorte de `next-audiology-files` (Zynka), el SaaS multi-tenant en construcción,
para poder entregar a un cliente real sin esperar a que Zynka esté completo.

| Repo | Ubicación | Rol |
|---|---|---|
| API | `C:\Users\Personal\Desktop\standard-saas-api` | Backend compartido. **No se toca** |
| Zynka | `D:\Documentos\Proyectos\React\next-audiology-files` | Origen del código |
| Landing | `D:\Documentos\Proyectos\React\landing-audiocolors` | Identidad visual |
| Marca | `D:\Documentos\audio colors\docs audio colors` | Manual `.ai`, fotos |

## Stack

Next.js 14 (Pages Router) · TypeScript · Tailwind · TanStack Query 5 ·
Formik + Yup · Sonner · Fira Sans

Sin i18n, sin PDF, sin audiograma, sin inventario, sin citas.

## Estructura

```
src/
├── pages/                    rutas (en español: /pacientes)
│   ├── _app.tsx              QueryClient + Toaster + metadatos
│   ├── _document.tsx         favicons + fuente Fira Sans
│   ├── index.tsx             redirige según haya sesión
│   ├── login/
│   └── pacientes/
│       ├── index.tsx         lista
│       ├── nuevo.tsx         alta
│       └── [uuid]/
│           ├── index.tsx     expediente (datos + archivos)
│           └── editar.tsx
├── components/
│   ├── common/
│   │   ├── brand/            logo, franja de colores
│   │   ├── button/  input/  typography/
│   │   ├── form/             FormViewSection + FormViewLabel
│   │   ├── layout/           AppLayout (privado), SplitScreenLayout (público)
│   │   └── table/            ResponsiveTable + Pagination
│   └── containers/
│       ├── login/  documents/
│       └── patients/         list · create · edit · detail · form · validation
├── shared/
│   ├── api/                  client, querys/, mutations/
│   ├── design/tokens.ts      significado de cada token
│   ├── navigation/routes.ts
│   └── utils/                cookies, formatters
├── hocs/auth.tsx             guard de página privada
├── hooks/                    use-session, use-logout, use-navigation
└── types/                    auth, patients, documents, system
```

## Patrón de componentes

Cada feature son dos archivos:

```
{feature}-container.tsx    solo JSX — importa el hook y renderiza
use-{feature}.ts           queries, mutations, estado, handlers
```

El container **nunca** importa React Query directamente.

## Autenticación

1. `POST /auth/login` → `{ access_token, user }`
2. Se guarda en cookie `SESSION_ACCESS_TOKEN` (7 días) + `SESSION_USER_NAME`
3. Cada request lleva `Authorization: Bearer <token>`
4. `useSession()` → `GET /auth/me` (staleTime 30 min)
5. `authorizeServerSidePage()` comprueba la cookie en `getServerSideProps`
6. Un 401 con token presente cierra sesión y redirige a `/login?expired=true`

**El guard solo comprueba que la cookie exista** — no valida firma ni
expiración. La validación real la hace el API.

## Multi-tenant

AudioColors es un tenant del mismo backend que Zynka. **El aislamiento lo
resuelve el JWT**: cada controller del API lee `tenantUuid` del token y el
frontend nunca lo envía. Por eso este repo no necesitó ningún cambio en el API.

| Dato | Valor |
|---|---|
| `tenantUuid` | `9e781ab3-f1db-4311-a9a2-ae2afb595718` |
| `tenantId` | `12` |
| `businessType` | `AUDIOLOGY` |

## Endpoints consumidos

| Método | Endpoint | Servicio |
|---|---|---|
| POST | `/auth/login` | Identity |
| GET | `/auth/me` | Identity |
| GET/POST | `/patients` | Medical Records |
| GET/PATCH | `/patients/:uuid` | Medical Records |
| GET/POST | `/patients/:uuid/documents` | Medical Records |
| DELETE | `/patients/:uuid/documents/:documentUuid` | Medical Records |

Disponibles pero sin usar: `POST /patients/bulk` (importación masiva, hasta 500
con deduplicación por cédula) — quedó fuera porque la base arranca vacía.

## Almacenamiento de archivos

Cloudflare R2, **ya configurado y operativo** en el entorno del API. Los
archivos quedan en URLs públicas del tipo
`https://pub-<id>.r2.dev/medical_records/<tenant>/<patient>/documentos/<archivo>`.

Límite 20 MB por archivo; solo imágenes y PDF.
