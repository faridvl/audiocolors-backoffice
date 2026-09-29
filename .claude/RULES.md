# RULES.md

Reglas duras del proyecto. Cada una existe porque se rompió algo concreto —
en Zynka, en este repo, o durante la sesión que lo creó. No son preferencias
de estilo: romperlas reintroduce un defecto que ya se pagó.

---

## 1. Colores

### 1.1 Ningún hex suelto en el JSX

```tsx
// ❌ NUNCA
<div className="bg-[#1f6fb1]">
<span style={{ color: '#e3211e' }}>

// ✅ SIEMPRE
<div className="bg-brand">
<span className="text-danger">
```

**Por qué:** Zynka terminó con **dos paletas rivales** — `#2563EB` declarado en
tokens y `#1E3A8A` / `#0B3C5D` / `#14B8A6` escritos a mano en ~60 sitios, uno de
ellos dentro del componente `Button` base. Re-brandear exigía cazarlos a mano.

**Excepción única:** `rainbow-stripe.tsx`, que pinta los 6 colores de marca desde
`BRAND_COLORS`. Son datos de identidad, no decisiones de interfaz.

**Verificación:**
```bash
grep -rEo "(bg|text|border)-\[#[0-9a-fA-F]{3,8}\]" src/ | wc -l   # debe dar 0
```

### 1.2 Los colores de marca se miden, no se estiman

Los seis colores del logo son los del manual de marca oficial (`PALETA DE
COLORES`). Una primera versión los estimó contando píxeles del JPEG original y
los seis quedaron ligeramente distintos.

Viven en `src/shared/design/tokens.ts` → `BRAND_COLORS`. Si hace falta uno nuevo,
se mide del archivo de marca; no se inventa.

### 1.3 Un solo acento

`brand` (azul `#1f6fb1`, la R del logo) es el **único** color de acento: acción
primaria, estado activo y foco. Los grises son `ink`, **neutros sin tinte azul** —
un chrome azulado compite con un logo multicolor.

`success` es teal (`#0d9488`), no verde, para no confundirse con la marca.

---

## 2. Marca y assets

### 2.1 El logo sale de los vectores, no de un JPEG

El manual de marca (`AUDIOCOLORS LOGO Y VARIANTES.ai`) tiene 24 variantes
vectoriales y se lee con **PyMuPDF** (`import fitz`), que está disponible en el
entorno. Un JPEG reescalado se ve blando; el vector no.

Al convertir a PNG con transparencia: **renderizar sin alfa sobre fondo opaco y
derivar el alfa de la distancia al fondo.** Renderizar con alfa directamente
produce píxeles de color basura (`rgb(0,255,0)` con alfa 1-4) que ensucian los
bordes y dan aspecto lavado.

### 2.2 Dos archivos, no un filtro CSS

Fondo claro → `logo-audiocolors.png` ("audio" gris).
Fondo oscuro → `logo-audiocolors-dark.png` ("audio" blanco).

Nunca `brightness-0 invert`: aplana también las letras de color y mata la marca.

### 2.3 El favicon es un símbolo, no el logo entero

El logo completo a 32px es una mancha ilegible. El favicon usa **solo la oreja**,
sin los puntos de color (a ese tamaño son ruido) y con **fondo transparente**.

### 2.4 Al logo se le pasa la altura, nunca el ancho

```tsx
<BrandLogo height={40} />           // ✅ el ancho sale de la proporción 2.49:1
<BrandLogo className="h-11 w-32" /> // ❌ deforma o recorta
```

**Por qué:** fijar ambos a mano cortó la "S" del logo en el sidebar.

---

## 3. Layout y navegación

### 3.1 Las acciones de un registro van en el header

Patrón de un back-office de referencia, verificado en producción:

| Contexto | Dónde |
|---|---|
| Acción de un registro ("Editar") | Header de la página, vía `action` de `AppLayout` |
| Acción de un listado ("Nuevo X") | Barra de filtros, a la derecha |
| Volver | Chevron en el header (`backHref`), nunca un enlace en el contenido |

**Por qué:** un enlace "volver" gasta una fila entera del contenido, y en móvil
los botones dentro de una tarjeta compiten por el ancho con los datos.

Regla para el número de acciones: *1 en desktop → botón visible; más de
1, o móvil → menú de tres puntos*.

