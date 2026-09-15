# CLAUDE.md

Guía para Claude Code al trabajar en este repositorio.

## Qué es esto

**AudioColors · Expedientes** — back-office de una sola clínica (AudioColors, centro auditivo en Costa Rica). Frontend únicamente.

Nació como recorte de `next-audiology-files` (Zynka, el SaaS multi-tenant en construcción) para poder entregarle a un cliente real sin esperar a que Zynka esté completo. Alcance deliberadamente mínimo: **pacientes y sus archivos adjuntos**.

No es un portal de pacientes. Lo usa el personal de la clínica; no hay registro público.

## Regla de oro: no tocar el API

Este repo consume `standard-saas-api` **sin modificarlo**. AudioColors es un tenant más y el aislamiento lo resuelve el JWT (cada controller lee `tenantUuid` del token; el frontend nunca lo envía).

Si una funcionalidad necesita un cambio en el API, **no se implementa aquí**: se discute primero. El API lo comparten dos frontends y un cambio incompatible rompe Zynka.

| Repo | Ubicación |
|---|---|
| API | `C:\Users\Personal\Desktop\standard-saas-api` |
| Zynka (origen del código) | `D:\Documentos\Proyectos\React\next-audiology-files` |
| Landing AudioColors (identidad visual) | `D:\Documentos\Proyectos\React\landing-audiocolors` |

## Tenant

`tenantUuid`: `9e781ab3-f1db-4311-a9a2-ae2afb595718` · `tenantId`: `12` · `businessType`: `AUDIOLOGY`

Usuarios de prueba (temporales, cambiar antes de producción):

| Rol | Correo |
|---|---|
| OWNER | `admin@audiocolors.com` |
| ADMIN | `maria@audiocolors.com` |

Contraseñas con bcrypt: los usuarios se crean por `POST /auth/register` o `POST /users`, **nunca por INSERT**.

## Endpoints consumidos

| Método | Endpoint | Servicio |
|---|---|---|
| POST | `/auth/login` | Identity |
| GET | `/auth/me` | Identity |
| GET/POST | `/patients` | Medical Records |
| GET/PATCH | `/patients/:uuid` | Medical Records |
| GET/POST | `/patients/:uuid/documents` | Medical Records |
| DELETE | `/patients/:uuid/documents/:documentUuid` | Medical Records |

Comportamientos verificados del API que conviene recordar:

- `DELETE /patients/:uuid` es **soft delete**, y `PATCH` **ignora `isActive`** — no se puede reactivar un paciente desde el frontend.
- El upload usa `multipart/form-data` y va por `fetch` directo, no por `ApiServiceClient` (el navegador debe fijar el boundary).
- R2 (Cloudflare) está configurado y operativo: los archivos quedan en URLs públicas.

## Estandares de UI

Tomados del back-office `web-backoffice-comx` (billo), un sistema de produccion
maduro, con los colores de AudioColors. Ubicacion: `D:\Documentos\LDXLAB\web-backoffice-comx`.

| Decision | Regla aqui |
|---|---|
| Tabla en movil | **Tarjetas apiladas** etiqueta/valor, nunca scroll horizontal (`responsive-table.tsx`) |
| Estados de lista | Cuatro, resueltos dentro de `ResponsiveTable`: cargando, error, vacio-sin-datos, vacio-por-filtros |
| Vacio por filtros vs sin datos | Mensajes distintos; solo el de "sin datos" lleva boton de creacion |
| Errores de red | Toast desde el hook, no pantalla de error (salvo la lista, que ofrece "Reintentar") |
| Paginacion | Numerada con elipsis, 10 por pagina, alineada a la derecha |
| Busqueda | Debounce de 300 ms dentro del hook; al escribir vuelve a pagina 1 |
| Filtros | Barra encima de la tabla; el activo se marca con `bg-brand-50 text-brand-700` |
| Boton de crear | A la derecha de la barra de filtros. Ancho completo en movil. Sin FAB |
| Secciones | `FormViewSection`: tarjeta en desktop, plana en movil. Sirve para ver y para editar |
| Detalle | Secciones apiladas con `FormViewLabel`, sin pestanas. Boton editar en la cabecera |
| Campo sin dato | "Sin registrar" en gris, nunca vacio |
| CTAs de formulario | Al pie, a la derecha en desktop y apilados a ancho completo en movil |
| Radios | `rounded-lg` controles, `rounded-card` contenedores, `rounded-full` chips |
| Tipografia | 9 variantes en `TypographyVariant`, todas con salto responsive propio |

## Convenciones

1. **Container + hook.** `{feature}-container.tsx` solo renderiza; `use-{feature}.ts` tiene queries, mutations, estado y handlers. El container nunca importa React Query.
2. **Colores por token.** `bg-brand` (verde `#6cb33f`), `text-ink-700`. Nunca hex arbitrario (`bg-[#6cb33f]`) — es el error que dejó a Zynka con dos paletas rivales y ~60 valores sueltos. El significado de cada token vive en `src/shared/design/tokens.ts`.
3. **Sin `any`.** Definir el tipo en `src/types/` y pasarlo como genérico. `unknown` + narrowing si la forma es incierta.
4. **Enums para valores discretos**, no uniones de strings literales.
5. **`isLoading`**, nunca `loading`.
6. **Navegación** por `useNavigation()` o `<Link href={routesPrivate...}>`; nunca `router.push` con string suelto.
7. **Guard en toda página privada:** `export const getServerSideProps = authorizeServerSidePage();`
8. **Texto por `<Typography>`**, no `<p>`/`<span>`/`<h*>` sueltos con copy. Los
   tamanos salen de la variante; no se pasan `text-lg`/`font-bold` por `className`.
9. **Sin i18n.** Mono-idioma español, strings en el JSX. (Se aparta de Zynka a propósito: i18next para un solo idioma es complejidad sin beneficio.)
10. **Sin abreviaciones** en nombres de variables: `patient` no `p`, `error` no `err`.

## Verificación

Antes de cada commit:

```bash
yarn lint && yarn typecheck
```

Ambos deben quedar limpios. No correr `next build` para validar cambios.
