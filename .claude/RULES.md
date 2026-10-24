# RULES.md

Reglas duras de **este** repo. Orden: RULES.md manda sobre las skills `estandares-*`.
El código existente no es regla: si difiere de una skill y no está en §1, se
pregunta al usuario y, si lo confirma, se anota en §1. Lo que una skill ya dice
igual no se repite: se remite a ella.

---

## 1. Dónde este repo difiere de los estándares

No aplicar el estándar global a ciegas. Aquí:

| Estándar global | Este repo |
|---|---|
| Next 16 App Router, `src/app/` | **Next 14 Pages Router**, `src/pages/` (rutas en español: `/pacientes`); React 18 |
| Tailwind 4, tokens en `@theme` de `globals.css` | **Tailwind 3**, tokens en `tailwind.config.js` + `src/shared/design/tokens.ts` |
| react-hook-form + Zod | **Formik + Yup** (`useFormik`, esquemas `Yup`) |
| npm, `npm run` | **yarn** |
| ESLint 9 / TypeScript 7 nativo | ESLint 8 vía `next lint`; TypeScript 5 con `tsc --noEmit` |
| `lint` + `typecheck` + `build` al cerrar | **Sin `next build`** para validar: solo `yarn lint && yarn typecheck` |
| Route Handler → Service → Repository → Drizzle/Neon, `AppError`, `withErrorHandling` | **Solo frontend** que consume `standard-saas-api`: no hay capa de servidor propia ni base de datos aquí. Ver §6 |
| Cloudflare Workers + OpenNext, R2 | Vercel (pendiente, P0-2); los archivos viven en el R2 del API |
| `middleware.ts`, `shared/config/server-env.ts` | Guard por página con `getServerSideProps` (§5) y `NEXT_PUBLIC_*` |
| Estructura de `src/` con `app/` | Igual en `components/` y `shared/`, pero con `src/pages/`, `src/hocs/auth.tsx` y `src/hooks/` (ver ARCHITECTURE.md) |
| React Query: `staleTime` 5 min | TanStack Query 5; `staleTime` según la query, de 30 s (`appointments-query.ts`) a 30 min (`use-session.ts`); `patients-query.ts` y `calendar-feed-query.ts` no definen uno (0) y el `QueryClient` de `_app.tsx` no tiene default (solo `refetchOnWindowFocus: false` y `retry: 1`) |
| Debounce de búsqueda 400 ms | **300 ms** (`use-patient-activity.ts`, `use-patient-picker.ts`) |
| Teléfonos con `PhoneField`, `+506 8888-7777`, solo dígitos con código de país | Sin `PhoneField`. `patient.phone` se guarda como `+506 XXXX-XXXX` (`COUNTRY_PREFIX` en `patient-validation.ts`) y los contactos como `XXXX-XXXX` (`formatPhone`, `resolveContactsForSave`); en edición se aceptan números extranjeros. No cambiar el formato del dato: lo comparte Zynka |
| Fechas: DB en UTC, negocio en `America/Costa_Rica`, `timeZone` al formatear | Hora local del navegador (`src/shared/utils/dates.ts`, `CLINIC_LOCALE = 'es-CR'`), sin `timeZone` al formatear; solo la bitácora manda el `timeZone` del navegador al API |
| Dato vacío: "Sin registrar" | `EMPTY_VALUE = '—'` (`src/shared/utils/formatters.ts`) en la agenda y otras vistas compactas; "Sin registrar" solo en `FormViewSection`. Pendiente de decisión del usuario |

---

## 2. Colores y marca

Ver skill `estandares-frontend` (Colores y UI): sin hex en el JSX, solo tokens;
`brand` único acento; `ink` neutros; variantes por enum.

- Los tokens viven en `tailwind.config.js` y se documentan en `src/shared/design/tokens.ts`.
- **Excepción única:** `rainbow-stripe.tsx`, que pinta los 6 colores de marca desde
  `BRAND_COLORS`. Son datos de identidad, no decisiones de interfaz.
- **Por qué:** Zynka llegó a tener dos paletas rivales: ~60 hex escritos a mano,
  uno dentro del componente `Button`, y re-brandear exigía cazarlos.
- **Verificación:**
  ```bash
  grep -rEo "(bg|text|border)-\[#[0-9a-fA-F]{3,8}\]" src/ | wc -l   # debe dar 0
  ```
- **Logo:** dos archivos (no `brightness-0 invert`) y a `BrandLogo` solo se le pasa
  la altura; detalle en `BRAND.md`.
- **Antes de tocar logo, favicon o colores de marca, leer `BRAND.md`.**

---

## 3. Layout y navegación

### 3.1 Las acciones de un registro van en el header

