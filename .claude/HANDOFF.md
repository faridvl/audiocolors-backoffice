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
- Audiometría guardada (2026-11-08): se guarda TODO lo del acordeón como datos para reconstruir el
  gráfico, no solo un PDF: marcas tonales (aérea, ósea, molestia, confort, campo libre, enmascarado,
  sin respuesta), puntos de logoaudiometría, listas y palabras falladas, el Resumen completo (PTA y su
  método, ASHA/BIAP, umbral vocal, discriminación, falladas), Diagnóstico y Observaciones. NO se
  guarda PDF: un botón Imprimir arma el PDF reconstruyéndolo desde la BD, como INFORME CLÍNICO
  FORMAL: logo y datos de la clínica arriba, los mismos gráficos de la pantalla, Resumen/Weber/notas
  en tablas y firma del profesional al pie (el pantallazo del acordeón se descartó por feo). Hay historial por paciente. Una audiometría guardada se abre con todo
  cargado pero NO editable: sin la barra de herramientas ni los toggles de enmascarado/sin respuesta.
  Para elegir una anterior: un selector en el encabezado del acordeón (donde hoy dice "Vista previa,
  aún no se guarda") con las fechas de las audiometrías del paciente, sin ponerles nombre. Siempre se
  ve el profesional que la hizo y la fecha.
  Diseño: modelo propio `PatientAudiometryEntry` en el API (por paciente, sin cita, payload JSON
  versionado y validado con Zod, append-only), no `Study`.

- Plantillas de documento (2026-11-08): nueva sección Configuración → Plantillas. Se crean y se
  editan varias (no se borran por ahora). La lista muestra solo tarjetas con el nombre; "Editar" abre
  una vista dentro de la misma página (no otra ruta) con el nombre, el texto con barra de formato
  tipo Word y el panel de variables (no hay "Cuándo se usa"). La lista muestra nombre y fecha de
  actualización. El panel es compacto: chips con solo el nombre, en dos grupos (Paciente y
  Documento), con un check si ya se usa; columna fija a la derecha en 1440 y plegable "Variables
  (14)" sobre la hoja en pantallas chicas. Variables: solo datos personales del paciente (más
  fecha de hoy y profesional); una variable desconocida no deja guardar. "Ver ejemplo" muestra el PDF
  con datos de ejemplo; cada página lleva el logo y el nombre de la clínica al pie. Usarlas desde el
  expediente con datos reales es otro desarrollo.

- Imprimir resumen del paciente (2026-11-08, hecho en la rama, ver En qué estamos): un solo botón en el expediente
  ("Generar resumen") abre un modal con tarjetas seleccionables: plantillas de documento (se elige
  cuáles, puede haber varias, llenas con los datos del paciente), historia clínica, otoscopía y
  audiometría (reusar el informe de D59). Genera un solo PDF con lo marcado. Siempre lleva la ficha
  técnica (datos del paciente), el logo de la clínica y la firma del profesional.
  De otoscopía y audiometría va solo la última, sin selector. La firma es una sola, al final: la
  línea para firmar a mano y debajo el nombre del profesional con sesión iniciada (con su título,
  p. ej. "Msc. …"); no hay firma digital ni imagen.
  Nombre del archivo: "{Tipo} - {Clínica} - {Paciente} - {Cédula}", con el tipo desde es.json:
  "Resumen clínico - AudioColors - Juan Pérez Mora - 112340567.pdf" y, al imprimir audiometría
  sola, "Audiometría - AudioColors - …" (hoy sale solo con el nombre de la clínica). Sin cédula,
  se omite ese tramo.

