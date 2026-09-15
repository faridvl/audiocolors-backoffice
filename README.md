# audiocolors-backoffice

Back-office de **AudioColors · Expedientes** — gestión de pacientes y sus archivos clínicos (recetas, audiometrías, facturas, garantías).

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

Definidos como tokens en `tailwind.config.js` (`brand` naranja `#f97316`, `navy`). **Nunca usar hex sueltos en el JSX** — Zynka acabó con dos paletas rivales y ~60 valores arbitrarios por saltarse esta regla.

---

## Roadmap

- [x] Scaffold + branding AudioColors
- [x] Alta del tenant
- [x] Autenticación y layout
- [x] Pacientes: lista, alta, edición
- [x] Expediente: datos + archivos con preview
- [ ] Cambio de contraseñas antes de producción
- [ ] Despliegue