| Contexto | Dónde |
|---|---|
| Acción de un registro ("Editar") | Header de la página, vía `action` de `AppLayout` |
| Acción de un listado ("Nuevo X") | Barra de filtros, a la derecha |
| Volver | Chevron en el header (`backHref`), nunca un enlace en el contenido |

**Por qué:** un enlace "volver" gasta una fila entera del contenido, y en móvil
los botones dentro de una tarjeta compiten por el ancho con los datos.

Número de acciones: *1 en desktop → botón visible; más de 1, o móvil → menú de
tres puntos*. (Excepción vigente: las acciones frecuentes del paciente van a la
vista, D17.)

### 3.2 El título del header es el nombre del registro

En una página de detalle, el header muestra el nombre del paciente y "Expediente"
como subtítulo. Hace de rastro de navegación y evita repetir el nombre dentro del
contenido.

### 3.3 Lo importante arriba

En el expediente, la tarjeta del paciente va en tres franjas: quién es (nombre,
cédula, edad), lo de uso diario (próxima cita y contactos) y al pie nacimiento y
sede. Todo visible siempre, sin "ver más". Correo, dirección y fecha de registro
no se muestran (ver D11). El azul queda solo para las acciones.

### 3.4 Tablas y listas

Ver skill `estandares-frontend`: sin scroll horizontal (tablas → tarjetas) y los
cuatro estados de lista, donde solo el vacío ofrece "crear". Aquí los resuelve
`ResponsiveTable` (pasar `hasActiveFilters`); no se reimplementan por pantalla.

---

## 4. Texto e i18n

Ver skill `estandares-frontend` (i18n y Colores y UI): todo texto visible sale de
i18n con tildes y ñ, orden de búsqueda de keys (`TEXT.GENERAL` primero), plurales,
`Typography` para tamaño y peso, "Sin registrar" en datos vacíos, y escribir
texto con Write o Python UTF-8, no heredocs. En este repo:

- **"Sin registrar" en gris (`ink`):** un hueco sin marca se confunde con un error
  de carga.
- `i18next` + `react-i18next`, inicializado por *side-effect import* en `_app.tsx`
  (`import '@/shared/i18n/i18n';`), sin `I18nextProvider`. Hay un único idioma
  (`src/static/texts/es.json`, con `TEXT` en `src/static/texts/i18n.ts`); no existe
  `i18n-config.ts` ni `getT()` de servidor.
- Interpolación con `{{variable}}` en el JSON y segundo argumento de `t()`
  (`t(TEXT.PATIENTS.DETAIL.COUNT, { count })`).
- **Esquemas Yup, no Zod:** se arman con `t`, dentro del hook con `useMemo` o como
  factory que recibe `t` (ejemplo: `buildClinicalTemplateSchema(t)` en
  `src/components/containers/clinical-history-template/clinical-template-form.ts`).
  Nunca `i18n.t()` importado directo ni un esquema a nivel de módulo con `t()`:
  `i18n.t()` importado se salta el ciclo de vida de React y no re-renderiza.
  `patient-validation.ts` todavía tiene el esquema a nivel de módulo (pendiente P1-5).
- Migración pantalla por pantalla: cada pantalla que se toca migra sus textos
  sueltos (pendiente P1-5: lista, formulario y validación de pacientes).
- Las 9 variantes de `Typography` ya traen su salto responsive: nunca tamaños por
  `className` ni `<h1 className="text-2xl ...">`.

---

## 5. Código

Ver skill `estandares-frontend` (Código): container + hook (el container nunca
importa React Query), sin `any`, enums, `isLoading`, sin abreviaciones, nada
quemado, errores de red → toast desde el hook (listas y detalle ofrecen
"Reintentar"), componentes genéricos antes que etiquetas sueltas. Además, aquí:

1. **Guard en toda página privada:**
   `export const getServerSideProps = authorizeServerSidePage();`
2. **Navegación** por `useNavigation()` o `<Link href={routesPrivate...}>`.
3. **Lo reutilizable va a `utils` o a un helper.** Fechas, formatos y cálculos
   genéricos → `src/shared/utils/`. Tokens de estilo (colores, opacidad,
   franjas) → `src/shared/design/tokens.ts`. Mapas de estilo de un módulo
   (`Record<Enum, string>`) → un archivo `{modulo}-styles.ts`, no dentro de un
   componente ni de un hook.
4. **Componentes, no archivos largos.** Si un bloque de JSX tiene nombre propio
   (una lista, una ficha, una fila), es un componente. Un componente por archivo; el
   container solo compone. El container de la agenda
   llegó a casi 600 líneas antes de separarlo.
5. **Genéricos propios:** `Button` (variante `CARD` para filas clicables),
   `Badge`/`BranchBadge` para píldoras, `ColorDot` para puntos de color. Un
   `<span>` o `<button>` con clases a mano se desalinea del resto; si falta el
   genérico, se crea en `src/components/common/`.