- Ajustes al resumen y a la audiometría (2026-11-08, pedidos del usuario):
  - Informe impreso de audiometría (suelto y en el resumen): una sola columna de grados
    (Normal, Leve…) entre los dos gráficos, ninguna a la derecha. En la tabla Resumen se quitan
    "Palabras falladas", "Método del PTA" y "Escala del grado"; la fila del PTA dice el método
    elegido ("PTA 512", etc.) en lugar de "PTA (dB)". La pantalla del acordeón no cambia.
  - Una audiometría guardada se puede marcar como mal hecha: motivo obligatorio, queda quién y
    cuándo, y no se deshace. En el selector de fechas se distingue, y la franja azul de solo lectura
    dice que está marcada como mal hecha (con el motivo). Necesita API (campo y endpoint).
  - Generar resumen: la ficha técnica también es una tarjeta que se marca o no; de audiometría se
    eligen una o varias (las mal hechas ni aparecen); otoscopía sigue siendo la última. Al generar,
    primero se ve una vista previa de todo el documento y se puede editar el texto antes de
    imprimir; lo editado sale solo en ese PDF, no se guarda.
  - Variables de plantilla: grupos nuevos "Pruebas" (otoscopía OD y OI de la última otoscopía;
    diagnóstico y observaciones de la última audiometría que no esté mal hecha) y "Clínica" (nombre,
    teléfono, correo y dirección). Teléfono, correo y dirección son campos nuevos de la clínica
    (Tenant, API identity), opcionales, y se editan en Configuración → Clínica con los mismos
    permisos que el resto de Configuración; el nombre se ve ahí pero no se edita. Orden de los grupos:
    Paciente, Pruebas, Clínica, Documento. Chips más pequeños y en cuadrícula pareja, no sueltos.
    Sin el dato, la variable sale vacía.

- Mantenimiento (2026-11-08): el botón "Vino" pasa a decir "Recepción" (mismo estado, solo el
  texto). "Lo perdió" no se guarda sin una nota: al tocarlo se abre el campo de nota y el estado
  se guarda junto con la nota; sin texto no deja guardar. Las marcas que ya existen no cambian.

- Audiometría en evolución y Archivos (2026-11-08, pedidos del usuario):
  - Generar resumen ya no tiene la tarjeta "Última otoscopía" (las variables de otoscopía de las
    plantillas siguen).
  - Al guardar una audiometría el API deja una nota de "Pruebas" en Control de evolución, como la
    otoscopía (D47): "Se realizó audiometría" con la fecha.
  - Archivos muestra cada audiometría guardada como una tarjeta más; al abrirla, un modal la arma
    completa desde la BD (no hay PDF guardado) con un botón de imprimir.
  - Agendar cita: el botón "Registrar paciente nuevo" también se ve antes de escribir.
  - Configuración → Clínica: el nombre ya se edita (reemplaza lo de "no se edita") y se sube el
    logo. Cada clínica (tenant) tiene su logo y se usa en todo: menú de la app y documentos
    impresos. Sin logo subido se muestra el nombre de la clínica en texto, nunca el de AudioColors.

## En qué estamos
- **Acordeones cerrados (2026-11-09, rama `fix/configuracion-estandar`):** en el expediente y en Configuración → Formularios todo acordeón arranca cerrado y solo se abre por acción de la persona (D76).
- **Configuración estandarizada (2026-11-09, rama `fix/configuracion-estandar`, commits locales, sin subir):** las 5 secciones comparten tarjeta, botón "Nuevo" y estados de carga/error (D74); el menú tiene grupos y un solo resaltado, y los campos de Clínica miden lo que su dato (D75). El editor de usuario usa la misma tarjeta con filas, la barra de Guardar de Formularios va fuera de la tarjeta al ancho de las demás secciones y los ítems del menú resaltan al pasar el mouse. Medido a 390, 1440 y 1920 sin scroll horizontal; carga y error de las 4 listas probados interceptando respuestas. Probado con 4 specs e2e (`configuracion-estandar`, `acordeones-cerrados` de solo lectura contra :3000; `formularios-guardar`, `configuracion-guardar` de escritura contra el API local con `E2E_BASE_URL`): todos pasan. Falta subir a develop con permiso.
- **Ajustes de UI de Usuarios y Configuración (2026-11-09, listos en `feature/usuarios-ajustes-ui`):** Clínica con campos a ancho completo y ayudas en su lugar, Mi perfil con título en la barra móvil, Plantillas y Tipos de cita con vacío y duración alineados. Pendientes de subir a develop con permiso del usuario.
- **Usuarios (2026-11-09, terminado y probado, en `develop`):** Configuración → Usuarios
  para que el OWNER administre los usuarios de su clínica (D70). Ramas `feature/usuarios` en el front
  y en el API. Revisado (cuestionador y revisor-ux), corregido y probado por qa en navegador contra el
  API local y la base Docker `audiocolors-prueba-db`: crear, correo duplicado en mayúsculas, cambio de
  rol con pérdida de acceso, contraseña, desactivar/reactivar, rol nulo heredado, DOCTOR/STAFF sin
  acceso, 375/768/1280/1440/1920 sin cortes y el nombre del autor tras la caché de 5 min. Arreglado
  al probar: la tabla se cortaba a 1440 (nombre y correo apilados) y el menú de acciones se salía
  3 px a 375 (ahora se ancla a la pantalla). Menores sin arreglar: la página sin acceso muestra el
  título "Usuarios" sobre el candado; el diálogo de confirmación no es `role=dialog`; no se probó una
  especialidad larga.
  **Antes de publicar**, en producción (solo lectura): roles por conteo, correos con mayúsculas y
  correos repetidos ignorando mayúsculas. Orden: migración del API
  `20261108160000_user_role_default_staff`, el API y el front.
  qa subió 3 PNG de prueba al bucket real de R2 (`audilogyfiles`); no se borraron.
  En la base local quedaron usuarios `qa-*` y tres notas "QA-D10" de prueba.

