# CLAUDE.md

Guía para Claude Code en este repositorio.

## Lectura obligatoria al iniciar sesión

| Archivo | Qué contiene |
|---|---|
| [.claude/RULES.md](.claude/RULES.md) | **Reglas duras.** Cada una existe porque se rompió algo |
| [.claude/STATUS.md](.claude/STATUS.md) | Estado actual, próximo paso, pendientes |
| [.claude/ARCHITECTURE.md](.claude/ARCHITECTURE.md) | Estructura, auth, endpoints, multi-tenant |
| [.claude/DECISIONS.md](.claude/DECISIONS.md) | Decisiones tomadas y su porqué |
| [.claude/BRAND.md](.claude/BRAND.md) | Colores medidos, tipografía, cómo regenerar assets |

Sin leerlos no se sabe qué está decidido, qué está roto ni por qué el código
está como está.

## Qué es esto

**AudioColors · Gestión Clínica** — back-office de una clínica auditiva en Costa
Rica. Frontend únicamente. Alcance mínimo a propósito: **pacientes y sus
archivos adjuntos**.

No es un portal de pacientes: lo usa el personal de la clínica, no hay registro
público y las cuentas las crea el administrador.

Nació como recorte de `next-audiology-files` (Zynka, el SaaS multi-tenant en
construcción) para entregar a un cliente real sin esperar a que Zynka esté
completo.

## Las tres reglas que más se rompen

1. **El API no se toca.** Se comparte con Zynka; un cambio incompatible rompe el
   otro sitio. Si hace falta, se discute antes.
2. **Colores por token, nunca hex suelto.** `bg-brand`, no `bg-[#66ae36]`.
3. **Español con tildes.** `años`, no `anios`. Al escribir texto visible usa la
   herramienta Write o Python con UTF-8, no heredocs de bash.

## Comandos

```bash
yarn dev         # servidor en :3000
yarn lint        # ESLint
yarn typecheck   # tsc --noEmit
```

Antes de cada commit: `yarn lint && yarn typecheck` limpios.
**No** correr `next build` para validar cambios.

## Tenant

`tenantUuid` `9e781ab3-f1db-4311-a9a2-ae2afb595718` · `tenantId` `12` ·
`businessType` `AUDIOLOGY`

Usuarios (contraseñas temporales, cambiar antes de entregar):
`admin@audiocolors.com` (OWNER) · `maria@audiocolors.com` (ADMIN)

Alta de tenant y usuarios: [docs/ALTA-TENANT.md](docs/ALTA-TENANT.md).
Las contraseñas van con bcrypt — **nunca** insertar usuarios directo en la DB.

## Repos relacionados

| Repo | Ubicación | Rol |
|---|---|---|
| API | `C:\Users\Personal\Desktop\standard-saas-api` | Backend compartido |
| Zynka | `D:\Documentos\Proyectos\React\next-audiology-files` | Origen del código |
| Landing | `D:\Documentos\Proyectos\React\landing-audiocolors` | Identidad visual |
| Billo | `D:\Documentos\LDXLAB\web-backoffice-comx` | Referencia de estándares UI |
| Marca | `D:\Documentos\audio colors\docs audio colors` | Manual `.ai`, fotografía |

## Agentes y skills

| Nombre | Para qué |
|---|---|
| `brand-assets` | Regenerar logo, favicon o variantes desde el manual vectorial |
| `ui-audit` | Auditar la interfaz contra las reglas antes de un push |
| `nueva-seccion` | Añadir un CRUD completo siguiendo los patrones del proyecto |
| `commit` | Redactar el mensaje de commit (qué se hizo / qué se probó). Skill de usuario, no vive en este repo — aplica en cualquier proyecto de la cuenta |

## Al cerrar una etapa

1. Actualizar `.claude/STATUS.md` — mover lo hecho a Completado, ajustar el
   próximo paso.
2. Si se tomó una decisión que alguien podría querer revertir sin contexto,
   anotarla en `.claude/DECISIONS.md`.