6. **El estado del paciente es `status`, nunca `isActive`.** Las consultas de
   pacientes van con `PatientStatusFilter.ALL` (como el listado) y filtran por
   `filters.status`; ninguna pantalla muestra ni filtra por `isActive`, que es
   el borrado lógico viejo. Mezclarlos escondía de la agenda a pacientes que
   el resto de la app mostraba como activos (ver `DECISIONS.md`, 2026-10-04).
7. **Sin `any`:** el tipo va en `src/types/` y se pasa como genérico; `unknown` +
   narrowing si la forma es incierta.

---

## 6. El API

Este frontend consume `standard-saas-api`. Cuando una funcionalidad lo necesita,
el API se cambia en su propia rama con PR a `develop`, igual que el front; las
migraciones a producción las aplica la acción `[Release] Production` al
mergear a `main` (D24).

### Comportamientos verificados del API

- `DELETE /patients/:uuid` es **soft delete** y `PATCH` **ignora `isActive`**:
  un paciente eliminado **no se puede reactivar** desde el frontend. Quedan
  registros viejos con `isActive = false` y `status = ACTIVE`: el listado los
  muestra, así que se tratan por su `status`.
- El CORS del API solo acepta los orígenes de `ALLOWED_ORIGINS`: en local la
  app corre en `localhost:3000` (`yarn dev` lo fija). En otro puerto el login
  falla como si no hubiera internet.
- El upload va por `fetch` directo, no por `ApiServiceClient` — con `FormData`
  el navegador debe fijar el `Content-Type` con su boundary.
- `response.json()` **debe** ir protegido: hay endpoints que responden 200 sin
  cuerpo y lanzaría `SyntaxError`.
- El aislamiento por tenant sale del **JWT**; el frontend nunca envía
  `tenantUuid`.

---

## 7. Roles y permisos

Pensado para varias clínicas (multi-tenant): cada usuario tiene un rol y lo que
ve sale de ese rol, nunca del nombre de la clínica.

| Rol | Quién es | Ve |
|---|---|---|
| `OWNER` | Dueño (puede ser médico) | Todo |
| `ADMIN` | Administrador | Todo |
| `DOCTOR` | Médico | Todo, incluido cambiar las preguntas de la historia clínica |
| `STAFF` | Empleado: recepción, secretaría | Pacientes (datos generales, contactos, citas), Agenda y Archivos. **No** ve historia clínica, Control de evolución, Bitácora ni las preguntas |

- Los permisos viven en `src/shared/auth/permissions.ts` (`Permission` y
  `ROLE_PERMISSIONS`); se consultan con `usePermissions().can(...)`. Nunca
  comparar el rol suelto en un componente.
- Una pantalla entera va dentro de `RequirePermission`; un bloque del expediente
  se renderiza solo con el permiso, para que ni siquiera pida sus datos.
- Una entrada del menú lateral lleva `permission` y se oculta sin él.
- **`permissions.ts` debe coincidir con `CLINICAL_ACCESS_ROLES` del API**
  (medical-records): ocultar en pantalla no protege datos clínicos (Ley 8968). Un
  permiso nuevo se agrega en los dos lados.

---

## 8. Versiones y notificaciones de novedades

Cada salida a producción (PR de `develop` a `main`) es una **versión** y llega a
la clínica como una notificación en la bandeja del menú del usuario.

Todo el proceso está en la skill `nueva-version`.

1. **Antes de abrir el PR a main:** `yarn release:bump X.Y.Z` (sube `package.json`
   y prepara la entrada en `src/static/releases.ts` y `es.json`). Cada cambio es
   una novedad, una mejora o una corrección, con tema y descripción en `es.json`.
2. **Mostrarle al usuario el borrador de las novedades y esperar su OK** antes de
   abrir el PR. Nunca se publica un changelog que no vio.
3. `yarn release:check` limpio. El workflow `[CHECK] Versión documentada` lo exige
   en cada PR a main: la versión tiene que ser mayor que la de main y traer sus novedades.
4. Al mergear a main, `[Release] Etiqueta de versión` marca el commit con `vX.Y.Z`.

**Cómo se escriben:** pensadas para el personal de la clínica, no para
desarrolladores. Tono sobrio de sistema médico: "Tema: descripción", sin emojis.
Generales, sin detalle técnico ni de cómo funciona por dentro ("Una hoja nueva
para la primera visita del paciente", no "guarda la copia de las preguntas en
templateSnapshot"). Pocas palabras por cambio.

---

## 9. Antes de cada commit

```bash
yarn lint && yarn typecheck
```

Ambos limpios. **No** correr `next build` para validar cambios.

Si un hook de pre-commit falla, se corrige la causa. Nunca `--no-verify`.
