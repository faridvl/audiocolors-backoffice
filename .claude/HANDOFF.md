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
- Mantenimientos (2026-10-28): el expediente tiene los mantenimientos 1 a 4; el
  personal marca cada uno a mano como asistido (azul) o perdido (rojo), o lo deja
  sin marcar. No se calculan desde las citas.
- Intentos de contacto (2026-10-28): un solo contador por paciente de cuántas
  veces se le llamó (1, 2 o 3), que el personal sube y reinicia a mano. No va
  ligado a una cita ni a un mantenimiento.
- Sedes (2026-10-28): un paciente tiene una o más sedes; en los filtros de la
  lista y la agenda aparece en todas, y cada cita se agenda en una de sus sedes.
  Los pacientes actuales conservan la sede que tienen.
- Secciones propias de Preguntas (2026-10-28): se crean, nombran y editan en
  Configuración. Se llenan varias veces: cada vez queda un registro con fecha y
  quién lo llenó, y el expediente muestra el historial. La historia clínica sigue
  igual (se llena una vez). Mismos permisos que la historia clínica.
- Otoscopías (2026-10-28): historial por paciente. Cada otoscopía es un registro
  con fecha, autor, OD y OI; "Nueva otoscopía" crea uno nuevo y nunca pisa el
  anterior. La tarjeta muestra la última con "Nueva otoscopía" y "Ver anteriores"
  (de la más reciente a la más vieja). Un registro se corrige solo el mismo día en
  que se creó; después queda fijo. No va ligado a una cita. La otoscopía que ya
  tiene cada paciente pasa a ser su primer registro. Se ve y se usa igual que el
  historial de las secciones propias de Preguntas. Solo roles clínicos.

## En qué estamos