- **Versión 2.0.0 (2026-11-08, rama `release/2.0.0` del front y del API, con PR a `develop` abierto en cada repo):**
  changelog de 20 cambios aprobado por el usuario y cargado en `releases.ts`/`es.json`; el API
  sube a 2.0.0 en sus cuatro `package.json`. Cubre todo lo que hay en `develop` (no incluye
  `feature/audiometria-tipos` ni otras ramas locales). Sigue: mergear los PR a `develop` y luego
  PR de `develop` a `main`, con permiso del usuario.

- **Audiometría por tipos, Archivos y notas (2026-11-08, rama `feature/audiometria-tipos`, local):**
  la nota de audiometría en Control de evolución abre esa audiometría (`?audiometria=<uuid>`); Archivos
  oculta las mal hechas, muestra la píldora Pruebas y el tipo; el informe y la impresión de rastreo
  funcionan (D69). Lint, typecheck y pruebas `test:*` en verde. Sin probar en navegador: la navegación
  desde la nota (incluida tocar dos veces la misma), la vista previa de rastreo y la impresión real.
  Depende del API: `audiometryEntryUuid` en cada nota y el tipo en el texto de la nota.

- **Correcciones de logo y Archivos (2026-11-08, rama `feature/clinica-logo-y-nombre`, local):**
  informe de audiometría legible en celular (zoom mínimo 0.7 y desplazamiento bajo 640 px; la
  impresión no cambia), "Quitar logo" como botón secundario de peligro con papelera, tarjetas de
  audiometría distinguibles (detalle, chevron, icono info, PTA por oído), la nota "Se realizó
  audiometría" aparece en Evolución sin recargar, y la subida del logo maneja sesión vencida y red
  caída. Lint y typecheck limpios. Sin probar en navegador: el dev server de :3000 estaba roto
  ("__webpack_require__.t is not a function"); hay que reiniciarlo y verificar a 390 y 1440.

- **Ajustes del 2026-11-08 (misma rama `feature/resumen-paciente` + API `feature/audiometria-mal-hecha`
  y `feature/plantilla-variables-clinica`):** hechos el informe impreso, marcar como mal hecha,
  selección múltiple, vista previa editable, variables Pruebas/Clínica, Configuración → Clínica y
  Mantenimiento; revisados por cuestionador y revisor-ux (solo Audiometría y Resumen) y corregidos
  (D66). El usuario pidió subirlo sin qa: sin probar en navegador las pantallas de plantillas, Clínica
  y Mantenimiento, el flujo nuevo de "Lo perdió" ni la impresión real (posible informe suelto en 2
  hojas: los gráficos no se compactaron). Publicar API + migraciones antes que el front.

- **Resumen del paciente (2026-11-08, rama `feature/resumen-paciente`, local, sin push ni PR):**
  botón "Generar resumen", modal por tarjetas y hoja de impresión (D64); nombre de archivo
  "{Tipo} - {Clínica} - {Paciente} - {Cédula}" también en la audiometría suelta. Revisado
  (cuestionador y revisor-ux), corregido y probado por qa contra el API local de la rama de
  plantillas con un escenario real (paciente "Prueba Resumen Mora Quesada", 3 plantillas reales, en
  la base Docker de pruebas `audiocolors-prueba-db`): PDF de 6 hojas, fecha de nacimiento correcta,
  una sola firma, error por tarjeta, cerrar durante Generar no imprime. Sin probar: el `afterprint`
  real del navegador, Safari/iPhone y un usuario STAFF. Al publicar: las plantillas del API van
  antes que este front. Menores: el título de cada plantilla sale duplicado si la plantilla trae su
  propio H1; `{{tipo_documento}}` sale vacío (el paciente no guarda el tipo). Visto de paso (ya
  existía): en una audiometría guardada sin tipo de lista, Logoaudiometría muestra "Sin registrar"
  (`speech-word-list-selectors.tsx`, rama `isReadOnly`), contra D41.

