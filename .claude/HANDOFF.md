# HANDOFF.md

Traspaso entre sesiones. Una página como máximo: se actualiza en el momento en que
el usuario explica o decide algo y antes de cada commit; lo cerrado pasa a
`DECISIONS.md` y se borra de aquí. Detalle de avance en `STATUS.md`.

## Qué quiere el usuario

- **Objetivo:** un back-office de la clínica auditiva AudioColors, de alcance
  mínimo a propósito, pensado para que más clínicas (multi-tenant) lo usen sin
  lógica por clínica en el código (D1, D20).
- **Pedidos de la clínica que ya son decisión:** acciones del paciente a la vista
  (D17), datos del expediente siempre visibles (D11), resumen también en el
  celular (D16), permisos por rol (D19).
- Las novedades de cada versión se redactan sobrias, sin emojis, para el personal
  de la clínica, y el usuario las aprueba antes del PR (D23, RULES.md §8).
- Los cambios del API siguen el mismo flujo que el front: rama propia y PR a
  `develop` (D24).

## Reglas de negocio confirmadas

Roles y permisos: RULES.md §7. Reglas de layout y código: RULES.md.

- El estado del paciente es `status` (activo, inactivo o fallecido); un fallecido
  pierde sus citas pendientes y no se le ofrece agendar.
- "Control" es el tipo de cita marcado como control en Configuración, no un
  nombre (D22).
- La agenda va de 8:00 a 18:00 en líneas de media hora; la cita dura lo que su
  tipo y al moverla conserva su duración (D10).
- El primer contacto del paciente es el teléfono principal (D12).
- Editar la historia clínica la actualiza y deja un PDF en Archivos con qué
  cambió y quién (D18).
- Calendario del iPhone: un calendario por sede, o por sede y tipo, solo en
  iPhone (DECISIONS, 2026-10-09).

## En qué estamos

- **v1.0.0 publicada el 2026-10-23** (back-office #24, API #16) con historia
  clínica, Configuración, agenda por horario, permisos por rol y bandeja de
  notificaciones/novedades por versión. `develop` = `main`.
- Contexto de Claude recortado (rama `chore/contexto-claude`): `CLAUDE.md` es un
  índice y solo se importan este traspaso, `RULES.md` y `ARCHITECTURE.md` (D25).

## Qué sigue

1. **P0-1** contraseña temporal: la tiene el usuario; cambiarla antes de entregar.
   **Urgente:** ya está en el historial de un repo público; cambiarla cuanto antes
   (es la única solución).
2. **P0-2** desplegar en Vercel con `backoffice.audiocolorscr.com` (proyecto
   aparte del landing; las `NEXT_PUBLIC_*` antes del primer deploy).
3. **P0-3** revisar en producción los tipos de cita en Configuración → Tipos de
   cita: la clínica edita sus duraciones (hoy Cita 60 min, Control y
   Mantenimiento 30) y Control debe estar marcado como control.
4. Luego **P3-1** (Configuración: faltan sedes y usuarios, D21) y **P3-2**
   (permisos configurables por el administrador, D20).

## Preguntas abiertas

- Registros viejos con `isActive = false` y `status = ACTIVE`: ¿se reactivan o
  pasan a `INACTIVE`? Decidirlo en el API (DECISIONS, 2026-10-04).
- Si una cita empieza a las 18:00 o después, en UTC ya es el día siguiente: el
  API tendría que filtrar por día local (D10). La línea de tiempo llega a las 18:00.
- Dato vacío: la skill pide "Sin registrar" y el código usa `—` (`EMPTY_VALUE`) en
  la agenda y vistas compactas. ¿Cuál se queda? (RULES.md §1)
- Leídas y limpiadas de Notificaciones se guardan por navegador: ¿hace falta
  sincronizarlas entre dispositivos, guardándolas en el API? (D23)
- Logo definitivo en SVG desde Illustrator (P1-1) y limpiar el paciente inactivo
  huérfano (P1-2, requiere acceso a la base).
