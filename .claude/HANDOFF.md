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
  tipo y al moverla conserva su duración (D10). Al cambiar la duración de un tipo
  en Configuración, sus citas de hoy en adelante pasan a la nueva duración; las
  pasadas quedan como fueron (D37).
- El primer contacto del paciente es el teléfono principal (D12).
- Editar la historia clínica la actualiza y deja un PDF en Archivos con qué
  cambió y quién (D18).
- Calendario del iPhone: un calendario por sede, o por sede y tipo, solo en
  iPhone (DECISIONS, 2026-10-09).
- Mantenimientos (2026-11-01, reemplaza lo anterior): al entregar audífonos el paciente
  tiene 4 envíos gratis al laboratorio, uno cada 6 meses. En el modal "Indicadores del
  paciente", pestaña Mantenimiento: una fila por Mantenimiento 1 a 4 con tres estados
  (sin marcar, asistido, perdido) y un historial de notas con autor y fecha que no se
  edita ni se borra (D40). Se marcan a mano, no se calculan. Ya no hay contador de
  intentos: lo de "se llamó" va en una nota. Desde D46 la pantalla ya no muestra "Perdido": cada mantenimiento es una casilla (marcada = asistido) con un texto "Agregar nota" / "N notas" que abre las notas debajo (rama `feature/mantenimiento-compacto`); el API y las píldoras no cambian; Enter guarda la nota.
- Sedes (2026-10-28): un paciente tiene una o más sedes; en los filtros de la
  lista y la agenda aparece en todas, y cada cita se agenda en una de sus sedes.
  Los pacientes actuales conservan la sede que tienen.
- Secciones propias de Preguntas (2026-10-28): se crean, nombran y editan en
  Configuración. Se llenan varias veces: cada vez queda un registro con fecha y
  quién lo llenó, y el expediente muestra el historial. La historia clínica sigue
  igual (se llena una vez). Mismos permisos que la historia clínica.
  Un registro se corrige solo el mismo día en que se creó (hora de Costa Rica),
  igual que las otoscopías; después queda fijo (2026-11-01).
  Nada se borra: una sección con registros no se puede borrar (2026-11-01).
  La tarjeta de cada sección muestra solo el último registro; el historial se abre
  en un modal con la lista de fechas, cada una colapsable con sus respuestas (2026-11-01).
- Otoscopías (2026-10-28, ajustado 2026-11-07): historial por paciente. Cada
  otoscopía es un registro con fecha, autor, OD y OI; guardar crea uno nuevo y
  nunca pisa el anterior. La tarjeta de Exploración física siempre muestra el
  formulario listo para una otoscopía nueva ("Guardar otoscopia", "Limpiar"); el
  historial se ve solo en Control de evolución, donde el API deja una nota de
  "Pruebas" al guardar (D47). No va ligado a una cita. Solo roles clínicos.

## En qué estamos

- **Lote del 2026-11-07 (rama `feature/preguntas-acordeon`, PR a `develop`):** Preguntas pasa a
  "Formularios"; otoscopia siempre en modo crear con historial en Control de evolución (D47);
  Mantenimiento con "Vino"/"Lo perdió" (D48); agregar tipos de cita (D49); selector de país en
  teléfonos (D50, D54); prioridad de paciente (D51); día de envío en el filtro de laboratorio (D52);
  aviso de pacientes con 6 meses sin movimiento en Notificaciones (D53). API en su PR a `develop`
  (migraciones de otoscopia y de prioridad). Probado en pantalla con Playwright contra la base local.
  Sin probar en pantalla: el teléfono al recargar y en contactos (en la base quedó bien guardado), la
  ficha a 375 px con el botón de prioridad y una nota de otoscopia sin autor (no había en local).