### 3.2 El título del header es el nombre del registro

En una página de detalle, el header muestra el nombre del paciente y "Expediente"
como subtítulo. Hace de rastro de navegación y evita repetir el nombre dentro del
contenido.

### 3.3 Nada de scroll horizontal en tablas

En móvil, `ResponsiveTable` renderiza **tarjetas de pares etiqueta/valor**. Una
tabla de 5 columnas en un teléfono es ilegible y el scroll lateral esconde justo
la columna que se necesita.

### 3.4 Lo importante arriba

En el expediente, los documentos son lo que se consulta a diario. Los datos del
paciente se resumen en una franja de una línea; lo secundario (correo, dirección,
fecha de nacimiento) se despliega con un enlace de texto, no con un botón que
compita visualmente.

---

## 4. Estados de interfaz

### 4.1 Cuatro estados, siempre

Toda lista resuelve: **cargando · error · vacío-sin-datos · vacío-por-filtros**.
`ResponsiveTable` los implementa; no se reimplementan por pantalla.

### 4.2 "No hay datos" y "los filtros no arrojan nada" son distintos

Mensajes distintos, y **solo el primero ofrece el botón de crear**. Ofrecer
"Nuevo paciente" cuando la búsqueda no encontró nada confunde.

### 4.3 Un campo vacío nunca se deja en blanco

"Sin registrar" en gris. Un hueco sin marca se confunde con un error de carga.

---

## 5. Texto

### 5.1 Español con tildes y ñ

`años`, no `anios`. `Cédula`, `Teléfono`, `sesión`, `contraseña`.

**Por qué:** al escribir archivos con heredocs de shell se evitaron los acentos y
llegaron al texto visible. Hubo que corregir ~20 archivos después.

**Al escribir texto visible en español, usar la herramienta Write o un script
Python con `encoding='utf-8'`, no heredocs de bash.**

### 5.2 i18n con `i18next` + `es.json`, patrón de Zynka

**Decisión revertida (2026-09-16):** este proyecto declaraba "sin i18n,
mono-idioma" — se revierte. Los textos hoy están hardcodeados directo en el
JSX (~17 de 29 archivos `.tsx`); hay que migrar al mismo patrón que usa Zynka
(`next-audiology-files`), que es la base de este repo y de magastore:

- `i18next` + `react-i18next`, inicializado por *side-effect import* en
  `_app.tsx` (`import '@/shared/i18n/i18n';`), sin `I18nextProvider` explícito.
- Keys tipadas en `src/static/texts/i18n.ts` — `export const TEXT = {...} as const`,
  anidado por módulo (`PATIENTS.LIST.COLUMNS.NAME`, `AUTH.LOGIN.TITLE`, etc.).
- Traducciones en `src/static/texts/es.json`, JSON anidado espejo de `TEXT`.
- Uso: `const { t } = useTranslation()` en el componente, `t(TEXT.MODULO.CLAVE)`.
  Interpolación con `{{variable}}` en el JSON y segundo argumento de `t()`
  (ej. `t(TEXT.PATIENTS.DETAIL.COUNT, { count })`).

**Ojo:** magastore-backoffice tiene esta infraestructura instalada pero con
**0% de uso real** (es una copia sin terminar del setup de Zynka, incluso su
`es.json` dice `"business.name": "Zynka"`). La referencia de patrón *en uso*
real es Zynka (~30% de cobertura), no magastore.

Implementado (2026-09-24): `src/shared/i18n/i18n.ts` + `src/static/texts/`.
Migración pantalla por pantalla, no de una vez — cada vez que se toca una
pantalla se migran sus textos sueltos.

### 5.3 Antes de agregar una key nueva a i18n

1. Buscar si el texto ya existe en `TEXT.GENERAL` (botones, paginación,
   mensajes de validación comunes tipo "Requerido", "Correo inválido").
2. Si existe, reutilizar esa key — no crear una nueva con el mismo valor.
3. Si el texto es genérico pero no está todavía (ej. "Reintentar",
   "Guardando..."), agregarlo a `GENERAL` en vez de duplicarlo por módulo.
4. Si es específico de una pantalla (un subtítulo, un placeholder con
   contexto propio), va bajo su módulo (`AUTH.LOGIN`, `PATIENTS.LIST`).

### 5.4 Siempre `t()` del hook — nunca `i18n.t()` importado directo

