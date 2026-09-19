# audiocolors-backoffice

Back-office de **AudioColors · Gestión Clínica** — gestión de pacientes y sus archivos clínicos (recetas, audiometrías, facturas, garantías).

Lo usa el personal de la clínica. No es un portal de pacientes: no hay registro público ni auto-servicio; las cuentas las crea el administrador.

---

## Qué hace

| Incluido | No incluido (por ahora) |
|---|---|
| Login | Registro / recuperación de contraseña |
| Lista de pacientes con búsqueda y filtros | Citas y agenda |
| Alta y edición de pacientes | Inventario y audífonos |
| Expediente: datos + archivos adjuntos | Audiogramas, notas clínicas, encuentros |
| Subir, previsualizar y eliminar PDFs e imágenes | Reportes PDF, plantillas clínicas |

---

## Arranque

```bash
yarn            # instalar dependencias
yarn dev        # servidor en http://localhost:3000
yarn lint       # ESLint
yarn typecheck  # tsc --noEmit
```

Crear `.env.local` a partir de `.env.example`:

```env
NEXT_PUBLIC_IDENTITY_API_URL=https://standard-saas-api-production.up.railway.app
NEXT_PUBLIC_MEDICAL_RECORDS_API_URL=https://medical-records-service-production.up.railway.app
```

Sin estas variables **todas las llamadas al API fallan** — no hay valores por defecto.

---

## Backend

Consume el mismo API que Zynka (`standard-saas-api`), **sin modificarlo**. AudioColors es un tenant más.

El aislamiento lo resuelve el JWT: cada endpoint del API lee `tenantUuid` del token, y el frontend nunca lo envía. Un usuario de AudioColors solo puede ver datos de AudioColors.

| Servicio | Uso |
|---|---|
| Identity | `POST /auth/login`, `GET /auth/me` |
| Medical Records | `/patients`, `/patients/:uuid/documents` |

### Tenant

| Dato | Valor |
|---|---|
| `tenantUuid` | `9e781ab3-f1db-4311-a9a2-ae2afb595718` |
| `tenantId` | `12` |
| businessType | `AUDIOLOGY` |

Creado con `POST /auth/register` (ver `docs/ALTA-TENANT.md`). Las contraseñas se hashean con bcrypt — **nunca insertar usuarios directo en la base de datos**.

> **Ambiente de pruebas.** Las credenciales actuales son temporales y deben cambiarse antes de entregar a la clínica.

---

## Stack

Next.js 14 (Pages Router) · TypeScript · Tailwind · TanStack Query 5 · Formik + Yup · Sonner

Sin i18n: mono-idioma español, strings directos en el JSX.

---

## Estructura

```
src/
├── pages/                 rutas (en español: /pacientes)
├── components/
│   ├── common/            typography, button, input, table, layout, brand
│   └── containers/        login, patients, documents
├── shared/
│   ├── api/               cliente, queries, mutations
│   ├── navigation/        routes.ts
│   └── utils/             cookies, formatters
├── hocs/auth.tsx          guard de páginas privadas
├── hooks/                 use-session, use-logout, use-navigation
└── types/                 auth, patients, documents
```

Convención: cada feature es `{feature}-container.tsx` (solo JSX) + `use-{feature}.ts` (toda la lógica). El container nunca importa React Query directo.

### Colores

Definidos como tokens en `tailwind.config.js`: `brand` (verde `#66ae36`, la O del logo) como único acento, e `ink` como escala de grises neutros. **Nunca usar hex sueltos en el JSX** — Zynka acabó con dos paletas rivales y ~60 valores arbitrarios por saltarse esta regla.

Los colores de marca están **medidos** del logo original, no estimados: ver [.claude/BRAND.md](.claude/BRAND.md).

---

## Documentación

Antes de tocar código, conviene revisar:

- [CLAUDE.md](CLAUDE.md) — índice general y las reglas que más se rompen.
- [.claude/RULES.md](.claude/RULES.md) — reglas duras del proyecto.
- [.claude/STATUS.md](.claude/STATUS.md) — estado actual y próximos pasos.
- [.claude/ARCHITECTURE.md](.claude/ARCHITECTURE.md) — estructura, auth y endpoints.
- [.claude/DECISIONS.md](.claude/DECISIONS.md) — decisiones tomadas y su porqué.
- [.claude/BRAND.md](.claude/BRAND.md) — identidad visual y regeneración de assets.
- [docs/ALTA-TENANT.md](docs/ALTA-TENANT.md) — alta de la clínica y de usuarios.

---

## Reglas de colaboración

- **Todo cambio se hace en un branch dedicado**, nunca directo sobre `main` o `develop`.
    - Ejemplo: `feature/filtro-citas`, `fix/preview-pdf`.
- **Los cambios llegan a `main` por Pull Request.** `develop` es la rama de trabajo activo.
- **Commits claros y descriptivos**, en español. Ejemplo: `fix(pacientes): agendar próxima cita como ícono`.
- **Antes de cada commit:** `yarn lint && yarn typecheck` limpios. No se corre `next build` para validar cambios.
- **El API no se toca** (`standard-saas-api`) — es compartido con Zynka; un cambio incompatible rompe el otro sitio.

## Flujo de trabajo sugerido

1. Cloná el repositorio y corré `yarn` para instalar dependencias.
2. Creá una rama desde `develop`: `git checkout -b fix/mi-cambio`.
3. Hacé tus cambios y confirmá con mensajes claros.
4. Sincronizá seguido con `develop` para evitar conflictos grandes.
5. Corré `yarn lint && yarn typecheck` antes de subir.
6. Abrí un Pull Request hacia `develop` (o hacia `main` cuando se libera una entrega).