- **v1.0.0 publicada el 2026-10-23** (back-office #24, API #16) con historia
  clínica, Configuración, agenda por horario, permisos por rol y bandeja de
  notificaciones/novedades por versión.
- Contexto de Claude recortado (rama `chore/contexto-claude`): `CLAUDE.md` es un
  índice y solo se importan este traspaso, `RULES.md` y `ARCHITECTURE.md` (D25).
- **Lote de cambios pedido el 2026-10-28, en curso** (todo menos el punto 9).
  Rama `feature/preguntas-y-mantenimientos` en el front y en el API (worktree
  `E:\Proyectos\node\api-historia`), un commit por etapa; lo hecho hasta el punto 4 ya está en `develop` de los dos repos (2026-10-30), sin pasar a `main`. Se prueba
  contra el API local (`docs/AMBIENTE-LOCAL.md`). Orden: 3, 11, 1, 7, 8, 10, 4,
  5, 6, 2 y después una etapa extra: historial de otoscopías. Hechos: 3 (D26), 11 (D28), 1 (D29), 7 (D30), 8 (D31), 10 (D32), 4 (D33), 5 (D34; solo en la rama, sin push). El 6 está hecho (D35): API `9f33ca2` y front en la rama, sin push. Sigue: cuestionador (también lee el API `9f33ca2`, que aún no revisó), revisor-ux y qa (el qa incluye STAFF del punto 5). **El usuario pidió (2026-10-31): al terminar el punto 6, push de todo** (la rama `feature/preguntas-y-mantenimientos` en los dos repos, puntos 5 y 6); no incluye merge. Al publicar: primero el API con sus
  migraciones, después el front. Cada punto:
  1. Historia clínica pasa a vivir dentro de un acordeón general "Preguntas"
     (nombre provisional), en Configuración y en el detalle del paciente.
  2. El usuario crea sus propias secciones dentro de Preguntas (p. ej. Historia
     clínica, Cuestionario de satisfacción). El API ya guarda varias plantillas
     por tenant (`name`, `speciality`, `fields`), pero el front pide una por
     especialidad y las respuestas del paciente son una sola historia: revisar.
  3. Las respuestas Sí/No del detalle no arrancan en "No": ninguna viene marcada.
  4. Tab nuevo "Mantenimiento": mantenimientos 1, 2, 3, 4, cada uno asistido
     (azul) o perdido (rojo).
  5. Intentos de contacto: registrar si se llamó 1, 2 o 3 veces al paciente.
  6. Un paciente puede tener más de una sede (hoy `branchUuid` es una sola).
  7. Teléfonos extranjeros (hoy la máscara es de 8 dígitos de Costa Rica).
  8. Audífonos en laboratorio (modal "Indicadores del paciente" → pestaña
     Laboratorio, hoy un switch que se guarda al tocarlo): al marcarlo, pedir la
     fecha de envío (un solo día).
  9. **Pendiente de definir:** al desmarcarlo queda la fecha de entrega y un
     historial corto de envíos/entregas, con nota opcional. Hoy la clínica lo anota
     a mano en Control de evolución ("Se hace entrega de audífonos..."); la idea es
     sacarlo de ahí. Duda: esa nota, ¿es la misma del control de evolución o solo
     vive en este historial?
  10. Pre-registro rápido desde "Agendar cita" cuando la búsqueda da "Ningún
      paciente coincide": nombre, teléfono, cédula y sede; el expediente se
      completa cuando llega a la cita.
  11. Exploración física (otoscopia OD/OI) sale de la historia clínica a una
      tarjeta propia, debajo de la ficha técnica y encima de Historia clínica.

## Qué sigue

1. **P0-1** contraseña temporal: la tiene el usuario; cambiarla antes de entregar.
   **Urgente:** ya está en el historial de un repo público; cambiarla cuanto antes
   (es la única solución).
2. **P0-2** desplegar en Vercel con `backoffice.audiocolorscr.com` (proyecto
   aparte del landing; las `NEXT_PUBLIC_*` antes del primer deploy).
3. **P0-3** revisar en producción los tipos de cita en Configuración → Tipos de
   cita: la clínica edita sus duraciones (hoy Cita 60 min, Control y
   Mantenimiento 30) y Control debe estar marcado como control.
4. **Antes de publicar** (pre-registro, etapa 6): la migración `birthDate` opcional va antes
   que el front en cada ambiente. Zynka (`next-audiology-files`,
   `use-patient-summary-header.ts:28-43,70`) muestra una edad falsa cuando `birthDate` es null.
5. Luego **P3-1** (Configuración: faltan sedes y usuarios, D21) y **P3-2**
   (permisos configurables por el administrador, D20).
6. **Pruebas guardadas en el repo** (2026-10-30, para gastar menos en navegador): empezar con un
   test del API (editar y volver a leer) y un flujo de Playwright, el del pre-registro; comando
   que deje el ambiente listo con sesión iniciada y `data-testid` en lo que se prueba.

## Preguntas abiertas

- Intentos de contacto (2026-10-31): el usuario corrigió que no es un contador de 1 a 3, sino 4 checks. Falta que
  aclare qué representa cada check (llamadas 1 a 4, uno por mantenimiento u otra cosa) y si van en orden. Lo hecho (D34)
  queda como está hasta entonces.
- Nombres de roles (2026-10-30, no hacerlo todavía): hoy OWNER, ADMIN, DOCTOR y STAFF. El usuario
  los quiere más claros (Administrador, Profesional, Recepción, Secretario o Empleado) y busca un
  estándar global de nombres. Propuesta a revisar: código fijo en inglés (`PRACTITIONER` viene de
  FHIR) y el nombre visible desde `es.json`.
- Teléfonos: ¿hace falta un selector de país? Hoy un número de Nicaragua (+505,
  también 8 dígitos) escrito sin + se guarda como de Costa Rica (D30).


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

## Sin verificar (2026-10-24, recorte del contexto)

- Solo cambiaron docs y 4 comentarios: lint y typecheck limpios, sin navegador ni build.
- Falta comprobar en una sesión real que los agentes trabajen bien con el CLAUDE.md corto y que
  la tabla de RULES §1 (dónde el repo difiere de los estándares) no deje huecos.

- Mantenimientos (D33): sin probar entre dos clínicas (la base local tiene una; la consulta filtra por clínica) ni con un
  error 5xx en pantalla. La migración se aplica antes de publicar.
- Intentos de contacto (D34): sin probar STAFF en pantalla ni por API (PUT 200, bitácora 403), dos clínicas,
  abrir desde la píldora a 375 px ni cerrar y reabrir el modal con un guardado en curso. La migración se aplica antes de publicar.
- Pre-registro rápido (modal Agendar): pie fijo y cuerpo con scroll en celulares bajos; ronda 2 de correcciones cerrada.

- Varias sedes (D35): probado en pantalla crear con dos sedes, verlas en expediente y lista, agendar eligiendo sede y quitar una sede al editar. Sin probar: la sede de la cita al reagendar desde el expediente (el detalle del paciente no trae la sede de su próxima cita; falta exponerla en el API), paciente viejo de una sola sede, 375 px, y filtros con una sede que excluya al paciente.