```tsx
// ✅ En un componente
const { t } = useTranslation();
<title>{t(TEXT.AUTH.LOGIN.PAGE_TITLE)}</title>

// ✅ Schema de Yup usado por un solo hook — se arma DENTRO del hook con
// useMemo para tener acceso a t(), no como constante de módulo
export function useLogin() {
  const { t } = useTranslation();
  const loginValidationSchema = useMemo(
    () => Yup.object({ email: Yup.string().required(t(TEXT.AUTH.LOGIN.VALIDATION.EMAIL_REQUIRED)) }),
    [t],
  );
  return { loginValidationSchema, /* ... */ };
}

// ✅ Schema compartido por varios hooks (ej. patient-validation.ts, usado por
// create Y edit) — se exporta una función factory que recibe `t`, cada hook
// la llama dentro de su propio useMemo
export function buildPatientCreateSchema(t: TFunction) {
  return Yup.object({
    firstName: Yup.string().required(t(TEXT.PATIENTS.VALIDATION.FIRST_NAME_REQUIRED)),
  });
}
// en el hook: const schema = useMemo(() => buildPatientCreateSchema(t), [t]);

// ❌ NUNCA import i18n from '@/shared/i18n/i18n' + i18n.t(...) para evitar
// pasar por el hook — ni a nivel de módulo ni dentro de un componente
// ❌ NUNCA un schema armado a nivel de módulo con t() de un useTranslation()
// capturado fuera de cualquier función (no compila / no tiene t disponible)
```

**Por qué:** `i18n.t()` importado directo esquiva el ciclo de vida de React
(no se recalcula si cambia el idioma, no reporta como dependencia de hooks).
Un schema de validación a nivel de módulo no tiene acceso a `t()` porque
`useTranslation()` es un hook — la solución nunca es importar `i18n` directo,
sino mover el schema dentro del hook que lo usa (`useMemo`) o, si lo comparten
varios hooks, exportarlo como función factory que recibe `t` como parámetro.

### 5.5 El texto sale de la variante tipográfica

```tsx
<Typography variant={TypographyVariant.HEADER}>        // ✅
<Typography className="text-2xl font-bold">            // ❌
<h1 className="text-2xl font-bold">                    // ❌
```

Las 9 variantes ya traen su salto responsive. Pasar tamaños por `className`
rompe la escala.

---

## 6. Código

1. **Container + hook.** `{feature}-container.tsx` solo renderiza;
   `use-{feature}.ts` tiene queries, mutations, estado y handlers. El container
   nunca importa React Query.
2. **Sin `any`.** Tipo en `src/types/` y pasarlo como genérico. `unknown` +
   narrowing si la forma es incierta.
3. **Enums para valores discretos**, no uniones de strings literales.
4. **`isLoading`**, nunca `loading`.
5. **Sin abreviaciones**: `patient` no `p`, `error` no `err`.
6. **Guard en toda página privada:**
   `export const getServerSideProps = authorizeServerSidePage();`
7. **Navegación** por `useNavigation()` o `<Link href={routesPrivate...}>`.
8. **Errores de red → toast desde el hook**, no pantalla de error. Excepción:
   listas y detalle, que ofrecen "Reintentar".

---

## 7. El API no se toca

Este frontend consume `standard-saas-api` **sin modificarlo**. Lo comparte con
Zynka: un cambio incompatible rompe el otro sitio.

Si una funcionalidad necesita un cambio en el API, **se discute antes**; no se
implementa por cuenta propia.

### Comportamientos verificados del API

- `DELETE /patients/:uuid` es **soft delete** y `PATCH` **ignora `isActive`**:
  un paciente eliminado **no se puede reactivar** desde el frontend.
- El upload va por `fetch` directo, no por `ApiServiceClient` — con `FormData`
  el navegador debe fijar el `Content-Type` con su boundary.
- `response.json()` **debe** ir protegido: hay endpoints que responden 200 sin
  cuerpo y lanzaría `SyntaxError`.
- El aislamiento por tenant sale del **JWT**; el frontend nunca envía
  `tenantUuid`.

---

## 8. Antes de cada commit

```bash
yarn lint && yarn typecheck
```

Ambos limpios. **No** correr `next build` para validar cambios.

Si un hook de pre-commit falla, se corrige la causa. Nunca `--no-verify`.
