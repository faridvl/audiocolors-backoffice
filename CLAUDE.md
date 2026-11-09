# CLAUDE.md

**AudioColors · Gestión Clínica**: back-office de una clínica auditiva en Costa
Rica, solo frontend (consume `standard-saas-api`). Lo usa el personal; no hay
registro público. Recorte de Zynka (`next-audiology-files`).

@.claude/HANDOFF.md
@.claude/RULES.md
@.claude/ARCHITECTURE.md

## Las tres reglas que más se rompen

1. **Todo texto visible sale de i18n:** `t(TEXT.MODULO.CLAVE)` con su espejo en `es.json`.
2. **Colores por token, nunca hex suelto:** `bg-brand`, no `bg-[#1f6fb1]`.
3. **Español con tildes.** Escribir con Write o Python UTF-8, no heredocs de bash.

## Comandos
`yarn dev` (:3000 fijo, el CORS del API lo exige) · `yarn lint` · `yarn typecheck`
· `yarn release:bump X.Y.Z` (antes de un PR a main) · `yarn release:check`.
Antes de cada commit: `yarn lint && yarn typecheck`. **No** correr `next build`.

## Leer a pedido
| Archivo | Cuándo |
|---|---|
| `.claude/DECISIONS.md` | Antes de cambiar algo ya decidido (D1–D25) |
| `.claude/STATUS.md` | Para ver fases, pendientes y datos del entorno |
| `.claude/BRAND.md` | Antes de tocar logo, favicon, colores de marca o assets |
| `docs/ALTA-TENANT.md` | Al dar de alta una clínica o sus usuarios |
| `docs/AMBIENTE-LOCAL.md` | Para levantar API y bases en local |
| `docs/OVERVIEW.md` | Para una vista general de todo el proyecto |
| `docs/novedades/HISTORIAL.md` | Al preparar novedades: qué commits cubre cada entrega (solo local, no versionado) |

## Tenant
`tenantUuid` `9e781ab3-f1db-4311-a9a2-ae2afb595718` · `tenantId` `12` · `businessType` `AUDIOLOGY`.
Usuarios: `admin@audiocolors.com` (OWNER) · `maria@audiocolors.com` (ADMIN). Contraseña
temporal: la tiene el usuario; P0-1 cambiarla antes de entregar. Nunca insertar usuarios
directo en la DB (bcrypt): ver `docs/ALTA-TENANT.md`.

## Repos relacionados
| Repo | Ubicación | Rol |
|---|---|---|
| API | `E:\Proyectos\node\standard-saas-api` | Backend compartido |
| Zynka | `D:\Documentos\Proyectos\React\next-audiology-files` | Origen del código |
| Landing | `D:\Documentos\Proyectos\React\landing-audiocolors` | Identidad visual |
| Marca | `D:\Documentos\audio colors\docs audio colors` | Manual `.ai`, fotografía |

## Agentes y skills del repo
`brand-assets` (regenerar logo, favicon o variantes desde el manual vectorial) ·
`ui-audit` (auditar la UI contra las reglas antes de un push) · `nueva-seccion` (CRUD
completo con los patrones del repo) · `novedades` (solo local, no versionado: imagen de novedades para el
cliente y su registro en `HISTORIAL.md`) · `nueva-version` (bump, changelog aprobado por el usuario y PR
a main). `commit` es skill global de la cuenta. No duplicar como skill algo que ya resuelve
un comando o un agente de la cuenta.

## Al cerrar una etapa
Actualizar `.claude/HANDOFF.md` (qué sigue, preguntas abiertas), `.claude/STATUS.md`
(mover lo hecho a Completado) y, si se tomó una decisión que alguien podría querer
revertir sin contexto, `.claude/DECISIONS.md`.
