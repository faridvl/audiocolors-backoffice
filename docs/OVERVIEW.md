# AudioColors · Gestión Clínica — Visión General de Plataforma

> **Documento vivo.** Se actualiza al cerrar cada etapa (ver [.claude/STATUS.md](../.claude/STATUS.md)). Las secciones marcadas con `[PENDIENTE]` corresponden a trabajo aún no implementado.

---

## Tabla de Contenidos

1. [Descripción de la Plataforma](#1-descripción-de-la-plataforma)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Mapa de Módulos](#3-mapa-de-módulos)
4. [Pacientes — Flujo Completo](#4-pacientes--flujo-completo)
5. [Autenticación y Multi-tenant](#5-autenticación-y-multi-tenant)
6. [Preocupaciones Transversales](#6-preocupaciones-transversales)
7. [Backend Compartido (standard-saas-api)](#7-backend-compartido-standard-saas-api)
8. [Identidad Visual](#8-identidad-visual)
9. [Reglas de Negocio](#9-reglas-de-negocio)
10. [Patrones de Código](#10-patrones-de-código)
11. [Decisiones Registradas](#11-decisiones-registradas)
12. [Tabla de Progreso](#12-tabla-de-progreso)

---

## 1. Descripción de la Plataforma

**AudioColors · Gestión Clínica** es el back-office de un centro auditivo en Costa Rica. Es un **frontend únicamente**, deliberadamente mínimo: gestiona **pacientes y sus archivos adjuntos**, nada más. No es un portal de pacientes — lo usa el personal de la clínica, no hay registro público y las cuentas las crea el administrador.

Nació como **recorte** de `next-audiology-files` (Zynka), el SaaS multi-tenant en construcción, para entregar a un cliente real sin esperar a que Zynka esté completo. Toma ~15% del alcance de Zynka y consume el mismo backend, sin tocarlo.

### Tecnología base

| Aspecto | Detalle |
|---|---|
| Framework | Next.js 14 (Pages Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS, tokens propios (sin hex sueltos) |
| Estado servidor | TanStack Query 5 |
| Formularios | Formik + Yup |
| Notificaciones | Sonner |
| Tipografía | Fira Sans |
| i18n | `i18next` + `react-i18next`, migración en curso (ver [§5.2 RULES.md](../.claude/RULES.md)) |
| Backend | `standard-saas-api` (compartido con Zynka, **no se modifica**) |
| Almacenamiento de archivos | Cloudflare R2 |
| Despliegue | Vercel — `[PENDIENTE]`, ver [.claude/STATUS.md](../.claude/STATUS.md) |

### Escala

Un solo dominio funcional (pacientes + documentos), ~80 archivos TypeScript, sin suite de pruebas automatizadas — la validación es `yarn lint && yarn typecheck` antes de cada commit, más verificación manual en navegador para cambios de UI.

---

## 2. Arquitectura del Sistema

### 2.1 Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTACIÓN (Next.js Pages)                 │
│  /login  │  /pacientes  │  /pacientes/nuevo  │  /pacientes/[uuid]│
└────────────────────────────┬──────────────────────────────────────┘
                              │  container (JSX) + use-{feature} (lógica)
┌────────────────────────────▼──────────────────────────────────────┐
│                    CONTAINERS + HOOKS                            │
│  login │ patients (list/create/edit/detail) │ documents          │
│  patient-notes │ patient-contacts │ schedule-appointment          │
└────────────────────────────┬──────────────────────────────────────┘
                              │  TanStack Query (querys/ + mutations/)
┌────────────────────────────▼──────────────────────────────────────┐
│                    ApiServiceClient (fetch + Bearer token)       │
└────────────────────────────┬──────────────────────────────────────┘
                              │  HTTPS
┌────────────────────────────▼──────────────────────────────────────┐
│              standard-saas-api (backend compartido con Zynka)    │
│  Identity Service        │  Medical Records Service               │
│  /auth/login, /auth/me   │  /patients, /patients/:uuid/documents  │
└────────────────────────────┬──────────────────────────────────────┘
                              │
┌────────────────────────────▼──────────────────────────────────────┐
│  SQL (saas_identity, saas_medical_records)  │  Cloudflare R2       │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 El patrón container + hook

Cada feature son exactamente dos archivos:

```
{feature}-container.tsx    solo JSX — importa el hook y renderiza
use-{feature}.ts           queries, mutations, estado, handlers
```

El container **nunca** importa TanStack Query directamente — toda la lógica de datos vive en el hook. Es el equivalente de este proyecto a una capa de "negocio" separada de la "presentación": no hay objeto raíz de sesión ni inyección de dependencias, el propio hook resuelve queries, mutations y estado local.

### 2.3 Sin modo offline

A diferencia de un POS, este back-office no tiene operación local/offline ni sincronización bidireccional — cada acción golpea directo a `standard-saas-api`. Si el API no responde, el hook muestra error o toast; no hay fallback a datos locales.

### 2.4 Guard de páginas privadas

```ts
export const getServerSideProps = authorizeServerSidePage();
```

Se aplica a toda página que requiera sesión. Comprueba que exista la cookie `SESSION_ACCESS_TOKEN` en `getServerSideProps` — **no valida firma ni expiración**, eso lo hace el API en cada request. Un 401 con token presente cierra sesión y redirige a `/login?expired=true`.

---

## 3. Mapa de Módulos

### 3.1 Autenticación (`login`) — Implementado

| Archivo | Responsabilidad |
|---|---|
| `login-container.tsx` | Formulario de acceso |
| `use-login.ts` | Validación Yup, mutation de login, manejo de error |

Flujo: `POST /auth/login` → guarda token en cookie → redirige según haya sesión.

### 3.2 Pacientes (`patients`) — Implementado

| Subsistema | Archivos principales |
|---|---|
| Listado | `patients-list/patient-list-container.tsx`, `use-patient-list.ts` — búsqueda, filtros, paginación |
| Alta | `patient-create/*` |
| Edición | `patient-edit/*` |
| Detalle / expediente | `patient-detail/patient-detail-container.tsx` |
| Formulario compartido | `patient-form.tsx`, `patient-validation.ts` (usado por alta y edición) |
| Notas | `patient-notes/*` |
| Contactos | `patient-contacts/*` |
| Próxima cita | `schedule-appointment/schedule-appointment-modal.tsx` |

### 3.3 Documentos (`documents`) — Implementado

Subida, previsualización (lightbox para imágenes, iframe para PDF) y borrado de archivos adjuntos al expediente. Vive dentro del detalle de paciente, no es una ruta independiente.

| Archivo | Responsabilidad |
|---|---|
| `documents-container.tsx` | Lista de adjuntos + acciones |
| `document-preview-modal.tsx` | Preview inline |
| `rename-document-modal.tsx` | Renombrar |
| `confirm-delete-modal.tsx` | Confirmación de borrado (modal propio, no `window.confirm`) |
| `use-documents.ts` | Upload, rename, delete — mutations |

### 3.4 Módulos fuera de alcance (a propósito)

Registro público, recuperación de contraseña, citas/agenda como módulo propio, inventario y audífonos, audiogramas y notas clínicas estructuradas, reportes PDF. Ver [D2, D5, D6 en DECISIONS.md](../.claude/DECISIONS.md).

---

## 4. Pacientes — Flujo Completo

### 4.1 Alta de paciente

1. `Frm` equivalente: `patient-create-container.tsx` con `patient-form.tsx`
2. Validación Yup (`patient-validation.ts`) — cédula, nombre, contacto
3. `POST /patients` vía `create-patient-mutation.ts`
4. Redirección al expediente recién creado

### 4.2 Expediente (detalle)

1. `GET /patients/:uuid` — datos del paciente
2. `GET /patients/:uuid/documents` — archivos adjuntos
3. Header: nombre del paciente como título, "Expediente" como subtítulo, acciones (editar/volver) en el header — nunca en el contenido
4. Franja de datos resumidos con enlace "Ver todos los datos" (los documentos son lo que se consulta a diario, ver [regla 3.4 RULES.md](../.claude/RULES.md))
5. Notas y contactos como secciones expandibles

### 4.3 Subida de documento

`upload-document-mutation.ts` usa `fetch` directo, **no** `ApiServiceClient` — con `FormData` el navegador debe fijar el `Content-Type` con su boundary. Límite 20 MB, solo imágenes y PDF. El archivo queda en R2 bajo `medical_records/<tenant>/<patient>/documentos/<archivo>`.

### 4.4 Próxima cita (dato simple, no agenda)

`set-tentative-month-mutation.ts` permite anotar solo el mes de la próxima cita hasta que el paciente confirme el día — no es un módulo de citas, es un campo sobre el paciente. Usa la sede propia del paciente y pide de qué es la cita (ver commit `a7c9682`).

---

## 5. Autenticación y Multi-tenant

### 5.1 Flujo de sesión

1. `POST /auth/login` → `{ access_token, user }`
2. Se guarda en cookie `SESSION_ACCESS_TOKEN` (7 días) + `SESSION_USER_NAME`
3. Cada request lleva `Authorization: Bearer <token>`
4. `useSession()` → `GET /auth/me` (`staleTime` 30 min)
5. `authorizeServerSidePage()` comprueba la cookie en `getServerSideProps`
6. Un 401 con token presente cierra sesión y redirige a `/login?expired=true`

### 5.2 Multi-tenant sin tocar el API

AudioColors es un tenant más del mismo backend que Zynka. El aislamiento lo resuelve el **JWT**: cada controller del API lee `tenantUuid` del token, y el frontend **nunca lo envía**. Por eso este repo no necesitó ningún cambio en el API — un frontend nuevo, logueado con un usuario de AudioColors, solo ve datos de AudioColors automáticamente (ver [D1 en DECISIONS.md](../.claude/DECISIONS.md)).

| Dato | Valor |
|---|---|
| `tenantUuid` | `9e781ab3-f1db-4311-a9a2-ae2afb595718` |
| `tenantId` | `12` |
| `businessType` | `AUDIOLOGY` |

Usuarios: `admin@audiocolors.com` (OWNER, Matthew Arias Mena) · `maria@audiocolors.com` (ADMIN, Maria Duran Arias). Contraseña temporal `Password1` — **pendiente cambiar antes de entregar** (P0-1 en STATUS.md).

---

## 6. Preocupaciones Transversales

### 6.1 Colores por token, nunca hex suelto

```tsx
// ❌ NUNCA
<div className="bg-[#1f6fb1]">

// ✅ SIEMPRE
<div className="bg-brand">
```

`brand` (azul `#1f6fb1`, la R del logo) es el único acento. `ink` son grises neutros sin tinte azul. `success` es teal, no verde, para no confundirse con la marca. Verificación: `grep -rEo "(bg|text|border)-\[#[0-9a-fA-F]{3,8}\]" src/` debe dar 0. Excepción única: `rainbow-stripe.tsx`, que pinta los 6 colores de marca como dato de identidad. Ver [regla 1 en RULES.md](../.claude/RULES.md).

### 6.2 Cuatro estados de lista, siempre

Toda lista resuelve: **cargando · error · vacío-sin-datos · vacío-por-filtros**. `ResponsiveTable` los implementa una sola vez; no se reimplementan por pantalla. "No hay datos" y "los filtros no arrojan nada" llevan mensajes distintos, y solo el primero ofrece el botón de crear.

### 6.3 Responsive sin scroll horizontal

En móvil, `ResponsiveTable` renderiza tarjetas de pares etiqueta/valor en vez de una tabla con scroll lateral. Adoptado de billo (`web-backoffice-comx`), verificado en producción.

### 6.4 Texto en español con tildes

`años`, no `anios`. Al escribir texto visible se usa la herramienta Write o un script Python con `encoding='utf-8'` — los heredocs de bash se comieron los acentos una vez y hubo que corregir ~20 archivos.

### 6.5 Manejo de errores

Errores de red → toast desde el hook, no pantalla de error, salvo listas y detalle, que ofrecen "Reintentar". `response.json()` va siempre protegido: hay endpoints del API que responden 200 sin cuerpo.

---

## 7. Backend Compartido (standard-saas-api)

### 7.1 Regla dura: el API no se toca

Este frontend consume `standard-saas-api` **sin modificarlo**. Lo comparte con Zynka — un cambio incompatible rompe el otro sitio. Si una funcionalidad necesita un cambio en el API, se discute antes.

### 7.2 Endpoints consumidos

| Método | Endpoint | Servicio |
|---|---|---|
| POST | `/auth/login` | Identity |
| GET | `/auth/me` | Identity |
| GET/POST | `/patients` | Medical Records |
| GET/PATCH | `/patients/:uuid` | Medical Records |
| GET/POST | `/patients/:uuid/documents` | Medical Records |
| DELETE | `/patients/:uuid/documents/:documentUuid` | Medical Records |

Disponible pero sin usar: `POST /patients/bulk` (importación masiva, hasta 500 con deduplicación por cédula) — fuera de alcance porque la base arranca vacía (ver P2-1 en STATUS.md).

### 7.3 Comportamientos verificados del API (limitaciones conocidas)

| Limitación | Efecto |
|---|---|
| `DELETE /patients/:uuid` es soft delete y `PATCH` ignora `isActive` | Un paciente eliminado no se puede reactivar ni borrar del todo desde el frontend |
| `GET /patients` solo distingue "activos" de "activos + inactivos" | El filtro "Inactivos" trae todos y filtra en cliente; su conteo no es exacto (P1-3) |

Ambas requieren cambio en el API compartido con Zynka — no se resuelven en este repo (ver [D9 en DECISIONS.md](../.claude/DECISIONS.md)).

---

## 8. Identidad Visual

Los colores de marca **se miden** del manual oficial (`AUDIOCOLORS LOGO Y VARIANTES.ai`, leído con PyMuPDF), no se estiman — una primera versión contó píxeles de un JPEG y los seis colores quedaron ligeramente distintos. Viven en `src/shared/design/tokens.ts` → `BRAND_COLORS`.

Logo: dos archivos (`logo-audiocolors.png` fondo claro, `logo-audiocolors-dark.png` fondo oscuro), nunca un filtro CSS tipo `brightness-0 invert`. Favicon: solo la oreja del logo, sin los puntos de color, fondo transparente. Al componente se le pasa siempre la altura (`<BrandLogo height={40} />`), nunca ancho y alto juntos.

Ver detalle completo en [.claude/BRAND.md](../.claude/BRAND.md) y [regla 2 en RULES.md](../.claude/RULES.md).

---

## 9. Reglas de Negocio

### 9.1 Roles de usuario

| Rol | Alcance |
|---|---|
| OWNER | Acceso completo, cuenta creadora del tenant |
| ADMIN | Gestión de pacientes y documentos |
| `[PENDIENTE]` DOCTOR / STAFF | Mencionados en `POST /users` (ver P2-2), sin cuenta activa hoy |

### 9.2 Estado de paciente

Activo / inactivo. Un paciente inactivo no se puede reactivar ni eliminar del todo desde el frontend — limitación del API (§7.3). El filtro "Inactivos" existe pero su conteo no es exacto hasta que el API soporte paginación real de ese estado.

### 9.3 Documentos adjuntos

Solo imágenes y PDF, límite 20 MB. Se agrupan por categoría y se pueden renombrar o eliminar; el borrado pide confirmación con modal propio (no `window.confirm` nativo — defecto corregido al portar de Zynka).

### 9.4 Próxima cita

Campo simple sobre el paciente (mes tentativo → día confirmado), con tipo de cita y sede propia del paciente. No es un módulo de agenda con disponibilidad ni conflictos de horario.

---

## 10. Patrones de Código

### 10.1 Container + hook

```tsx
// patient-list-container.tsx — solo JSX
export function PatientListContainer() {
  const { patients, isLoading, filters, setFilters } = usePatientList();
  return <ResponsiveTable ... />;
}

// use-patient-list.ts — toda la lógica
export function usePatientList() {
  const { data, isLoading } = usePatientsQuery(filters);
  // ...
  return { patients: data, isLoading, filters, setFilters };
}
```

### 10.2 Sin `any`, tipos en `src/types/`

`unknown` + narrowing si la forma es incierta. Enums para valores discretos, no uniones de strings literales. `isLoading`, nunca `loading`. Sin abreviaciones: `patient` no `p`.

### 10.3 i18n — patrón de Zynka (en migración)

```tsx
const { t } = useTranslation();
<title>{t(TEXT.AUTH.LOGIN.PAGE_TITLE)}</title>
```

Keys tipadas en `src/static/texts/i18n.ts` (`TEXT` const, anidado por módulo), traducciones espejo en `es.json`. Un schema de Yup usado por un solo hook se arma dentro del hook con `useMemo`; si lo comparten varios hooks, se exporta como función factory que recibe `t`. **Nunca** `i18n.t()` importado directo — esquiva el ciclo de vida de React. Ver [regla 5.2–5.4 en RULES.md](../.claude/RULES.md) para el detalle completo.

### 10.4 Verificación antes de cada commit

```bash
yarn lint && yarn typecheck
```

Ambos limpios, siempre. **No** se corre `next build` para validar cambios. Si un hook de pre-commit falla, se corrige la causa — nunca `--no-verify`.

---

## 11. Decisiones Registradas

Resumen de [.claude/DECISIONS.md](../.claude/DECISIONS.md) — el detalle completo y el porqué de cada una vive ahí:

| # | Decisión |
|---|---|
| D1 | Repo separado de Zynka en vez de esperarlo completo; viable porque el aislamiento multi-tenant sale del JWT |
| D2 | Back-office para personal de clínica, no portal de pacientes |
| D3 | Alta de tenant por `POST /auth/register`, nunca por INSERT directo (contraseñas con bcrypt) |
| D4 | Base de datos en blanco al entregar, sin migrar datos de prueba de Zynka |
| D5 | Sin i18n — **revertida el 2026-09-16**, ver §5.2 de RULES.md |
| D6 | Detalle de paciente escrito de nuevo (~130 líneas) en vez de portar el de Zynka (1052 líneas, 6 queries) |
| D7 | Acento único verde `#66ae36` con grises neutros, en vez de azul/naranja heredados |
| D8 | Estándares de UI tomados de billo (`web-backoffice-comx`), con ajustes: page size 10, sidebar blanco, sin sistema `NewForm` |
| D9 | Limitaciones del API (soft delete, filtro inactivos) no se arreglan en este repo — requieren cambio compartido con Zynka |

---

## 12. Tabla de Progreso

| Etapa | Contenido | Estado |
|---|---|---|
| 1 — Scaffold y alcance base | Login, lista de pacientes, alta/edición, expediente con documentos y preview inline | Completo |
| 2 — Identidad | Colores medidos del logo, favicon (oreja sola) | Completo |
| 3 — Estándares de UI | `ResponsiveTable`, cuatro estados, `FormViewSection`/`FormViewLabel`, paginación con elipsis | Completo |
| 4 — Densidad del expediente | Acciones al header, franja de datos resumida, acentuación corregida | Completo |
| 5 — i18n | Infraestructura instalada, login migrado; resto pantalla por pantalla | En curso |
| 6 — Despliegue | Vercel, subdominio `backoffice.audiocolorscr.com` | Pendiente (P0-2) |

### Pendientes activos

Ver detalle y notas en [.claude/STATUS.md](../.claude/STATUS.md).

| Prioridad | Tarea |
|---|---|
| 🔴 P0-1 | Cambiar contraseñas temporales antes de entregar |
| 🔴 P0-2 | Desplegar en Vercel |
| 🟠 P1-1 | Logo en SVG (hoy sale de vectores rasterizados a 1400px) |
| 🟠 P1-2 | Limpiar paciente inactivo huérfano (requiere acceso a DB) |
| 🟠 P1-3 | Paginación real del filtro "Inactivos" (requiere cambio en el API) |
| 🟠 P1-4 | Completar migración a i18n |
| ⚪ P2-1 | Importación masiva de pacientes (`POST /patients/bulk` ya existe) |
| ⚪ P2-2 | Más usuarios del personal (roles DOCTOR/STAFF) |
| ⚪ P2-3 | Búsqueda dentro de los documentos |

---

## Guía de contribución al documento

Este archivo resume [ARCHITECTURE.md](../.claude/ARCHITECTURE.md), [RULES.md](../.claude/RULES.md), [DECISIONS.md](../.claude/DECISIONS.md) y [STATUS.md](../.claude/STATUS.md) en un solo lugar de lectura rápida. Al cerrar una etapa:

1. Actualizar primero `.claude/STATUS.md` (es la fuente de verdad de progreso).
2. Reflejar el cambio aquí solo si afecta la vista general (módulo nuevo, decisión importante, cambio de arquitectura) — no duplicar el detalle línea por línea.
3. Si una sección queda desactualizada respecto a los archivos `.claude/`, esos archivos mandan.