- **Plantillas de documento (2026-11-08, en `develop` del front y del API; migración aplicada en la
  base de desarrollo):** pantalla hecha
  (lista, editor visual con barra de formato y hoja en blanco, panel de variables, "Ver ejemplo" en
  PDF; D60). Probada en pantalla contra el API local (escribir con formato, variables como
  etiquetas, guardar y reabrir). Rediseño visual hecho (D61: sin "Cuándo se usa", panel compacto,
  encabezado en una línea) y probado a 375, 768 y 1440. Vista previa del PDF en la misma página
  (D62), revisada y corregida en 375, 768 y 1440 con las plantillas simuladas (el API de dev no tiene la
  rama). Qa contra el API local de la rama hecha: crear, editar, reabrir, vista previa, descargar,
  texto vacío, variable desconocida, nombre repetido y 375/768/1440 sin scroll horizontal. Corregido
  lo que encontró: `{{clave}}` escrita de un solo golpe (dictado, autocompletado) caía el editor (D63).
  Menor pendiente: un párrafo que empieza con "1. " vuelve
  como lista numerada al reabrir.
- **Audiometría (2026-11-08, en `develop` del front y del API):** acordeón completo (tonal,
  logoaudiometría, listas de palabras, Resumen, notas) que se guarda con historial por paciente; una
  guardada se ve solo lectura y se imprime como informe A4 reconstruido desde la BD (D59). Campo de
  fecha común `DateField` (D58). Probado con Playwright y qa (guardar, historial, solo lectura,
  375/768/1440). Pendiente: en la lista del historial el API devuelve `createdByName` null (el detalle
  sí trae el nombre); al guardar se ven a la vez el toast y dos franjas; otoscopia tiene el mismo hueco
  de GET sobre pacientes borrados. Dudas de la audióloga sin responder: umbral vocal, PTA de 251,
  orden de columnas del Resumen, símbolos en 125/8000, Rosenblüt y el PDF de Cárdenas.

- **Arreglos del 2026-11-07 (rama `fix/mantenimiento-botones`):** botones "Vino"/"Lo perdió" ya no se
  aplastan; teléfonos +1 con máscara `(305) 555-1234` (D55); nota "Puedes elegir varias sedes" en la ficha
  y en el registro rápido. Probado en pantalla contra la base local.
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

- **Logo y nombre de la clínica (2026-11-08, rama `feature/clinica-logo-y-nombre`, local):** Configuración → Clínica edita el nombre y sube/quita el logo (D68); menú y documentos usan `ClinicBrand`. Probado en navegador sin logo y con logo (1440 y 390 px, capturas en `test-results/clinica-logo-nombre/`), validación de tipo/tamaño y cambio de nombre sin recargar. Sin probar: subida y borrado reales (bucket real), usuario sin permiso, informe y resumen impresos. Requiere el API de `feature/clinica-logo-y-nombre`.

## Roles y especialidades (terminado y probado, en `develop` desde 2026-11-09; API y migraciones de desarrollo aplicadas)

- Rama `feature/roles-especialidades` en el front y en el API (contiene `feature/usuarios`, D70). D71 a D73.
- Probado en navegador contra el API local y la base Docker 5433 con cada rol: lo clínico por usuario,
  "Nueva audiometría" e invalidar solo con Audiología (API 403 sin ella), Configuración, Bitácora y
  Usuarios bloqueados para Recepción, alta y edición en páginas, usuarios nuevos que inician sesión,
  bitácora en una línea, Propietario que administra a otro Propietario (Administración lo ve de
  lectura), nadie cambia su propio estado, variable profesional "Lic. Nombre · Cód. N", documento y
  paciente de otra clínica en 404, Agenda de Recepción con "Agendada por", sesión vencida, 375, 1024
  y 1440 px sin scroll horizontal, foco de teclado en la tabla de usuarios.
- Sigue: permiso del usuario para push y PR (los dos repos, incluida `feature/usuarios`). Antes de
  publicar, en producción (solo lectura): conteo de roles; los ADMIN actuales pierden el acceso clínico
  hasta que el Propietario les active "Atiende pacientes".