- **v1.0.0 publicada el 2026-10-23** (back-office #24, API #16) con historia
  clínica, Configuración, agenda por horario, permisos por rol y bandeja de
  notificaciones/novedades por versión.
- Contexto de Claude recortado (rama `chore/contexto-claude`): `CLAUDE.md` es un
  índice y solo se importan este traspaso, `RULES.md` y `ARCHITECTURE.md` (D25).
- **Lote de cambios del 2026-10-28: terminado y en `develop` de los dos repos
  (2026-11-02)**, sin pasar a `main`. Puntos 1 a 11 más el historial de
  otoscopías (D26 a D45). La base de desarrollo ya tiene las migraciones del lote.
  Probado en pantalla con Playwright (`e2e/otoscopia`, `laboratorio`,
  `pendientes-lote`, `citas-y-clinica`): dato vacío, bitácora (incluida una
  acción desconocida), filtro por mes en los bordes de Costa Rica, mover y
  reagendar citas (incluida la de 18:30) y aislamiento entre clínicas por API.
  Corregido al probar: una clínica podía crear notas y citas sobre pacientes o
  tipos de otra (API `6025c00`).
  Sin probar: STAFF en pantalla (no hay sesión STAFF en local), una segunda
  clínica con su propio usuario y eventos viejos en la bitácora.
  Conocido: dos PUT idénticos en el mismo milisegundo dejan dos eventos en la
  bitácora. La bitácora copia el texto de las notas clínicas, no el de las notas
  de mantenimiento (D40).
  Para el desarrollo futuro de roles (no preguntar antes): solo el profesional
  médico agrega notas (2026-11-01).
- Configuración → Preguntas (2026-11-07, rama `feature/preguntas-acordeon`, subida sin PR): sin
  el texto de arriba, cada sección en tarjeta y "Nueva sección" debajo de la lista.
- **Al publicar** (orden): la migración del API, el API y el front, juntos (si
  pasa tiempo entre la migración y el API, correr la reconciliación de envíos al
  laboratorio de `.claude/DATABASE.md` del API). Después: contar pacientes con
  `branchUuid` sin fila en `PatientBranch` y repetir el backfill, y revisar sedes
  de otra clínica en una copia de producción.
- **Revisar en un lote aparte:** varios storages del API actualizan por `uuid`
  sin filtrar por clínica (plantillas, controles, encuentros, envíos al
  laboratorio, otoscopías, preguntas, paciente, unidades de producto). Hoy los
  protege el use case; falta confirmarlo uno por uno.
- **Hook `limitar-agente.mjs`** (neuron-agentes): qa no puede escribir pruebas;
  falta la decisión del usuario para permitirle `e2e/` y `*.spec.*`.

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

- Pacientes viejos con `isActive = false` y `status = ACTIVE` (D-2026-10-04): se dejan como están,
  sin archivar ni reactivar; no es prioridad (usuario, 2026-11-01).

- STAFF sigue pudiendo leer las plantillas
  (solo preguntas): el usuario lo deja así hasta el desarrollo de seguridad y roles (2026-11-01).
- Nombres de roles (2026-10-30, no hacerlo todavía): hoy OWNER, ADMIN, DOCTOR y STAFF. El usuario
  los quiere más claros (Administrador, Profesional, Recepción, Secretario o Empleado) y busca un
  estándar global de nombres. Propuesta a revisar: código fijo en inglés (`PRACTITIONER` viene de
  FHIR) y el nombre visible desde `es.json`.
- Teléfonos (histórico): ¿hace falta un selector de país? Hoy un número de Nicaragua (+505,
  también 8 dígitos) escrito sin + se guarda como de Costa Rica (D30).


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

- Varias sedes (D35): probado en pantalla crear con dos sedes, verlas en expediente y lista, agendar eligiendo sede, quitar una sede al editar, tablero con filtro en sede secundaria (clic y arrastre), filtro que excluye, sin sedes para elegir y 375 px sin scroll horizontal. El recorrido completo sale de varias corridas, no de una sola. Sin probar: cita visible con filtro de la sede secundaria tras recargar, dos clínicas y Zynka real. En la base local quedan pacientes de prueba "PruebaSedes".
- Búsqueda de pacientes: nombre y apellido juntos ("PruebaSedes Cuatro") dan "Sin resultados", porque el API (`patient.storage.ts`) compara cada campo por separado. No viene de este lote; falta corregirlo.
