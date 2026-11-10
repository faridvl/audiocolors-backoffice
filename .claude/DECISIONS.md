# DECISIONS.md

Decisiones tomadas y su razón. Sirve para no re-litigarlas, y para saber cuándo
dejan de ser válidas.

---

## D1 · Repo separado en vez de esperar a Zynka

**Contexto:** Zynka es un SaaS multi-tenant en construcción (241 archivos,
módulos a medias). AudioColors es un cliente real que necesita salir ya.

**Decisión:** repo nuevo con el 15% del alcance, consumiendo el mismo backend.

**Por qué es viable sin tocar el API:** el aislamiento por tenant sale del JWT
(cada controller lee `user.tenantUuid`); el frontend nunca envía un tenant. Un
frontend nuevo, logueado con un usuario de AudioColors, solo ve datos de
AudioColors — automáticamente.

**Costo aceptado:** dos frontends sobre un backend. Un arreglo en el módulo de
documentos de Zynka no llega solo aquí. Si a futuro se justifica, la salida es
extraer los módulos compartidos a un paquete.

---

## D2 · Back-office, no portal

**Decisión:** lo usa el personal de la clínica, no los pacientes.

**Consecuencias:** sin registro público, sin recuperación de contraseña, sin
permisos por paciente. Quien entra ve a todos los pacientes de la clínica. Las
cuentas las crea el administrador con `POST /users`.

---

## D3 · Alta del tenant por endpoint, nunca por INSERT

**Decisión:** `POST /auth/register` una sola vez.

**Por qué:** las contraseñas van con bcrypt — un INSERT plano produce un login
imposible. Además `Patient.tenantId` es un entero que debe coincidir entre dos
bases separadas (`saas_identity` y `saas_medical_records`); el endpoint lo
resuelve en una transacción.

---

## D4 · Base en blanco

**Decisión:** no se migra nada del tenant de pruebas de Zynka.

Quedó **un paciente de prueba activo** con un PDF adjunto, para poder ver el
expediente con contenido. Y un paciente inactivo huérfano del primer test que
**no se puede eliminar ni reactivar** desde el frontend (ver D9).

---

## D5 · Sin i18n

**Decisión:** mono-idioma español, strings en el JSX.

**Por qué:** Zynka gasta ~61 KB (`es.json` + `i18n.ts`) para un solo idioma.
Se aparta a propósito de la regla 11 de `PATTERNS.md` de Zynka: aquella regla
existe para un SaaS multi-tenant que algún día será multi-idioma.

**Cuándo deja de valer:** si AudioColors pide inglés, o si este repo se
generaliza a más clínicas.

**Actualización (2026-09-16):** revertida. Los textos pasan a `i18next` +
`react-i18next` con el patrón de Zynka (`TEXT` en `src/static/texts/i18n.ts` y
`es.json`), migrando cada pantalla que se toca. Implementado el 2026-09-24.

---

## D6 · Detalle de paciente nuevo, no portado

**Decisión:** escribir uno de ~130 líneas en vez de reutilizar el de Zynka.

**Por qué:** `patient-detail-container.tsx` de Zynka tiene **1052 líneas** y
depende de 6 queries en su hook más ~10 mutations/queries importadas directo:
encounters, studies, medical-controls, maintenance, background, devices,
inventario, citas. Reutilizarlo arrastraba medio sistema.

---

## D7 · Interfaz clara con un solo acento

**Recorrido:** azul marino heredado de Zynka → naranja del logo → **verde
`#66ae36`**, con grises neutros (`ink`) en vez de azulados (`navy`).

**Por qué:** el logo de AudioColors es multicolor sobre blanco. Un chrome
oscuro o azulado compite con él. El naranja saturaba como acento general.

**Actualización:** el acento hoy es azul `#1f6fb1` (`tailwind.config.js`), la R
del logo. Pasó de verde a azul `#1e6cae` en `561b488` (2026-09-15) y se ajustó al
`#1f6fb1` del manual en `50c99cf` (2026-09-18). Porqué no registrado: ningún doc
ni mensaje de commit explica el cambio.

---

## D8 · Estándares de UI tomados de un back-office de referencia

Se adoptaron de un back-office de producción maduro:

- Tabla → tarjetas en móvil (nunca scroll horizontal)
- Cuatro estados de lista, con vacío-sin-datos ≠ vacío-por-filtros
- Acciones de un registro en el header; crear en la barra de filtros
- `FormViewSection` / `FormViewLabel` compartidos entre ver y editar
- Paginación numerada con elipsis
- Escala tipográfica con salto responsive por variante

**No se adoptó:**
- Su page size de 7 → aquí 10 (aprovecha mejor pantallas actuales)
- Su sidebar oscuro de 240px fijo → aquí blanco (ver D7)
- Su sistema `NewForm` / `FormControlWidth` → demasiado aparato para 8 campos

---

## D9 · Limitaciones conocidas del API que no se arreglan aquí

| Limitación | Efecto |
|---|---|
| `DELETE /patients/:uuid` es soft delete y `PATCH` ignora `isActive` | Un paciente eliminado no se puede reactivar ni borrar del todo |
| `GET /patients` solo distingue "activos" de "activos + inactivos" | El filtro "Inactivos" trae todos y filtra en cliente; su conteo no es exacto |

Ambas requieren cambio en el API (ver D24).

---

## Pendientes antes de producción

1. **Cambiar las contraseñas temporales** (la tiene el usuario; P0-1 cambiarla antes de entregar).
2. **Desplegar** en Vercel con el subdominio `backoffice.audiocolorscr.com`
   (proyecto aparte del landing; las variables `NEXT_PUBLIC_*` se inyectan en
   build, así que hay que redeployar si se añaden después).
3. **Logo definitivo**: el actual sale de los vectores del `.ai` rasterizados a
   1400px. Exportar un SVG desde Illustrator daría calidad infinita.

---

## D10 · Agenda de escritorio: arrastrar es confirmar, sin tocar el API

**Decisión:** en escritorio (`lg`) la agenda muestra el mes, los horarios del
día (8:00 a 17:00, uno por hora) y "Por confirmar". Soltar un paciente en un
horario confirma la cita sin modal; soltar una cita en "Por confirmar" la
devuelve a mes tentativo. Un horario acepta varias citas. El celular se queda
con la franja semanal y pestañas.

**Cómo, con el API tal cual:** `POST next-appointment` solo recibe el día y
guarda las 08:00 UTC; la hora se fija después con `PATCH /appointments/:uuid`
(`date`, `startTime`, `endTime`). Volver a "por confirmar" es
`PUT tentative-month` (que cancela la cita futura) y un `PATCH` a `CANCELLED`
para la de hoy cuya hora ya pasó, que el API no cancela.

**Por qué la hora es real (UTC-6) y no "flotante":** las 8:00 de la clínica
se guardan como 14:00 UTC. Así el `.ics`, la cancelación de citas futuras y el
job de medianoche ven la hora verdadera. Las citas confirmadas solo con día
(08:00 UTC = 2:00 en Costa Rica) caen fuera de los horarios y se muestran en
"Sin hora asignada", listas para arrastrar.

**Cuándo deja de valer:** el API filtra `GET /appointments?date=` por día
UTC. Un horario desde las 18:00 de Costa Rica cae en el día UTC siguiente y
desaparecería de su día. Si la clínica atiende después de las 17:00, primero
hay que filtrar por día local en el API.

**Actualización (2026-10-23):** los horarios pasan a una línea de tiempo del
día, como en Teams: una línea por media hora (de 8:00 a 18:00) y cada cita con
el alto de su duración; las que se cruzan van lado a lado. Soltar o tocar cae en
la media hora bajo el puntero, con una sombra de dónde quedaría. Mover una cita
conserva su duración; una nueva toma la de su tipo. La ficha muestra inicio y fin.

## 2026-10-04 · `yarn dev` siempre en el puerto 3000

El API solo acepta los orígenes de `ALLOWED_ORIGINS` (CORS). Si el 3000 estaba
ocupado, Next levantaba solo en el 3001 y el login fallaba con "revisa tu
conexión a internet", sin pista de la causa. Con `-p 3000` Next falla al
arrancar si el puerto está tomado, y en desarrollo el error de red explica que
el API rechaza otros puertos.

## 2026-10-09 · Calendario del iPhone: por sede o por sede y tipo, cada calendario por separado

Se rehízo después de probarlo con la clínica, que ya organiza su calendario
como "(RC) Controles", "(RC) Citas", "(PZ) Recetas"…

- **Solo en iPhone**, desde el menú del usuario ("Calendario del teléfono"). En
  computadora y Android no aparece: la suscripción `webcal://` es para el
  Calendario de iOS.
- **Un calendario = una sede, o una sede y un tipo de cita**, cada uno con su
  color (el iPhone colorea calendarios enteros, no eventos). Sin "Todas las
  sedes": un único calendario pierde los colores. En "por sede y tipo" el
  evento muestra solo el paciente, como lo usa la clínica.
- **Sin pasos de enlace a la vista**: el enlace se crea solo al abrir la ficha y
  `POST /calendar-feed` ya no lo cambia. Se sacaron "Crear mi enlace",
  "Copiar enlace", "Generar enlaces nuevos" y "Desconectar": cambiar el token
  dejaba sin citas todo lo ya agregado.
- **"En tu iPhone"**: el servidor no puede saber qué agregó el teléfono, pero
  anota cuándo pidió cada calendario (`fetchedCalendars`). Si lo pidió en los
  últimos 3 días, la fila ofrece "Quitar"; si no, "Agregar". Así se puede
  agregar otra sede cualquier día sin tocar las anteriores.
- **"Quitar"** no puede borrar la suscripción del teléfono: el API publica ese
  calendario vacío. Para que desaparezca del iPhone hay que eliminarlo desde
  Calendario. Un calendario quitado vuelve a ofrecer "Agregar", igual que uno
  nuevo (no "Volver a mostrar"): si ya se borró del iPhone, solo el enlace
  `webcal://` lo vuelve a suscribir. Agregar le devuelve las citas.
- **No hay actualización instantánea**: iOS consulta los calendarios suscritos
  cuando quiere (el API sugiere 15 minutos) y el servidor no puede avisarle. La
  ficha explica cómo refrescar a mano.

## 2026-10-04 · El estado del paciente es solo `status`, nunca `isActive`

El paciente tiene dos campos que parecen lo mismo:

- `status` (`ACTIVE` / `INACTIVE` / `DECEASED`): el estado para la clínica. Lo
  cambia el modal "Estado del paciente" y lo filtra el listado.
- `isActive` + `deletedAt`: el borrado lógico (`DELETE /patients/:uuid`), de
  antes de que existiera `status`. El front ya no borra pacientes, pero quedan
  registros viejos con `isActive = false` y `status = ACTIVE`.

**El error:** la agenda pedía `PatientStatusFilter.ACTIVE` (solo
`isActive = true`) y el expediente mostraba "Inactivo" por `!isActive`, mientras
el listado y el modal decían "Activo". Un paciente así anotaba su mes "por
confirmar" y no aparecía en la agenda: parecía intermitente porque dependía del
paciente. Caso real: "Prueba SedeAuto" en el ambiente de pruebas.

**La regla:** toda pantalla lee y filtra el estado por `status`. Las consultas
de pacientes usan `PatientStatusFilter.ALL` (igual que el listado) y filtran con
`filters.status` o en el cliente. No mostrar ni filtrar por `isActive`.

**Pendiente:** decidir en el API si esos registros viejos se reactivan
(`isActive = true`) o se pasan a `status = INACTIVE`, y que `PatientStatusFilter`
deje de mezclar los dos conceptos.


## 2026-10-10 · Resumen de pacientes: "Controles" se busca por nombre

Las tarjetas de la pantalla de pacientes (solo escritorio) cuentan y filtran
con los mismos filtros de la lista. La de "Controles este mes" necesita el
tipo de cita "Control", que es un dato de la clínica y no tiene una marca en
el API. Se busca por nombre (`CONTROL_TYPE_NAME` en `use-patient-summary.ts`);
si la clínica no tiene ese tipo, la tarjeta no se muestra. Si algún día los
tipos tienen una categoría en el API, usarla en lugar del nombre.

---

## D11 · Expediente: datos siempre visibles y sin correo, dirección ni registro

**Decisión (2026-10-10):** se quita el enlace "Ver todos los datos"; la tarjeta
muestra todo lo que tiene. Correo, dirección y fecha de registro no se muestran
por ahora (se siguen guardando y editando en el formulario).

**Por qué:** la clínica los consulta siempre y casi nunca llena correo ni
dirección: el enlace era un clic de más y los vacíos ocupaban lugar.

---

## D12 · Contactos: vuelve el modal en el expediente

**Decisión (2026-10-10):** "Editar contactos" abre un modal en el expediente, en
vez de llevar al formulario del paciente. El modal y el formulario comparten
`PatientContactsFields` y guardan igual: el primer contacto es el teléfono
principal y, si cambia, se actualiza también en el paciente.

**Por qué:** ir al formulario entero para cambiar un teléfono sacaba del
expediente.

---

## D13 · Indicadores sin fechas, en pestañas, y candidato a video aparte

**Decisión (2026-10-10):** el modal de indicadores tiene dos pestañas,
Laboratorio (audífonos en laboratorio) y Estado de garantía (garantía activa,
garantía expirada y renovar receta). Candidato a video es una casilla en el
expediente. No se muestra desde cuándo está prendido ninguno, aunque el API lo
guarde.

**Actualización (2026-10-20):** la pestaña "Datos del audífono" pasa a "Estado
de garantía" y suma los switches de garantía expirada y renovar receta, más un
desplegable para elegir cuál de los archivos subidos como Garantías es el de la
garantía (`warrantyDocumentUuid` en el paciente, "Ninguno" lo limpia). Sin
archivos de garantía se muestra una ayuda en vez del desplegable vacío.

**Por qué:** a la clínica solo le importa si el indicador está o no, no su fecha.

---

## D14 · Las tarjetas del resumen cuentan sobre los filtros de la lista

**Decisión (2026-10-10):** cada tarjeta de Pacientes cuenta su condición dentro
de los filtros aplicados (búsqueda, estado, sede, indicadores...). Lo que la
tarjeta define (mes, confirmada/tentativa, tipo) reemplaza al filtro manual; los
indicadores se suman. Tocarla aplica lo suyo sin borrar el resto, y volver a
tocarla quita solo lo suyo.

**Por qué:** el número tiene que coincidir con lo que muestra la lista al tocar
la tarjeta.

---

## D15 · Filtro de meses: del más cercano al más lejano, "Sin cita" al final

**Decisión (2026-10-20):** en Pacientes el filtro de próxima cita lista "Todos
los meses", los meses en orden ascendente y "Sin cita" al final, separado de los
meses. La bitácora conserva su orden.

**Por qué:** lo que la clínica busca casi siempre es este mes y el siguiente.

---

## D16 · Resumen de pacientes también en el celular, arriba de la lista

**Decisión (2026-10-20):** las tarjetas del resumen (D14) se ven en todos los
tamaños, arriba de la lista: en dos columnas debajo de `lg` y en cuatro en
escritorio. Se probó ponerlas en una pestaña aparte en el celular y la clínica
las quiso en la misma vista.

**Por qué:** en el celular y el iPad vertical no había forma de ver el resumen.

---

## D17 · Acciones del paciente a la vista, sin menú "⋯"

**Decisión (2026-10-20):** Modificar, Cambiar estado e Indicadores son botones
visibles en la tarjeta del expediente, en una columna a la derecha de los datos;
en el celular (menos de `sm`) solo con ícono y `aria-label`.

**Por qué:** la clínica las usa seguido y en el menú no se encontraban.

---

## D18 · Historia clínica

**Decisión (2026-10-21):** tarjeta propia en el expediente, entre los datos del
paciente y Control de evolución, que copia la hoja en papel **dentro de la
tarjeta, sin modal**: sin historia se muestra la hoja para llenarla; ya llena,
queda la hoja completa en solo lectura (todos los antecedentes; el Sí resalta con ✓ y el No queda apagado, con la misma grilla que el formulario), y **la original no se modifica nunca**: "Editar" abre la misma hoja precargada y, al guardar, crea una nota con categoría Historia clínica en Control de evolución con lo que cambió ("Mareo: No → Sí"). La nota resume los textos largos para no pasar los 500 caracteres del API. En
pantalla ancha las secciones van en columnas angostas para que cada Sí/No quede
junto a su antecedente. Cada antecedente es Sí / No en un control segmentado
(`SegmentedControl`, 44px por opción, pensado para iPad); el Sí elegido va en el
color de marca para verse entre las filas en No. Un formulario nuevo arranca
todo en No.

- **403 oculta la tarjeta**: STAFF no tiene acceso a antecedentes clínicos. Para
  distinguirlo de una falla, `ApiServiceClient` ahora lanza `ApiError` (sigue
  siendo un `Error` con el mismo mensaje, más el `status`); el resto de la app no
  cambia. Un 403 o 404 no se reintenta.
- **`notes` se reenvía tal cual**: el API lo tiene pero la hoja no; como el PUT
  reemplaza todo, el formulario manda el valor que ya había para no borrarlo.
- **La tonalidad se descarta si Acúfeno es No**, aunque se haya escrito antes.
- **Autor**: el API solo da `createdByUuid` / `updatedByUuid`, sin nombre; se
  resuelve con `useResolveAuthorLabel` (nombre solo si fue el usuario logueado).

**Actualización (2026-10-22):**

- **Editar genera un PDF en Archivos**, no una nota: la hoja completa
  actualizada y, arriba, lo que cambió ("antes No, ahora Sí"), en la sección
  Historia clínica. La original sigue sin modificarse. El PDF se arma en el
  navegador con jsPDF, cargado solo al guardar.
- **Preguntas configurables**: un OWNER o ADMIN las cambia en
  "Historia clínica" del menú lateral (solo lo ven ellos,
  `/configuracion/historia-clinica`): preguntas agrupadas por sección, una
  fila por pregunta, agregar dentro de cada sección o crear una sección.
  Las preguntas se mueven arrastrando su asa (arrastre nativo del navegador,
  como la agenda de escritorio; en el celular no se arrastra) y el nombre de
  cada sección se edita en su título. Sin plantilla guardada se usa la hoja
  estándar. Cada historia guarda la copia de sus preguntas
  (`templateSnapshot`) y se lee siempre con ellas; las llenadas antes, sin
  copia, se leen con la hoja estándar, nunca con las preguntas actuales (si no,
  aparecerían preguntas que no se hicieron).
  **Editar** usa en cambio las preguntas actuales, con las respuestas que ya
  tenía: así se pueden contestar las agregadas después, y el PDF de cambios
  las incluye. Ver la historia sigue mostrando sus preguntas originales. Las preguntas estándar conservan
  sus ids, que son las columnas del API, para que esas columnas se sigan llenando.
- **Diseño**: cada sección en su tarjeta, repartidas en dos columnas por altura
  (CSS `columns`) y con ancho máximo, para que no queden huecos ni el Sí/No
  lejos de su antecedente. El No elegido queda discreto; solo el Sí se pinta.
  El detalle de un Sí (tonalidad) va pegado a su pregunta. Los textos muestran
  el contador de caracteres (`FormField` con `showCount`).
- **Editar va en el menú "⋯"** de la tarjeta (`ActionMenu`): es una acción
  poco frecuente.

**Actualización:** D19 da también a `DOCTOR` el permiso de cambiar las preguntas
(`permissions.ts`).

---

## D19 · Permisos por rol: el empleado no ve lo clínico

**Decisión (2026-10-22):** cuatro roles (dueño, administrador, médico y
empleado). El empleado (recepción, secretaría) ve pacientes, contactos, citas,
agenda y archivos; no ve historia clínica, Control de evolución, Bitácora ni
las preguntas de la historia clínica. El médico sí puede cambiar las preguntas.
Ver RULES.md §7.

**Por qué:** pedido de la clínica, pensando en más clínicas y más personal. Los
datos de salud son sensibles (Ley 8968), así que el API también lo bloquea
(PR del API `feature/permisos-por-rol`), no solo la pantalla. Archivos queda
abierto porque el empleado sube garantías y recetas.

**Excepción:** `GET /patient-activity/actors` sigue abierto para el empleado: la
agenda lo usa para mostrar quién agendó y solo trae nombres de usuarios.

---

## D20 · (Futuro) Permisos configurables por el administrador

**Estado:** decidido, sin implementar (2026-10-22). Tenerlo en cuenta en todo
desarrollo que toque roles o pantallas nuevas.

**Decisión:**
- **Roles fijos, definidos por nosotros:** `OWNER`, `ADMIN`, `DOCTOR`, `STAFF`.
  Cada rol trae permisos por defecto (los de RULES.md §7).
- **El administrador de cada clínica ajusta los permisos de cada rol**, solo
  para su clínica, desde Configuración → Usuarios y permisos.
- **Por rol, no por persona**, al principio. Excepciones por usuario solo si un
  caso real lo pide.
- **El catálogo de permisos es nuestro** (código, `Permission`): el
  administrador prende y apaga, no inventa permisos.
- **El API y el front revisan permisos, nunca el rol.** Hoy ya es así
  (`usePermissions().can`, `CLINICAL_ACCESS_ROLES` en el API): el cambio será
  reemplazar la tabla fija por la configuración de la clínica.

**Cuidados al implementarlo:**
1. Los permisos se leen del servidor en cada pedido (con cache corto), no se
   guardan en el JWT: si no, un cambio no aplica hasta volver a iniciar sesión.
2. Permisos que el administrador no puede quitarse (entrar a Configuración):
   la clínica nunca queda sin quien administre.
3. Dar acceso clínico a `STAFF` muestra un aviso (Ley 8968, datos sensibles).
4. Cada cambio de permisos queda en la bitácora (quién y cuándo).
5. Un permiso nuevo arranca con su valor por defecto en todas las clínicas, sin
   migrar datos a mano.

**Por qué:** más clínicas (multi-tenant) con personal distinto; cada una
organiza su equipo a su manera y no queremos lógica por clínica en el código.

---

## D21 · Configuración en una sola entrada del menú

**Estado:** completa (2026-11-09): Tipos de cita, Historia clínica, Usuarios (D70) y Sedes (D78).

**Decisión:** los mantenimientos (sedes, tipos de cita y su duración, preguntas
de la historia clínica, usuarios y permisos) van en una sola entrada
"Configuración" con ícono de engranaje, abajo del menú lateral y solo para
quien tenga permiso. Adentro, navegación propia: lista vertical a la izquierda
en computadora; en el celular, la lista primero y al tocar se abre la sección.
Una URL por sección (`/configuracion/sedes`, `/configuracion/agenda`,
`/configuracion/historia-clinica`, `/configuracion/usuarios`). Se agrupa por
tarea, no por tabla: "Agenda" junta tipos de cita y duraciones.

**Por qué:** una entrada del menú por cada mantenimiento llena el menú de cosas
que se usan poco. Las pestañas arriba sirven hasta 4-6 opciones; la lista
lateral escala. Al hacerlo, "Historia clínica" sale del menú lateral y pasa
a Configuración.

---

## D22 · El "control" es un tipo de cita marcado, no un nombre

**Decisión (2026-10-22):** la tarjeta "Controles este mes" cuenta el tipo de
cita marcado con "Cuenta como control" en Configuración → Tipos de cita
(`isControl` en el API, uno por clínica: marcar otro desmarca el anterior). Sin
ninguno marcado, la tarjeta no se muestra. Reemplaza la búsqueda por el nombre
"Control" (entrada del 2026-10-10): con los tipos editables, renombrarlo la
hacía desaparecer. La migración marcó el tipo llamado "Control" de cada clínica.

**Tipos de cita en Configuración:** lista de solo lectura (nombre, duración y
la etiqueta "Controles del mes"); se edita en una ventana con nombre, duración
y el interruptor de control, que avisa qué cambia al guardar. Sin agregar ni
borrar tipos, y sin color: el color del tipo solo se ve como un punto en la
agenda; lo que domina es el color de la sede.

---

## D23 · Notificaciones y versiones

**Decisión (2026-10-23):** las novedades de cada versión llegan como
notificaciones en una bandeja ("Notificaciones" en el menú del usuario, con
contador rojo y un punto en el avatar mientras haya sin leer). Se pueden volver a
abrir y "Limpiar" las saca de la bandeja. La bandeja es un desplegable que sale
del avatar, como en cualquier sitio. Cada versión agrupa sus cambios en
Novedades, Mejoras y Correcciones, con "Tema: descripción" y sin emojis: es un
sistema médico y lo lee el personal de la clínica. La versión actual se ve al
pie del menú.

**Leídas y limpiadas** se guardan en el navegador, por usuario. En otro
dispositivo se vuelven a ver una vez. Si hace falta que se sincronice entre
dispositivos, guardarlo en el API.

**Versiones:** `package.json` es la fuente; `yarn release:bump` y
`yarn release:check` (RULES.md §8). El historial vive en `src/static/releases.ts`
(nunca se borra una versión) y en las etiquetas `vX.Y.Z` de git.

**D18 · Actualización (2026-10-23):** editar **sí actualiza** la historia: la tarjeta
muestra lo último (respuestas nuevas y preguntas agregadas) y "Modificada por X
el día". El PDF en Archivos sigue generándose como registro de qué cambió y quién.
Reemplaza "la original no se modifica nunca": la clínica quiere ver el estado
actual del paciente en el expediente.

---

## D24 · El API se cambia cuando hace falta

**Decisión (2026-10-23):** se elimina la regla "el API no se toca". Nació para
no romper Zynka, que comparte el backend, pero en la práctica los cambios del
API (agenda, garantía, historia clínica, permisos, tipos de cita) salieron por
ramas con PR a `develop` y dejaron el sistema mejor. Desde ahora el API se
cambia como el front: rama propia, PR a `develop` y, al pasar a `main`, la
acción `[Release] Production` aplica las migraciones.

---

## D25 · Contexto a pedido y sin contraseñas en los docs

**Decisión (2026-10-24):** `CLAUDE.md` importa solo `HANDOFF.md`, `RULES.md` y
`ARCHITECTURE.md`; `DECISIONS.md`, `STATUS.md`, `BRAND.md` y los docs de `docs/`
se leen a pedido (tabla "Leer a pedido" de `CLAUDE.md`). `RULES.md` queda con las
reglas propias de este repo y remite a las skills `estandares-*` donde coinciden.
La contraseña temporal de los usuarios ya no se escribe en ningún doc. Es
urgente: ya está en el historial de git de un repo público; la única solución es
cambiarla cuanto antes (P0-1), no reescribir el historial.

**Por qué:** cada mensaje cargaba unas 1.570 líneas de contexto fijo. Con una
sesión coordinadora y varios agentes, ese costo se paga en cada uno; el contexto
fijo tiene que ser poco y lo demás se lee cuando se necesita.

---

## D26 · Sí/No sin respuesta por defecto (2026-10-28)

**Decisión:** las preguntas Sí/No de la historia clínica arrancan sin marcar y
tienen tres estados: Sí, No y sin responder. Sin responder no se guarda: la
clave se omite en `answers` (el API no acepta null ahí). Tocar la opción ya
elegida la desmarca. Resumen, PDF y cambios dicen "Sin responder". Las 14
columnas booleanas viejas de `PatientBackground` se siguen mandando (false si no
es Sí): son legado y solo `answers` distingue lo no respondido.

**Por qué:** un "No" que nadie marcó se leía como dato clínico. Las historias
guardadas antes de este cambio tienen "No" explícito en lo que nadie tocó; no
se pueden recuperar y se siguen mostrando como "No".

**También:** al editar, las respuestas de preguntas que la clínica quitó de la
plantilla se conservan (con su definición en `templateSnapshot`), y el API ya no
borra `answers` ni `templateSnapshot` si un PUT no los trae (Zynka manda solo
las columnas): lo que no viene no se toca, un null explícito limpia.

---

## D27 · Ambiente local con un segundo front (2026-10-28)

**Decisión:** para probar contra el API local sin cerrar el `next dev` de
`localhost:3000` (con la sesión del usuario contra el API de desarrollo), se
levanta otro en `127.0.0.1:3001` con `NEXT_DIST_DIR=.next-prueba`
(`next.config.js` lee la variable; sin ella sigue en `.next`). Otro host para que
las cookies no se pisen. Detalle en `docs/AMBIENTE-LOCAL.md`.

---

## D28 · Exploración física fuera de la historia clínica (2026-10-28)

**Decisión:** la otoscopía (OD/OI) vive en una tabla propia del API,
`PatientPhysicalExam` (una por paciente, la última anotada), con
`GET/PUT /patients/:uuid/physical-exam` solo para `CLINICAL_ACCESS_ROLES`
(guard de roles, no "todos menos STAFF"). En el expediente es una tarjeta entre
la ficha y la historia clínica, editable cuando se quiera y sin PDF; cada cambio
queda en la bitácora con antes y después. La migración copia lo que había en la
historia (`answers` si es texto, si no la columna). La historia filtra los ids
`otoscopyRight/otoscopyLeft` de plantillas, snapshots, PDF y cambios.

**Por qué:** es un hallazgo que se actualiza en cada revisión, no un antecedente
que se llena una vez. Las columnas viejas de `PatientBackground` se quedan (el
front las reenvía sin cambios) y el API copia a la tabla nueva si un front viejo
manda la otoscopía en `answers`: así ningún orden de despliegue borra el dato.

**Despliegue:** publicar primero el API (con su migración) y después el front.

**Actualización (2026-10-28):** el usuario confirmó un historial de otoscopías
por paciente (regla en HANDOFF): cada otoscopía es un registro nuevo con fecha y
autor, corregible solo el mismo día; la tabla actual pasa a ser el primer registro
de cada paciente. Etapa aparte, después del lote.

---

## D29 · Acordeón "Preguntas" (2026-10-28)

**Decisión:** la historia clínica vive dentro de una tarjeta "Preguntas"
(nombre provisional, `questions.title` en es.json), cerrada por defecto, en el
expediente y en Configuración (`/configuracion/preguntas`; la ruta vieja
`/configuracion/historia-clinica` redirige). Acordeón genérico en
`components/common/accordion` (variantes tarjeta, anidada y sin borde; monta el
contenido la primera vez que se abre y lo deja montado). Las secciones son una
lista que arma cada hook (`{ key, title, subtitle, render }`), lista para sumar
las secciones propias de la clínica. Dentro de Preguntas se abre una sección a la
vez; el subtítulo cerrado dice lo pendiente (sin llenar, borrador sin guardar).

**Por qué:** la clínica va a sumar cuestionarios propios junto a la historia; un
solo lugar para todos evita una tarjeta más por cuestionario en el expediente.

---

## D30 · Teléfonos extranjeros (2026-10-28)

**Decisión:** un solo campo de teléfono, sin selector de país. Si lo escrito empieza
con `+` (o `00`), es de otro país y no lleva máscara; si no, es de Costa Rica
(`XXXX-XXXX`) y el campo muestra un "+506" gris como adorno, que no es parte del
valor. Un extranjero lleva de 8 a 15 dígitos; un `+` con 8 dígitos que parecen de
Costa Rica da error. Se guarda compacto, `+` y solo dígitos (`+13055551234`), en
paciente y contacto; Costa Rica sigue como `+506 XXXX-XXXX` (paciente) y
`XXXX-XXXX` (contacto). Un dato viejo de la base que no se toca no se valida, para
poder editar lo demás; si se toca, se valida normal. La máscara nunca corta un
número. Todo vive en `shared/utils/phone.ts`.

**Por qué:** compacto porque Zynka limita el teléfono a 15 caracteres, porque la
búsqueda del API busca el texto literal (así se encuentra por dígitos) y porque
la comparación entre contactos queda estable. Un número de 15 dígitos no cabe en
Zynka, pero es rarísimo.

**Pendiente del usuario:** si quiere un selector de país. Con un solo campo, otro
país de 8 dígitos como Nicaragua (+505) solo se distingue por el `+`.

## D31 · Fecha de envío al laboratorio (2026-10-30)

**Decisión:** al encender "Audífonos en laboratorio" se pide la fecha de envío: un
solo día, por defecto hoy y nunca posterior a hoy en hora de Costa Rica (el API
también lo rechaza). Se puede cambiar después, y la bitácora registra el envío y
cada cambio de fecha. El día se guarda en `hearingAidsInLabSince` a mediodía UTC.
Mientras se edita la fecha, el modal oculta "Listo" y solo ofrece Cancelar y Guardar.

**Por qué:** a mediodía UTC cae en el mismo día en cualquier zona de América, sin
correrse como con medianoche UTC. "Listo" descartaba la fecha tocada y parecía
guardarla.

**Fuera de alcance:** lo que pasa al apagarlo (punto 9 del lote, sin definir).

## D32 · Pre-registro rápido desde "Agendar cita" (2026-10-30)

**Decisión:** si la búsqueda del selector no encuentra al paciente, se ofrece "Registrar
paciente nuevo" con nombre, apellidos (mínimo 2 letras), cédula, teléfono y sede. Al guardar, el
paciente queda elegido y sigue el modal de la cita. Lo escrito en la búsqueda se
prellena: un nombre va a nombre y apellidos, un número va a la cédula. El teléfono es el
contacto principal (D12) y acepta extranjeros (D30). Una cédula repetida se avisa en el
campo. La sede es obligatoria; solo si la clínica no tiene ninguna se sigue sin ella. La cédula se
normaliza como en el formulario completo (9 dígitos quedan X-XXXX-XXXX; si no, sin espacios ni
guiones) para no duplicar expedientes. Mientras guarda no se puede cerrar ni volver. La sede usa
el `branchUuid` único de hoy; el punto 6 la cambiará.

**API:** `birthDate` pasó a opcional en el API (migración `20261030120000_patient_birth_date_optional`,
aplicada solo en la base local). Hay que aplicarla en cada ambiente antes de publicar el front.
`PATCH /patients/:uuid` ahora la guarda (fecha real y no futura, si no 400; omitida no cambia lo
guardado) y `POST /patients` aplica la misma validación.

**Fecha de nacimiento opcional al editar:** un pre-registrado queda sin ella (el expediente
muestra "Sin registrar") y obligarla al editar empujaría a inventar fechas en un expediente
clínico. El formulario completo de crear paciente la sigue exigiendo. Si se edita sin fecha, no se
envía. Consecuencia: `POST /patients` y `POST /patients/bulk` aceptan pacientes sin fecha por API
directa, aunque las pantallas la siguen pidiendo.

## D33 · Mantenimientos 1 a 4 marcados a mano (2026-10-30)

**Decisión:** el modal "Indicadores del paciente" suma la pestaña Mantenimiento, con cuatro filas:
sin marcar, asistido (azul) o perdido (rojo). Cada toque se guarda solo y el expediente muestra una
píldora "Mant. N" por cada uno marcado. Tocar la píldora abre esa pestaña; el botón Indicadores
sigue abriendo en Laboratorio. Son cuatro columnas en `patient` y
`PUT /patients/:uuid/maintenances/:number`; cada cambio real deja `MAINTENANCE_CHANGED` en la bitácora.

**Sin validar a propósito:** STAFF puede marcar (no es dato clínico, aunque no ve la bitácora), se
puede marcar un paciente inactivo o fallecido y marcar el 3 sin el 1 y el 2. No se guarda la fecha del
mantenimiento: solo queda la del cambio en la bitácora.

**Por qué:** la clínica lo pidió como una marca manual que no se calcula desde las citas. Una
validación de orden o de estado impediría registrar lo que ya pasó.

---

## D34 · Intentos de contacto: contador con control de cambios (2026-10-31)

**Decisión:** el modal "Indicadores del paciente" suma la pestaña Contacto, con un contador de 0 a 3,
"Registrar intento" y "Reiniciar"; el expediente muestra la píldora "Contacto: N" si es mayor que 0.
`PUT /patients/:uuid/contact-attempts` recibe el valor absoluto (`count`) y el que muestra la pantalla
(`expectedCount`), los dos obligatorios. Si el guardado no coincide responde 409 y la pantalla avisa y
refresca. Cada cambio real deja `CONTACT_ATTEMPTS_CHANGED` en la bitácora.

**Sin validar a propósito:** STAFF puede registrar, porque llamar es tarea de recepción y no es dato
clínico, y se puede registrar en un paciente inactivo o fallecido. Un paciente borrado da 404.

**Por qué:** con un simple "sumar uno" o un valor sin comparar, dos personas con la pantalla abierta
podían pisar el contador con un dato viejo. La comparación ocurre dentro de la misma actualización, así
que de dos guardados simultáneos solo uno gana y queda un solo registro en la bitácora.

## D35 · Varias sedes por paciente (2026-10-31)

- Un paciente tiene una o más sedes (`branchUuids`). `branchUuid` sigue como la sede principal porque Zynka lo lee así.
- Editar un paciente sin sedes exige elegir al menos una. Un paciente que ya no tiene sedes se agenda sin mandar sede.
- Al agendar solo se ofrecen las sedes del paciente; si tiene una sola, ya va elegida y no se muestra el selector.
- La sede que ya traía una cita se conserva como opción aunque el paciente la haya perdido, para no cambiarla en silencio.
  El API la entrega como `nextAppointmentBranchUuid` (lista y detalle) y el modal de reagendar, desde el expediente y desde la agenda, arranca con esa sede.
- Sin cita previa y con dos o más sedes, la sede arranca vacía y es obligatoria, salvo que el filtro de sede de la agenda sea una sede del paciente. Con una sola va elegida.
- Desde el tablero, la cita queda en la sede del filtro activo; con "Todas las sedes" cae en la principal del paciente.
- Los pendientes sin sede aparecen con "Todas las sedes".
- El formulario de paciente exige sede solo si hay sedes para elegir: con la consulta de sedes fallida o una clínica sin sedes se puede guardar.

## D36 · Mantenimientos con check y nota (2026-11-01)

**Decisión:** al entregar audífonos el paciente tiene 4 mantenimientos gratis, uno cada 6 meses. Cada
Mantenimiento 1 a 4 tiene un check marcado a mano y una nota opcional (máx. 500 caracteres). Reemplaza a
D33 (estado asistido/perdido) y a D34 (intentos de contacto): ya no hay contador y lo de "se llamó" va en
la nota. `PUT /patients/:uuid/maintenances/:number` recibe `{ done?, note? }` (al menos uno; nota vacía
se guarda como `null`); se retiró `PUT /patients/:uuid/contact-attempts`. Son ocho columnas en `patient`
(`maintenanceNDone`, `maintenanceNNote`). La bitácora deja `MAINTENANCE_CHECK_CHANGED` y
`MAINTENANCE_NOTE_CHANGED`; los eventos viejos `MAINTENANCE_CHANGED` y `CONTACT_ATTEMPTS_CHANGED` se
siguen leyendo.

**Migración de datos:** asistido pasa a check marcado; perdido queda sin check y con la nota "Perdido",
para no perder ese dato; los contadores de intentos de contacto se descartan.

**Sin validar a propósito:** igual que en D33, STAFF puede marcar, se puede marcar un paciente inactivo o
fallecido y marcar el 3 sin el 1 y el 2.

**Por qué:** la clínica pidió un seguimiento más simple: una marca por mantenimiento y un espacio libre
para anotar llamadas o lo que haga falta.

**Diseño del modal y la ficha:**

- La ficha del paciente muestra una sola píldora "Mantenimientos 2 de 4" (también con 0) en lugar de una por mantenimiento; al tocarla se abre el modal en esa pestaña.
- El modal tiene el mismo ancho en las tres pestañas (el que necesita Mantenimiento) para que no salte al cambiar. Los mantenimientos van en una fila en pantallas anchas, 2x2 en tableta y apilados en celular.
- No hay toasts de éxito al guardar un check o una nota: se confirma con "Guardado" junto al campo. El toast queda solo para errores.
- El check y la nota se guardan con mutaciones separadas, para que guardar uno no pise el estado ni los avisos del otro. Cerrar el modal (Escape, fondo o "Listo") guarda la nota pendiente igual que al salir del campo; si falla con el modal ya cerrado, el toast cita el texto de la nota.

## D37 · La duración de un tipo alcanza a sus citas futuras (2026-11-01)

**Decisión:** al cambiar la duración de un tipo de cita en Configuración, sus citas de hoy en adelante
(hoy en hora de Costa Rica) pasan a fin = inicio + nueva duración; el inicio no cambia. Lo hace el API
en el mismo `PATCH /appointment-types/:uuid`, dentro de la transacción del tipo
(`appointment-type.storage.ts`), filtrando por tipo y tenant. El front invalida la consulta de citas al
guardar para que la agenda se vea al día.

**No se tocan:** las citas pasadas; las "sin hora" (08:00 UTC en punto, que la agenda pinta con la
duración del tipo); las cerradas (CANCELLED, COMPLETED, EXPIRED), porque reescribir su `updatedAt` haría
reaparecer las COMPLETED que el front oculta como reemplazadas al reagendar; y nada si la duración nueva
es igual a la anterior o se limpia (`null`).

**Sin cambio a propósito:** `schedule-next-appointment` sigue guardando 30 min fijos: crea citas sin
hora y la agenda no usa ese fin.

**Por qué:** cada cita guarda su `endTime` y la agenda lo respeta (D10), así que cambiar solo el tipo no
se veía en las citas ya agendadas.

## D38 · Secciones propias de Preguntas (2026-11-01)

**Decisión:** la clínica crea secciones propias dentro de "Preguntas" (plantillas `ClinicalTemplate`
con `speciality: 'QUESTIONNAIRE'`). Se crean y editan en Configuración > Preguntas, un acordeón por
sección debajo de "Historia clínica"; "Nueva sección" pide el nombre (obligatorio, máx. 60) y la
sección queda como borrador local hasta guardar con al menos una pregunta (POST); las existentes se
editan con PATCH. No se borran. En el expediente cada sección se llena varias veces: cada registro
guarda fecha, autor y una copia de las preguntas que tenía (`templateSnapshot`), se muestra el último y
"Ver anteriores" despliega el resto; los registros no se editan ni se borran. El último lleva "Último registro" y
"Ver anteriores (n)" muestra el resto, atenuados, bajo "Registros anteriores"; cada sección muestra
"Sin registros" o "N registros · último 12 mar". Un registro sin respuestas no se guarda, y si el API
rechaza por preguntas que cambiaron se muestra su mensaje y se recargan las plantillas. La historia
clínica no cambia (se llena una vez).

**Migración de datos:** no hay; las secciones y los registros son nuevos.

**Sin validar a propósito:** el front no limita cuántas secciones ni cuántos registros hay.

**Por qué:** la clínica necesita seguimientos que se repiten (cada visita un registro) sin tocar la
historia clínica, y que lo ya registrado no cambie si después editan las preguntas.

**Diseño:**

- Permisos: Configuración usa `EDIT_CLINICAL_TEMPLATE`; el expediente `VIEW_CLINICAL_RECORD`. STAFF no ve nada (el API responde 403 y el bloque se omite).
- En el expediente solo salen secciones con al menos una pregunta. Sin registros quedan como sin llenar; con el formulario con cambios, como borrador.
- "Nuevo registro" abre el formulario con las preguntas de hoy (Sí/No sin marcar), reutilizando los campos de la historia; al guardar se invalida la consulta, se cierra el formulario y el nuevo queda arriba.
- La lista de registros con fecha y autor (`EntryHistoryList`) es genérica para reutilizarla en las otoscopías.

**Actualización (2026-11-01) · corrección de registros:** un registro se corrige solo el mismo día
calendario (`America/Costa_Rica`) en que se creó; después queda fijo (el de las 23:50 ya no se corrige
a las 00:05). `PATCH /patients/:patientUuid/questionnaire-entries/:entryUuid` con `{ answers }`, mismos
permisos que el POST; si el registro no es del paciente o de la clínica responde 404, y fuera del día
409 con "Este registro ya no se puede corregir: solo se corrige el mismo día en que se llenó."
Corrige cualquier rol clínico, no solo el autor, y queda anotado quién (`updatedAt`, `updatedByUuid`;
`createdAt` y `createdByUuid` no cambian). Las respuestas se validan contra las preguntas guardadas en
el propio registro (`templateSnapshot`), con las mismas reglas del POST (al menos una con contenido,
tipos y topes). El GET trae además `updatedAt`, `updatedByName` y `canEdit`; el front usa `canEdit` y
no recalcula la fecha. La bitácora registra `QUESTIONNAIRE_CORRECTED`, sin copiar las respuestas.

**Actualización (2026-11-01) · front de corrección e historial en modal:**

- El último registro muestra "Editar" solo si `canEdit` es true. Abre el mismo formulario con las respuestas cargadas, usando las preguntas guardadas en el registro (`templateSnapshot`), y guarda con PATCH. Cancelar con cambios pide confirmación, igual que "Nuevo registro". Al guardar se recargan los registros y la bitácora.
- Si el registro se corrigió, bajo la fecha dice "Corregido por Ana · 14:32" (hora de Costa Rica con `formatTime`).
- 404 (registro no encontrado) muestra el mensaje, cierra la edición y recarga los registros; 400 igual que en el POST.
- 409 (ya no se puede corregir, por ejemplo se abrió "Editar" a las 23:58 y se guardó a las 00:01): el formulario sigue abierto con lo escrito, muestra el mensaje del API y ofrece "Guardar como nuevo registro" (POST con esas respuestas). Se recargan los registros para que "Editar" desaparezca; "Guardar cambios" se oculta porque volvería a dar 409.
- "Ver anteriores (n)" ya no despliega nada en la tarjeta: abre un modal (`SheetDialog` de agenda, hoja inferior en móvil) con una fecha colapsable por registro anterior. El último registro NO sale en el modal: ya está a la vista en la tarjeta y el contador `n` cuenta solo los anteriores.
- `EntryHistoryList` sigue genérico: recibe `renderEntry`, `getAuthor`, `getCorrection` y `renderLatestAction`, para reutilizarlo en otoscopías.
- La bitácora muestra `QUESTIONNAIRE_CORRECTED` como "Preguntas corregidas" con detalle "Corrigió «nombre»".

**Corregir no borra (API `056f004`):** al corregir, el API guarda las respuestas anteriores en `PatientQuestionnaireEntryRevision` (respuestas, quién corrigió y cuándo), en la misma transacción que el cambio. Todavía no hay endpoint para leerlas y la bitácora no copia respuestas.

## D39 · El día de una cita es el de Costa Rica, no el UTC (2026-11-01)

`GET /appointments?date=YYYY-MM-DD` filtra de las 06:00 UTC del día (incluida) a las 06:00 UTC del siguiente (excluida), es decir, de 00:00 a 24:00 en Costa Rica (UTC-6, sin horario de verano). Antes iba de 00:00 a 23:59:59.999 UTC y una cita desde las 18:00 de Costa Rica salía en el día siguiente. Las citas "sin hora" se siguen guardando a las 08:00 UTC (02:00 de Costa Rica del mismo día), así que caen en su día. El rango sale de `clinicDayRange` en `clinic-day.util.ts` del API. También van por el mes de Costa Rica (`toClinicMonthKey`) `scheduled-months`, el filtro `nextAppointmentMonth` y el detalle de la bitácora de citas: una cita del 31 de octubre a las 19:00 cuenta en octubre.

**No aplica a `GET /maintenance/upcoming?month=`**, que sigue en el mes UTC: lo usa `next-audiology-files`, que guarda las fechas de solo día a las 00:00 UTC, y con el mes de Costa Rica un mantenimiento del 1 de diciembre caía en noviembre. Esa app también llama a `GET /appointments?date=`: si alguna vez guarda citas de solo día a las 00:00 UTC, caerían en el día anterior.

**Pendiente en el front:** la agenda agrupa y ubica por hora con la zona del navegador (`toDayKey`, `toSlotHour`, `toMinuteOfDay`); es correcta solo con el navegador en hora de Costa Rica.

## D40 · Mantenimientos con tres estados e historial de notas (2026-11-01)

Cada Mantenimiento 1 a 4 tiene un estado (`UNMARKED`, `ATTENDED`, `MISSED`) y un historial de notas; reemplaza a D36 en estado y notas. Las notas se agregan con autor y fecha y no se editan ni se borran. `PUT /patients/:uuid/maintenances/:number` con `{ status }`, `POST .../:number/notes` (1 a 500 caracteres) y `GET /patients/:uuid/maintenances` (los 4, la nota más nueva primero). La bitácora registra `MAINTENANCE_CHANGED` solo si el estado cambia y `MAINTENANCE_NOTE_ADDED` sin copiar el texto; los eventos viejos de nota se muestran como "cambió la nota". La migración pasó `done = true` a `ATTENDED` y cada nota vieja a la primera del historial; los "Perdido" de D36 (check apagado con la nota "Perdido") quedaron en `UNMARKED` con esa nota. Las columnas `maintenanceNDone` y `maintenanceNNote` siguen en la base sin uso, para limpiarlas después. Cualquier usuario de la clínica cambia el estado y agrega notas; que solo el profesional médico agregue notas queda para el desarrollo futuro de roles.

**Diseño en el front:** el modal "Indicadores del paciente", pestaña Mantenimiento, muestra una fila por mantenimiento con un control de tres opciones (Sin marcar, Asistido, Perdido) que guarda al tocar, las dos notas más nuevas con autor y hora, "Ver todas (n)" y "Agregar nota" (campo con contador, Guardar y Cancelar; el texto se conserva si falla). En la ficha del paciente hay una píldora "Mant. N" por mantenimiento marcado: azul si asistió y roja si lo perdió. Las notas se leen con su propia consulta, aparte del paciente.

## D41 · Un dato vacío no muestra nada (2026-11-01)

Un campo sin valor no muestra "Sin registrar" ni `—`: queda en blanco. `EMPTY_VALUE = ''` en `formatters.ts`, y los formateadores devuelven vacío. Una etiqueta sin valor muestra la etiqueta y el valor en blanco; una celda o un renglón sin nada que mostrar (por ejemplo el detalle de la bitácora) queda vacío o no se dibuja. Se conserva "vacío" en la bitácora para un campo que se vacía ("X: valor → vacío"), porque ahí es un cambio. Reemplaza lo que decía la tabla de RULES §1.

## D42 · Preguntas: guardar lleva a "Último registro" y las filas del historial se distinguen (2026-11-01)

Tras guardar (corrección o registro nuevo) la vista vuelve al inicio de "Último registro", para ver "Corregido por X". En el 409 solo se muestra la línea roja del API (sin toast ni ayuda gris). La ayuda "Lo puedes corregir hoy; después queda fijo." es la misma al crear y al editar. Las filas cerradas del historial traen la primera respuesta con valor en una línea recortada y la etiqueta "Corregido" si aplica; la fecha corta ("1 nov, 22:01") solo va en la tarjeta compacta.

## D43 · La agenda de escritorio muestra las citas fuera de 8:00 a 18:00 (2026-11-01)

"Sin hora asignada" es solo para las citas confirmadas con el día y sin hora: las que guardan su inicio a las 08:00:00.000 UTC exactas (2:00 en Costa Rica). Toda otra cita tiene hora real, aunque sea de las 7:00 o de las 18:30 (creada por Zynka o por el API); antes salía como "sin hora" por caer fuera de 8 a 18. `resolveSlotHour` ya no recorta por rango y la regla vive en `isDayOnlyAppointment`.

La línea de tiempo del día en escritorio va como mínimo de 8:00 a 18:00 y se amplía a horas completas para que entren la cita más temprana y la más tardía (`resolveTimelineRange`): una de 18:30 a 19:00 lleva el fin a las 19:00, una de las 7:15 lleva el inicio a las 7:00. Si todo cae entre 8 y 18, queda igual que antes. La línea de "ahora", la sombra al pasar o arrastrar y el redondeo a la media hora (`snapToTimelineStep`) usan el tramo del día, así que soltar en la parte ampliada es posible.

**No cambia:** las horas que ofrece el modal de agendar y la lista de "poner hora" (`buildSlotHours`, `toSlotHour`) siguen de 8:00 a 17:00, el horario de atención de la clínica; una próxima cita fuera de ese horario queda sin hora preseleccionada. Los textos de `docs/novedades` ("de 8:00 a 17:00") describen esas listas y no se tocan.


## D44 · La otoscopía pasa a ser un historial por paciente (2026-11-02)

La otoscopía única de la exploración física (`PatientPhysicalExam`) se convierte en un historial, igual que Preguntas: cada "nueva" crea un registro y nunca pisa el anterior; solo se corrige el mismo día de creación en hora de Costa Rica, y la versión anterior queda guardada (D38, D39). Tabla nueva `PatientOtoscopyEntry` con OD, OI, autor, creación y corrección, más `PatientOtoscopyEntryRevision`.

**Backfill:** la migración copia la otoscopía única de cada paciente como su primer registro del historial, solo si algún oído tiene texto (los vacíos o solo espacios no generan registro). Fecha del registro = última modificación de la exploración (no se inventa una fecha de hoy) y autor = quien la modificó por última vez, o quien la creó si no hay otro; puede quedar sin autor. En la base de pruebas, 5 de 6 exploraciones tenían texto y dieron 5 registros.

**Pendiente:** las columnas `otoscopyRight`/`otoscopyLeft` de `PatientPhysicalExam` y las rutas `physical-exam` no se borran todavía ni se mantienen en paralelo (no hay doble escritura): se eliminan en una migración posterior, cuando el front ya lea solo el historial.

**Front:** la tarjeta "Exploración física" usa el historial de Preguntas (`EntryHistoryList`) y sus textos de corrección; "Editar" solo aparece si el API manda `canEdit`. El autor que viene sin dato se muestra como en Preguntas ("el equipo médico"). Si el API responde 409 al corregir, se avisa y se ofrece guardar como registro nuevo. El front ya no lee ni escribe las rutas `physical-exam`.

**Qué se decidió no hacer:** (1) El backfill no lleva `NOT EXISTS`: Prisma registra cada migración y no la vuelve a correr, así que no puede duplicar. (2) Los pacientes con borrado lógico conservan su historial, a propósito. (3) Las otoscopias guardadas dentro de un control médico siguen siendo parte del control y no se copian al historial. (4) La bitácora usa `PHYSICAL_EXAM_UPDATED` tanto al crear como al corregir una otoscopia. Además, mientras las rutas `physical-exam` sigan vivas, `PUT /patients/:uuid/physical-exam` (y la compatibilidad de antecedentes) también agrega un registro al historial en la misma transacción, para que la forma vieja no deje el historial desactualizado.

## D45 · Los audífonos en laboratorio llevan un historial de envíos (2026-11-02)

Hasta ahora el switch "Audífonos en laboratorio" guardaba solo una fecha (`hearingAidsInLabSince`): al entregar se perdía el rastro. Tabla nueva `PatientLabShipment` (día de envío, día de entrega, nota, quién envió y quién entregó). Prender el switch abre un envío con ese día; cambiar la fecha mientras está en laboratorio corrige el día del envío abierto; apagarlo es la **entrega**: pide el día (por defecto hoy; nunca posterior a hoy en hora de Costa Rica ni anterior al día de envío, con 400 y mensaje claro) y una nota opcional de hasta 1000. Máximo un envío abierto por paciente: el use case bloquea la fila del paciente dentro de la transacción y la migración agrega un índice parcial único (`WHERE "deliveredAt" IS NULL`). `GET /patients/:patientUuid/lab-shipments` devuelve el historial del más reciente al más viejo.

**Backfill:** cada paciente con el switch prendido y `hearingAidsInLabSince` recibe un envío abierto con ese día y sin autor. Quien tenía el switch apagado no genera registros (no hay dato de envíos pasados). Un paciente con el switch prendido pero sin envío abierto (dato inconsistente) al entregar queda con un envío ya cerrado con `sentAt` = `deliveredAt`.

**La nota va también a Control de evolución:** la clínica hoy escribe lo que pasó con el laboratorio como nota de evolución, y el usuario dijo que es la misma nota. Por eso, al entregar con nota, el API guarda el texto en el envío y crea además una nota de Control de evolución (mismo texto, mismo autor, fecha de hoy) por la vía normal, todo en la misma transacción: si falla una, no queda la otra. Así no hay que escribirla dos veces ni queda una nota que solo se ve en un lado. La bitácora anota `HEARING_AIDS_DELIVERED` con el día y si trajo nota (sin el texto), más el `NOTE_ADDED` de la nota de evolución.

**Qué se decidió no hacer:** una entrega no se corrige por ahora (ni el día ni la nota); si hace falta, se agrega después con la misma regla de "solo el mismo día" de D38/D39. Tampoco se editan ni se borran envíos desde la pantalla.

**Corrección con uuid y pestañas viejas:** al corregir la fecha del envío abierto, el front manda el `shipmentUuid` de ese envío. Si otra pestaña ya lo entregó, el API responde 409 ("Este envío ya fue entregado. Recarga la página."); lo mismo si se entrega dos veces ("Los audífonos ya se marcaron como entregados."). En ambos casos el front muestra el texto del API en un aviso, cierra el formulario y refresca indicadores e historial. La entrega y la corrección de fecha cierran su 409 en la mutation, así que funciona aunque el modal se haya cerrado.

**Nota solo para roles clínicos:** el campo de nota de la entrega se muestra solo con `VIEW_CLINICAL_RECORD` (OWNER, ADMIN, DOCTOR); STAFF puede entregar sin nota (el API responde 403 si manda `note` y devuelve la nota en null en el historial). Con una entrega guardándose o con nota escrita, Esc y el clic en el fondo no cierran el modal; la X del encabezado sí.

## D46 · Mantenimiento es una casilla: en pantalla ya no existe "Perdido" (2026-11-05)

En el modal "Indicadores del paciente", pestaña Mantenimiento, cada Mantenimiento 1 a 4 es una casilla con su título ("Mantenimiento N"): marcada es asistido y desmarcada es no asistido. La nota se relaciona con cada mantenimiento. Reemplaza los tres estados de D40 solo en la UI: el API, la base y el enum (`UNMARKED`, `ATTENDED`, `MISSED`) no cambian, y la pantalla solo escribe `ATTENDED` (marcar) o `UNMARKED` (desmarcar). Un registro viejo en `MISSED` se ve desmarcado y, al marcarlo, pasa a `ATTENDED`. Las píldoras del expediente no se tocan y siguen mostrando `MISSED` en rojo si el dato existe. Se descartaron los chips de la ronda anterior.

**Diseño:** lista con divisores finos, casilla nativa con la etiqueta asociada (tocar el texto también marca, 44 px de alto) y, a la derecha, un texto gris "Agregar nota" o "N notas" que abre las notas debajo de la fila, con sangría tras la casilla: las 2 más recientes, "Ver todas (N)" y una línea con el campo y "Guardar". Una sola fila abierta a la vez.

## D47 · La tarjeta de otoscopia siempre crea; el historial vive en Control de evolución (2026-11-07)

La tarjeta "Exploración física (Otoscopia)" muestra siempre el formulario de una otoscopia nueva (OD, OI, contador 0/1000 y "Guardar otoscopia"). Al guardar sale el aviso "Otoscopia guardada" y los campos se vacían para registrar otra. Ya no hay "Último registro", "Ver anteriores", "Nueva otoscopia" ni corrección desde la tarjeta, y se quitó la nota "Lo puedes corregir hoy; después queda fijo." Reemplaza el comportamiento de otoscopías de 2026-10-28.

El historial se consulta solo en Control de evolución: el API crea una nota de categoría EXTERNAL_TEST ("Pruebas") al guardar, y el front solo refresca la lista de notas del paciente (no crea la nota). Depende de la rama `feature/otoscopia-en-evolucion` del API.

"Cancelar" pasa a "Limpiar" (texto genérico `common.buttons.clear`): aparece solo cuando hay texto y vacía los campos sin guardar. "Guardar otoscopia" está deshabilitado mientras ambos campos estén vacíos. Se borraron la query del historial, la mutation de corrección y los componentes de la vista del último registro.

## D48 · Mantenimiento vuelve a tres estados, con dos botones "Vino" y "Lo perdió" (2026-11-07)

Reemplaza la casilla de D46. Cada Mantenimiento 1 a 4 muestra su título y dos botones: "Vino" (azul al activarse, `ATTENDED`) y "Lo perdió" (rojo, `MISSED`). Tocar uno lo marca; tocar el que ya está activo vuelve a pendiente (`UNMARKED`, sin color). Se guarda al tocar, con la misma mutation; el API no cambia y lo ya marcado como hecho (`ATTENDED`) se ve azul sin migración. Los botones llevan `aria-pressed` y nombre "Mantenimiento N: vino / lo perdió". En celular el acceso a las notas baja a una segunda línea si no cabe. Colores con tokens `brand` y `danger`; las píldoras del expediente ya pintaban `MISSED` en rojo.

Textos: "asistido" pasa a "vino", "perdido" a "lo perdió" y "sin marcar" a "pendiente" en avisos, píldoras y bitácora.

## D49 · Tipos de cita: se pueden agregar desde Configuración, no quitar (2026-11-07)

Configuración, Tipos de cita, tiene el botón "Agregar tipo de cita", que abre el mismo modal de edición vacío. El nombre es obligatorio y no puede repetirse (sin distinguir mayúsculas): el API no rechaza duplicados, por eso se valida en el cliente. Un tipo nuevo nace de 30 min, igual que el resto de los valores por defecto del modal. Al guardar se refresca la lista y sale el aviso; sin tipos se ve "La clínica todavía no tiene tipos de cita." con el mismo botón. No se pueden quitar tipos: las citas viejas los referencian.

## D50 · Teléfonos con selector de país; Costa Rica por defecto y mismo formato guardado (2026-11-07)

`PhoneField` lleva un selector con bandera y código (+506 Costa Rica al inicio) y una lista completa de países con buscador, en `src/shared/utils/phone-countries.ts`, sin librerías (libphonenumber pesa demasiado para lo que se necesita).

- Lo guardado de Costa Rica no cambia: `patient.phone` es `+506 XXXX-XXXX` (lo comparte Zynka) y el contacto `XXXX-XXXX`. Otro país se guarda `+<código> <dígitos>`; `normalizePhone` reformatea al guardar.
- Al cargar un valor se detecta el país por su código. Con código compartido gana un dueño fijo (+1 EE. UU., +7 Rusia, +44 Reino Unido) salvo que el usuario haya elegido otro en esa sesión. Los países de +1 con código propio (Jamaica, República Dominicana, Puerto Rico y demás islas) usan el código de 4 dígitos.
- Un valor viejo que no se reconoce (largo, sin `+`) se deja tal cual, sin máscara y sin cortarlo, y el selector muestra un globo.
- Validación: Costa Rica 8 dígitos; otros países de 8 a 15 dígitos en total, contando el código (el API acepta hasta 20 caracteres). Se quitó la regla "Costa Rica con +": con el selector marcaba como error números extranjeros cortos.
- Las banderas son emoji generados desde el ISO: en Windows se ven como letras del país.
- Con un país extranjero elegido, al escribir o pegar: se quita el 0 de larga distancia inicial (`07911 123456` con Reino Unido es `+44 7911123456`) y el código repetido sin `+` (`57 300 1234567` con Colombia es `+57 3001234567`). El código solo se quita si lo que queda tiene 10 dígitos o más: con menos podría ser un número nacional que empieza igual (Brasil, `55 9…`); por eso `34 612345678` con España queda con el 34 repetido y la validación no lo atrapa. Quitar el 0 también afecta a países que lo conservan (Italia).
- Con Costa Rica elegido, `+` seguido de exactamente 8 dígitos que empiezan en 2, 4, 5, 6, 7 u 8 (y no en 506) se toma como número tico (`+22223333` es `2222-3333`) y no como otro código (+222). Un `+` con otro código reconocible cambia el selector a ese país.
- Al cambiar de país con un número cargado no se cortan dígitos (`switchPhoneCountry`): con Costa Rica quedan más de 8 y el campo muestra el error de formato.
- Un valor viejo como `+13055551234` no se reescribe si el usuario no tocó el teléfono al editar otro dato: el formulario guarda el valor original (`storedPhone`) y `normalizePhoneUnlessUnchanged` lo devuelve tal cual.
- Pruebas de `phone.ts`: `yarn test:phone` (tsc a caché y `node --test`), sin agregar un runner.

## D51 · Prioridad de paciente: ícono en la fila, filtro y casilla en el expediente (2026-11-07)

`PatientFlag.PRIORITY` (`isPriority` en el API, con `prioritySince`) se marca y desmarca con `PUT /patients/:uuid/flags`, con toast e invalidación de la lista.

- En la lista va un botón de ícono a la par del lápiz, con `aria-pressed`, tooltip y `aria-label` "Marcar como prioridad" / "Quitar prioridad" más el nombre; marcado se pinta con el token `danger`. No reordena la lista.
- lucide-react no trae un ícono de persona corriendo: se usa `Footprints`.
- El filtro "Prioridad" sale solo en "Indicadores" (el filtro recorre `PatientFlag`).
- En el expediente es una casilla "Prioridad" (como la de video), no una píldora: las píldoras abren el modal de indicadores, que no lleva prioridad. Usa un hook ligero (`usePatientPriority`) porque `usePatientFlags` consulta los envíos a laboratorio.
- La tarjeta móvil reserva más espacio al título (`cardTitleClassName="pr-20"`) por los dos botones.
- La bitácora registra `PRIORITY_CHANGED` (meta `{ isOn }`, como `RENEW_PRESCRIPTION_CHANGED`): "Marcado como prioridad" / "Prioridad quitada".

## D52 · Filtro "Audífonos en laboratorio" con día de envío (2026-11-07)

Con el filtro de laboratorio activo aparece un selector de un solo día (`LabDateField`, máximo hoy) y un botón "Quitar día". Con día elegido el API (`hearingAidsInLabDate`) devuelve solo los enviados ese día. Quitar el filtro de laboratorio limpia el día (también al usar un preset). La etiqueta de la lista no cambia.

## D53 · Notificación de pacientes sin movimiento (2026-11-07)

`NotificationKind.STALE_PATIENT`: una notificación por paciente de `GET /patients/stale` (React Query, 5 min), "{nombre} lleva 6 meses o más sin movimiento" y el detalle "Último movimiento: {fecha}".

- Id `stale-${uuid}-${lastMovementAt}`: si el paciente vuelve a quedar inactivo tras un movimiento nuevo, el aviso reaparece como no leído aunque se hubiera limpiado el anterior.
- Leerla no la quita; solo sale con "Limpiar". Al tocarla se marca leída, se cierra el panel y se abre la ficha. Cuentan en el contador de no leídas.
- Orden: versiones arriba y pacientes después, del más antiguo al más reciente (el orden del API). Se descartó mezclar por fecha: los pacientes pueden ser muchos y enterrarían la versión nueva, y por fecha siempre quedarían debajo de todas formas.
- Si la consulta falla, la bandeja muestra solo las versiones.
- La armada de ids y orden es lógica pura en `build-notifications.ts`; `yarn test:notifications` la prueba.

## D54 · Tipos de cita: el nombre repetido se detecta sin mayúsculas, tildes ni espacios (2026-11-07)

Completa D49: al agregar o editar un tipo de cita, "control " (con espacio al final) y "Contról" cuentan como repetidos de "Control". La comparación (`toComparableName`) quita tildes, mayúsculas y espacios en los extremos; el nombre se guarda como lo escribió el usuario, ya sin espacios en los extremos.

## D55 · Teléfonos +1 con máscara `(305) 555-1234` (2026-11-07)

Completa D50: con un país de código +1 (Estados Unidos, Canadá…) el campo enmascara mientras se escribe como `(XXX) XXX-XXXX`, y al mostrarlo sale `+1 (305) 555-1234`. Se sigue guardando compacto (`+1 3055551234`), así que no cambia nada en la base ni en el API. Con más de 10 dígitos queda sin máscara para que la validación avise. Los demás países siguen con los dígitos sin máscara al escribir y en bloques al mostrarlos.

## D56 · Audiograma POC: BIAP solo con grados principales, sin subgrados; con PTA 5124 (2026-11-07)

El selector de escala del Resumen ofrece ASHA (por defecto, PTA 512) y BIAP (recomendación 02/1, 1996). BIAP se usa solo con sus grados principales, sin subgrados, y con el PTA de 4 frecuencias (500, 1000, 2000 y 4000 Hz, redondeado a múltiplos de 5), con límites superiores inclusivos: Normal ≤20, Leve 21–40, Moderada 41–70, Severa 71–90, Profunda 91–119 y Cofosis ≥120. Como el gráfico llega a 120 dB, Cofosis se dibuja como una franja de 1 dB (119–120) al pie y su texto dice "120 dB o más". La escala elegida gobierna el grado de la tabla, el popover de info y las franjas y etiquetas de los audiogramas; la raya gruesa de 20 dB sigue fija.

## D57 · Audiograma POC: "Palabras falladas" calcula la discriminación máxima (2026-11-07)

El Resumen tiene la fila "Palabras falladas" (un campo por oído). Al escribirla se llena "Discriminación máxima (%)" de ese oído con (presentadas − falladas) ÷ presentadas × 100, redondeado al entero.

- Presentadas por oído según el último tipo de lista elegido: monosílabos 25 (4 % por palabra) y bisílabos Tato 10 (`TATO_DISPLAYED_WORDS`, 10 % por palabra).
- El último tipo elegido se conserva al cerrar el panel de palabras con la X; si nunca se eligió uno, se usan monosílabos.
- Solo enteros de 0 al total. Vaciar el campo no cambia la discriminación, y editar la discriminación a mano no toca las falladas.
- Al cambiar el tipo de lista se recalcula la discriminación de los oídos con falladas, siempre que sigan dentro del nuevo total.

## D58 · Campo de fecha común `DateField`, en lugar de `<input type="date">` (2026-11-08)

El input nativo se dibuja distinto en cada navegador (en Chrome en español se ve "dd ---- aaaa"). Los cinco lugares con `type="date"` pasan a `src/components/common/date-field/`: `DateField` (controlado, `value`/`onChange` con "YYYY-MM-DD" o vacío) y `FormDateField` (wrapper de Formik con el label y el error de `FormField`).

- Se escribe como dd/mm/aaaa con máscara (solo dígitos, barras automáticas; borrar una barra borra el dígito anterior) o se elige en un calendario con botón de ícono dentro del campo.
- Hacia afuera solo sale una fecha completa, real (31/02 no vale), de 1900 en adelante y dentro de `min`/`max`; si no, sale vacío. Así validaciones y API no cambian.
- El error de lo que se escribe (fecha inválida, fuera de rango, incompleta al salir del campo) va primero; si no hay, se muestra el `errorMessage` de fuera.
- Calendario con semana de lunes a domingo; el título abre meses y año, y el año abre páginas de 12 años. En móvil (`useIsMobile`) es una hoja inferior con fondo oscuro; en escritorio, un popover anclado al botón.
- Todo en hora local (`fromDayKey`, `toDayKey`, `buildMonthGrid`); nunca `new Date('YYYY-MM-DD')`. Meses y días salen de Intl `es-CR`; los demás textos, de `TEXT.GENERAL.DATE_FIELD`.

## D59 · Informe de audiometría impreso desde la BD (2026-11-08)

No se guarda PDF: el botón Imprimir arma `AudiometryPrintReport` con los datos guardados y usa `window.print()` en A4.

- Página 1: encabezado y paciente, los dos audiogramas con la columna de grados en medio, Weber debajo con sus flechas, logoaudiometría y la tabla Resumen (PTA, grado, umbral, discriminación, falladas, método y escala).
- Página 2, siempre (`break-before-page`): Diagnóstico y Observaciones ("Sin registrar" si están vacíos) y la firma.
- El informe no lleva la simbología ni la lista de palabras: son ayudas de captura, no resultado clínico.

## D60 · Editor visual de plantillas con TipTap, guardando markdown (2026-11-08)

El mensaje de la plantilla se escribe en un editor tipo Word (TipTap sobre ProseMirror) en lugar de un `<textarea>`. Lo guardado no cambia: sigue siendo markdown con `# título`, `**negrita**`, `*cursiva*`, `~~tachado~~`, listas `- ` y `1. ` y variables `{{clave}}`, así que el API y el PDF (`document-template-pdf.ts`) siguen igual.

- La conversión markdown a documento y de vuelta es código propio (`document-template-document.ts`, con pruebas de ida y vuelta); su parser inline es el mismo que usa el PDF.
- Las variables son etiquetas inline que no se editan, con su nombre en español; se borran de una vez y se guardan como `{{clave}}`. Una clave desconocida se pinta como etiqueta de error y la validación sigue impidiendo guardar. Escribir o pegar `{{clave}}` también crea la etiqueta.
- Solo se admiten los formatos que el markdown puede expresar (negrita, cursiva, tachado, títulos, listas de una sola línea); pegar HTML se reduce a eso. Sin saltos de línea suaves ni listas anidadas.
- Limitaciones conocidas: no hay escape de `*`, `~~` ni `{{` literales, y una lista numerada se renumera desde su primer número.
- El editor se crea solo en el navegador (`immediatelyRender: false`) por el render del servidor de Next.

## D61 · Plantillas sin "Cuándo se usa" y panel de variables compacto (2026-11-08)

El editor deja de pedir "Cuándo se usa": ya no está en el formulario, la validación, el payload ni la lista (el API no se toca; una plantilla vieja con descripción simplemente no la muestra).

- El panel de variables muestra solo el nombre de cada una como chip clicable, agrupadas en Paciente y Documento (`DOCUMENT_TEMPLATE_VARIABLE_GROUPS`), con un check si está en uso. Sin `{{}}`, descripciones ni ejemplos.
- En 1440 es una columna fija de 16rem junto a la hoja; debajo de `xl` es un plegable "Variables (14)" sobre la hoja.
- Los ejemplos de cada variable siguen en `es.json` porque los usa "Ver ejemplo".

## D62 · Vista previa de plantillas en la misma página, con pdf.js (2026-11-08)

"Vista previa" (antes "Ver ejemplo") ya no abre un modal con un iframe: cambia el editor a una vista en la misma página que dibuja cada hoja del PDF de ejemplo en canvas con `pdfjs-dist` 3.11, con "Volver a editar" (también Escape, sin perder lo escrito) y "Descargar PDF".

- Cada intento de carga crea su propio worker: el worker de respaldo de pdf.js guarda la promesa fallida y "Reintentar" nunca se recuperaba.
- Por debajo de 640 px la hoja mide 720 px y solo el contenedor de páginas se desplaza de lado; a 304 px el texto no se leía.
- El encabezado con los botones queda fijo al bajar; en celular no muestra el nombre de la plantilla.
- Sin nombre, el archivo se descarga como "Plantilla sin nombre.pdf".

## D63 · Las variables `{{clave}}` se convierten después de cada cambio, no con una regla de entrada (2026-11-08)

La regla de entrada de TipTap (`nodeInputRule`) calcula mal la posición cuando el texto llega en un solo evento más largo que la variable (dictado, autocompletado, teclados predictivos): el editor lanzaba `RangeError: Position N out of range` y se perdía lo escrito. Ahora un plugin de ProseMirror (`appendTransaction`) revisa el texto tras cada cambio y convierte toda `{{clave}}` completa en etiqueta, conservando el formato (negrita, etc.).

- Cubre por igual teclear, pegar y dictar; reemplaza también la regla de pegado.
- Una `{{clave}}` partida entre dos formatos distintos (mitad en negrita) queda como texto.
- Deshacer quita la etiqueta junto con la última tecla, no por separado.

## D64 · Resumen del paciente como hoja de impresión, no con jsPDF (2026-11-08)

"Generar resumen" en el expediente abre un modal con tarjetas: plantillas de documento (se marcan
cuáles), historia clínica, última otoscopía y última audiometría. "Generar" arma una vista de
impresión en HTML y abre el diálogo del navegador (Guardar como PDF), igual que el informe de
audiometría (D59).

- Se eligió HTML + `window.print()` y no jsPDF: así se reusan tal cual los gráficos SVG del informe
  de audiometría; con jsPDF habría que pasarlos a imagen.
- Siempre lleva arriba el logo y la ficha del paciente, y al final una sola firma: línea para firmar
  a mano y el nombre del usuario con sesión (`fullName`). El título ("Msc.") sale de ese nombre; no
  hay campo aparte.
- La tarjeta de plantillas la ve todo el que ve al paciente; historia clínica, otoscopía y
  audiometría solo con el permiso clínico (RULES §7). Sin registros, la tarjeta sale deshabilitada.

## D65 · Vista previa editable del resumen antes de imprimir (2026-11-08)

"Generar" ya no imprime de una vez: abre una vista previa a pantalla completa con las hojas A4 del
resumen (el mismo componente de impresión), para revisar y corregir textos antes de imprimir.

- Las correcciones viven solo en esa vista y solo salen en el PDF: no se guardan ni llaman a la API.
- Se pueden corregir: el contenido de las plantillas, las respuestas de la historia clínica, los
  textos de otoscopía, diagnóstico y observaciones de cada audiometría, los datos de la ficha y el
  nombre bajo la firma. No se corrigen gráficos, logo, tablas numéricas ni Weber.
- Los cambios quedan en el DOM (`contentEditable="plaintext-only"`); el componente de impresión es
  `memo` y recibe props congeladas al generar, para que un re-render no los pise.
- "Volver" regresa al modal con la selección intacta; si hay cambios pide confirmar. Esc hace lo
  mismo y cerrar nunca imprime.
- Al imprimir salen las hojas con las correcciones, sin barra, fondo gris ni resaltado. En celular
  las hojas se escalan al ancho con `zoom` (`--summary-zoom`).

## 2026-11-08 Variables de plantilla, Clínica y Mantenimiento

- Variables nuevas (grupos Paciente, Pruebas, Clínica, Documento): otoscopía = la última otoscopía del paciente; diagnóstico y observaciones = la última audiometría con `invalidatedAt` null, sin importar lo elegido en las tarjetas; clínica = `GET /tenants/current`. Dato faltante sale vacío. Las consultas extra solo se piden si hay plantillas elegidas y bloquean "generar" mientras cargan.
- Configuración → Clínica usa dos permisos: `VIEW_CLINIC` (todos los que ven Configuración, salvo STAFF) y `EDIT_CLINIC` (solo OWNER y ADMIN). Quien solo ve, ve el formulario deshabilitado con un aviso.
- `ApiError` lleva `details` (`{field,message}`) para mostrar los 400 del API junto al campo en Formik.
- El teléfono de la clínica se guarda con `toPatientPhone` (Costa Rica con `+506 `); vacío se envía como cadena vacía y el API lo guarda como null.
- "Lo perdió" exige nota: guardar graba la nota y, al terminar, marca el estado perdido; cancelar o tocar fuera no cambia el estado. "Vino" pasa a "Recepción" solo en el botón.


## D66 · Cierre de las correcciones de Resumen, Clínica y Mantenimiento (2026-11-08)

- La nota de "Lo perdió" la exige solo el front: el API no la pide, así que otro cliente podría
  marcar perdido sin nota.
- Cualquier DOCTOR puede marcar una audiometría como mal hecha. Los roles y permisos finos quedan
  para un desarrollo futuro.
- El correo de la clínica admite hasta 254 caracteres, igual que el API (`TENANT_EMAIL_MAX_LENGTH`).
- Orden de publicación: primero el API con su migración y después el front. El front ya lee
  `invalidatedAt` y lo tolera ausente, pero la marca de mal hecha y la clínica necesitan el API.
- "Lo perdió" guarda desde el hook de la lista, no desde el formulario: la nota y el estado se
  encadenan, un cambio de estado nunca se descarta por haber otro en curso, y mientras se guarda no
  se puede cancelar ni plegar la fila. Si falla solo el estado, la nota ya está guardada y se
  reintenta únicamente el estado.

## D67 · Tipos de audiometría: clínica y rastreo (2026-11-08)

- El tipo se elige solo al crear. Cambiarlo con algo ya puesto abre un `ConfirmDialog` que, si se acepta, descarta lo marcado y escrito; si no hay nada, cambia sin preguntar.
- Rastreo: solo vía aérea sin enmascarado, resultado Pasa/Refiere obligatorio y solo observaciones. Se puede intentar guardar sin marcas; lo que se exige es el resultado.
- El resumen del paciente y el informe impreso quedan solo para clínicas. La impresión del rastreo está fuera de este alcance y el botón Imprimir no se muestra en rastreo.
- Los enums (`AudiometryTypeCode`, `ScreeningResult`) viven en `audiometry-constants.ts` para que los tests sin alias `@/` los importen.
- Etiqueta del historial: `fecha · tipo` y, en rastreo, `fecha · tipo · resultado`. Los nombres salen del `name` que devuelve el API.

## D68 · Logo y nombre de la clínica (2026-11-08)

- `ClinicBrand` muestra el logo del tenant con `<img>` (nunca SVG inline) o, sin logo, el nombre en
  texto. No cae al logo de AudioColors; `BrandLogo` queda solo para login y pantallas públicas.
- Si el logo no carga, se muestra el nombre. Con logo y nombre juntos (resumen, informe) el nombre
  solo se escribe cuando hay logo, para no duplicarlo.
- Al guardar nombre o logo se actualiza la consulta del tenant y se invalida la sesión (`authMe`),
  que es de donde el menú y los documentos leen la clínica.
- La subida del logo usa `fetch` con `FormData`: el cliente de API fuerza JSON. El cliente valida
  tipo y 2 MB antes de enviar; el API repite la validación.
- El informe de audiometría espera las imágenes antes de imprimir, y su nombre de archivo usa el
  nombre vigente de la clínica.

## D69 · Rastreo en Archivos, informe e impresión (2026-11-08)

- Reemplaza lo que D67 dejó fuera: el informe y la impresión de rastreo ahora se soportan. El botón Imprimir se muestra también en rastreo. El resumen del paciente sigue solo con clínicas.
- El informe de rastreo muestra el tipo, el audiograma de vía aérea, el resultado Pasa/Refiere y las observaciones; no lleva Weber, logoaudiometría, tabla de PTA ni diagnóstico.
- Archivos no muestra las audiometrías mal hechas (se reutiliza `filterValidAudiometries`); siguen visibles en Audiometría con su franja. La tarjeta lleva la píldora "Pruebas" (`CategoryPill`, la misma de Control de evolución) y el tipo; en rastreo, el resultado en lugar del PTA.
- La vista previa se arma desde los datos de la audiometría (`buildSummaryAudiometry`), sin generar ni subir un PDF.
- Control de evolución: la nota con `audiometryEntryUuid` abre esa audiometría en el expediente por el parámetro de URL `audiometria=<uuid>`. Un uuid que no existe se ignora.


## D70 · Configuración → Usuarios (2026-11-08)

- Solo el `OWNER` administra usuarios de su clínica (nuevo permiso, no comparar el rol). El API lo
  exige en crear, editar a otro, cambiar rol, activar/desactivar y poner contraseña; hoy `/users` no
  revisaba el rol y cualquier sesión podía crear un OWNER.
- Alta con contraseña temporal que pone el OWNER (no hay envío de correos). El OWNER también puede
  poner una contraseña nueva a cualquier usuario de su clínica.
- No se borra: se desactiva y se reactiva. Un usuario inactivo no puede iniciar sesión.
- Nadie se desactiva ni se cambia el rol a sí mismo, y la clínica nunca queda sin un OWNER activo.
- El rol OWNER no se crea ni se asigna desde la pantalla ni el API: se asignan ADMIN, DOCTOR y STAFF.
- Un token emitido (1 h) sigue sirviendo hasta vencer aunque el usuario se desactive; login y
  `/auth/me` ya lo rechazan. Cerrarlo del todo (consultar estado por petición) queda para después.
- Un OWNER no administra a otro OWNER (ni rol, ni estado, ni contraseña): los dueños no se tocan
  desde la pantalla, y así la clínica no puede quedar sin OWNER activo.
- Cada acción de administración relee al actor en la base: debe estar ACTIVE y ser OWNER en ese
  momento (el token no basta).
- La firma y el avatar los cambia solo su dueño (la firma sale en documentos clínicos).
- Un rol viejo (USER, MEDICO o vacío) se muestra como "Rol anterior" y no se pisa al editar otros
  datos. El default de la columna `role` pasa a STAFF.
- Los correos se guardan y se comparan en minúsculas.
- Los roles siguen fijos (D20); los permisos configurables quedan para después.

## D71 · Niveles de acceso y "Atiende pacientes" (2026-11-09)

Reemplaza los roles OWNER/ADMIN/DOCTOR/STAFF como base de los permisos. Cada usuario tiene dos cosas
independientes:

- **Nivel de acceso** (uno, acumulativo):
  - **Recepción:** pacientes (datos generales y contactos), agenda y citas. Nada clínico y **ningún
    archivo** del paciente (ni ver ni subir).
  - **Administración:** lo de Recepción + Configuración (sedes, tipos de cita, formularios y
    plantillas clínicas, plantillas de documento), bitácora y usuarios con límites (abajo).
  - **Propietario:** lo de Administración + todo Usuarios, suscripción y exportar o borrar datos.
    La clínica nunca queda sin un Propietario activo.
- **Atiende pacientes** (sí/no): la única puerta al expediente clínico (historia clínica, evolución,
  pruebas, preguntas) y a Archivos. Lleva una o varias especialidades de un catálogo fijo de la
  plataforma (Audiología, Otorrinolaringología, Terapia del lenguaje, Medicina general), elegidas
  de una lista, sin texto libre. Todo profesional ve el expediente completo; la edición de pruebas
  se limita a su especialidad cuando existan pruebas de otra especialidad (hoy todas son de
  Audiología).
- Lo que ve una persona = su nivel + el expediente si atiende pacientes (mínimo necesario, HIPAA y
  Ley 8968). Sin "Atiende pacientes", ningún nivel ve datos clínicos, ni el Propietario.
- **Quién asigna qué:**
  - Administración crea usuarios, los desactiva y reactiva, les pone contraseña y asigna los niveles
    Recepción o Administración.
  - Solo el Propietario activa o quita "Atiende pacientes" y las especialidades, da el nivel
    Propietario y administra a otro Propietario. Puede activarse "Atiende pacientes" a sí mismo.
  - Nadie más se cambia su propio nivel ni su acceso clínico. Así un administrador no puede abrirse
    (ni abrirle a otro) los expedientes.
  - Cada cambio de nivel, de acceso clínico o de especialidad queda en la bitácora.
- **Título y colegiado:** los pone el propio profesional en su perfil, no el dueño. El acceso clínico
  no espera al colegiado; si falta, su perfil lo avisa.
- La variable "profesional" de las plantillas de documento es título + nombre + número de colegiado.
- Agregar y editar usuario son páginas propias, no un modal.
- Migración: OWNER → Propietario con "Atiende pacientes" (Audiología), para no cortarle el acceso
  que ya tiene; ADMIN → Administración sin acceso clínico; DOCTOR → Recepción + "Atiende pacientes"
  (Audiología); STAFF y roles viejos → Recepción. El texto libre de especialidad se descarta.
- El API valida todo; ocultar en pantalla no protege. Sustituye D20 y la parte de roles de D70.

## D72 · Aplicación de D71 en las pantallas (2026-11-09)

- Archivos del paciente cuenta como clínico: sin "Atiende pacientes" no se renderiza la sección.
- Mantenimiento (pastillas y sección de indicadores) se oculta sin acceso clínico, porque el API lo
  protege con `@ClinicalAccess()`.
- Indicadores y prioridad del paciente quedan abiertos a cualquier nivel: son datos generales del
  paciente y el endpoint no pide acceso clínico.
- Crear e invalidar pruebas pide además Audiología; ver pruebas solo pide atender pacientes.
- 403: el cliente llama una vez a `/auth/refresh`, guarda el token nuevo, refresca la sesión y repite
  la petición; si vuelve a fallar, se muestra el error. Cubre el cambio de acceso con token viejo.
- Los niveles asignables desde Usuarios pasan a Recepción y Administración; Propietario lo da solo
  el Propietario (pantalla de Usuarios en el encargo siguiente).

## Roles y especialidades: usuarios en paginas (rama feature/roles-especialidades)

- Formulario de usuarios con Formik + Yup, igual que el resto del repo (no RHF + Zod).
- Los niveles que puede asignar cada quien se calculan en local (`getAssignableRoles`); el API es quien rechaza lo que no corresponde.
- El ADMIN nunca envia `attendsPatients` ni `specialties` (el API responde 403).
- La bitacora de cambios de acceso vive en la ficha del usuario (`UserAuditList`).

- El profesional de las variables de documento y de la firma es quien genera el documento (sesion `/auth/me`): `formatProfessionalName` da `Lic. Ana Mora · Cod. 1234` y omite titulo o colegiado si faltan.
- La abreviatura MSC se muestra `MSc.`; el prefijo `Cod.` vive en `documentTemplates.licensePrefix`.
- `/perfil` guarda titulo y colegiado con `PATCH /users/:uuid` sobre uno mismo, solo si el usuario atiende pacientes, e invalida `authMe`.

## D73 · Cierre de la aplicación de D71 en pantalla (2026-11-09)

- `getSelectableRoles` calcula en local los niveles que ofrece el selector de Usuarios según quién edita (ADMIN: Recepción y Administración; OWNER: también Propietario). El API sigue siendo quien rechaza.
- "Ver" en la lista de usuarios se deriva de `!canEdit` (no de un permiso aparte): si no puede editar a esa persona, la acción pasa a "Ver".
- La fila de la tabla es clicable y además lleva un enlace en el nombre, para teclado y lectores de pantalla.
- `ResponsiveTable` renderiza las dos versiones (tabla y tarjetas); la oculta lleva `aria-hidden` e `inert` para que no reciba foco ni se lea dos veces.
- 401: el cliente intenta `/auth/refresh` una sola vez y repite la petición. Si el refresh falla, o el reintento vuelve a dar 401, cierra la sesión y manda al login. El refresh usa `fetch` directo, así que no hay bucle; el 403 conserva su único reintento.
- `DELETE_PATIENT` (Administración o Propietario) existe en `permissions.ts`, igual que en el API. No hay pantalla de eliminar paciente, así que no hay acción que ocultar.
- Sin permiso, `RequirePermission` y Configuración sin pestañas muestran el mensaje y el botón "Volver al inicio" (`common.backHome`), para no dejar un callejón sin salida.
- Perfil: sin "Atiende pacientes" no se muestra "Datos profesionales"; una nota gris pequeña (`profile.notProfessional`) queda dentro de la tarjeta "Tu cuenta".
- Ya estaban resueltos por permisos: menú y Configuración sin "Usuarios" para Recepción, y Mantenimiento oculto sin acceso clínico (D72). La ficha del paciente no tiene campos clínicos propios (como `bloodType`), así que no hay nada más que ocultar en el front.
- El front ahora permite al Propietario administrar a otro Propietario (editar, contraseña, nivel y estado), como ya hacía el API; `getUserActions` recibe el nivel del actor y sin actor un Propietario ajeno queda de solo lectura. Nadie cambia su propio nivel ni estado, y el API valida que quede un Propietario activo.

## D74 · Configuración estandarizada (2026-11-09)

- Todas las secciones de Configuración (Tipos de cita, Formularios, Plantillas, Clínica, Usuarios) ocupan el ancho completo de la columna; se quitó `isNarrow`.
- Piezas compartidas en `containers/settings/`: `SettingsCard` (`rounded-card border border-ink-200 bg-white`), `SettingsAddButton` (arriba a la derecha desde sm, ancho completo en móvil) y `SettingsSectionLoading`/`SettingsSectionError` (mismo `py`, icono y Reintentar).
- Clínica va dentro de una `SettingsCard` con cuadrícula de 2 columnas desde `lg` (Nombre y Logo, Teléfono y Correo; Dirección y Guardar a ancho completo); una columna en móvil.
- Bloques con `gap-4` en todas. Usuarios conserva su `ResponsiveTable`, que ya trae la misma superficie. Formularios también usa el `SettingsAddButton` común, arriba como las demás (ya no el botón punteado bajo la lista); su ayuda de "no se puede agregar" va como `hint` del mismo componente, debajo del botón y alineada a la derecha.

## D75 · Configuración: grupos, ancho por dato y estados (2026-11-09)

- El menú de Configuración tiene dos grupos con título pequeño, modelados con el enum `SettingsGroup`: "Tu clínica" (Clínica, Usuarios) y "Atención" (Tipos de cita, Formularios, Plantillas). Un grupo sin secciones visibles no muestra su título. En celular, el inicio usa los mismos grupos y cada sección lleva su descripción de una línea; escritorio y celular comparten las mismas piezas (`SettingsNav`).
- Un solo estado fuerte en el menú: el activo es `bg-brand-50 text-brand-700` con una barra a la izquierda. El hover cambia solo el color del texto y nunca compite con el activo; el foco es visible.
- Regla de ancho por dato (`SettingsFieldRow`): desde `lg`, etiqueta y ayuda a la izquierda (un tercio) y campo a la derecha; en celular, apilado. El campo mide lo que mide su dato: teléfono y duración `max-w-xs`, correo y nombre `max-w-md`, dirección `max-w-xl`, logo a su ancho natural. Los modales siguen la misma regla (duración en Tipos de cita, teléfono en Usuarios). Se quitó la cuadrícula de 2 columnas de Clínica; sustituye esa parte de D74.
- Ancho máximo común `max-w-6xl` en el layout de Configuración.
- Regla de estados de las listas (Tipos de cita, Plantillas, Usuarios, Formularios): el botón principal siempre se ve y queda deshabilitado mientras carga o falla; el estado de carga o error va dentro de una `SettingsCard`. Formularios tiene un solo bloque de error y un solo "Reintentar" que recarga las dos consultas; el verbo del botón es el mismo en todas ("Nuevo tipo de cita", "Nueva plantilla", "Nuevo usuario").
- La barra fija de Guardar de los formularios lleva fondo, sombra superior suave y espacio abajo; las filas de las listas tienen la misma altura mínima y el dato secundario el mismo color.

## D76 · Acordeones del expediente y de Configuración arrancan cerrados (2026-11-09)

- Al entrar a la pantalla ningún acordeón está abierto: ni Audiometría, ni Preguntas y sus secciones, ni los antecedentes, ni las secciones de Configuración → Formularios. Solo se abren por una acción de la persona.
- Acciones que sí abren: tocar el acordeón, crear una "Nueva sección", guardarla, "Actualizar" un registro y abrir una audiometría desde el enlace `?audiometria=<uuid>` de la nota de Control de evolución.
- Se quitó la apertura automática de la única sección (Preguntas y Configuración) y el estado inicial abierto de Audiometría. Una sección con cambios sin guardar muestra su aviso en el subtítulo aunque esté cerrada.

## D77 · Mi perfil: identidad, campos al ancho de su dato y vista previa (2026-11-09)

- Mi perfil usa el encabezado de identidad (avatar con iniciales, nombre, correo y nivel de acceso en `Badge`), las mismas tarjetas y el mismo ancho `max-w-6xl` de Configuración, campos al ancho de su dato (Título 13rem y colegiado 14rem desde `sm`) y una vista previa del nombre como sale en los documentos (`formatProfessionalName`, mismo prefijo y título abreviado que el resumen del paciente). El aviso de colegiado faltante va dentro de la vista previa, en tono de advertencia. El avatar se extrajo a `UserAvatar` y lo comparte la barra superior.

## D78 · Sedes en Configuración: color guardado y nunca se borran (2026-11-09)

- Cada sede guarda su color entre los 6 de marca (rojo, naranja, amarillo, verde, azul, morado). Ya no se calcula nada por el nombre de la sede (D1); agenda, pacientes y actividad leen `branch.color`. El amarillo usa texto oscuro `#8a6a00` por contraste.
- Una sede nunca se borra: se desactiva y se reactiva. Las inactivas no se ofrecen al registrar pacientes ni al agendar; las que ya tienen paciente o cita se siguen mostrando (tratamiento por selector).
- Campos: nombre (obligatorio, único: el 409 se muestra en el campo), teléfono y dirección opcionales (vaciarlos se manda como texto vacío) y color. Permisos iguales a Tipos de cita.
- El menú queda en dos grupos: "Tu clínica" (Clínica, Sedes, Usuarios) y "Atención" (Tipos de cita, Formularios, Plantillas); ajusta D75.

## D79 · Sedes: siempre una activa y la cita no se agenda sin sede (2026-11-09)

- No se puede desactivar la única sede activa: el botón queda deshabilitado con la ayuda "Debe quedar al menos una sede activa" y, si el API responde 409 al desactivar, se muestra ese mismo texto. El front lo distingue por el status 409 porque el API no transmite el código (`BRANCH_LAST_ACTIVE` se pierde en su filtro global de errores).
- Una cita existente cuya sede se desactiva conserva su sede al reagendarla: la sede de la cita se suma a las opciones aunque esté inactiva.
- El API no exige sede al agendar (Zynka la comparte), así que el front nunca envía una cita sin sede cuando el paciente tiene sedes: las opciones salen de las sedes activas del paciente; con una se elige sola, con varias el selector es obligatorio.
- Un paciente sin sedes activas no se puede agendar: se avisa "Este paciente no tiene sedes activas. Edítalo para asignarle una." con enlace a editarlo, y el botón de agendar queda deshabilitado. Lo mismo al agendar arrastrando en la agenda: toast y no se crea la cita.
- Topes iguales a los del API, contados después de quitar espacios: nombre 80, teléfono 30 y dirección 200.
- El calendario del iPhone no ofrece sedes inactivas para un calendario nuevo; uno ya creado con una sede inactiva se sigue mostrando.
- El modal de sede tiene pie fijo con Guardar y Cancelar, foco atrapado con autofoco en Nombre (`useFocusTrap`) y no se cierra con Escape ni con el fondo mientras guarda.

## D80 · Acciones del paciente por permiso (2026-11-09)

- Recepción ve los datos generales y los contactos del paciente, pero no lo modifica. Las acciones del expediente salen de dos permisos (`Permission.EDIT_PATIENT` y `Permission.VIEW_CLINICAL_RECORD`), nunca del rol suelto:

| Acción | Recepción sin atender | Administración/Propietario sin atender | Cualquier nivel con "Atiende pacientes" |
|---|---|---|---|
| Modificar paciente, cambiar estado, contactos y dispositivos | No | Sí | Sí |
| Abrir o cambiar indicadores (incluidos prioridad y candidato a video) | No | No | Sí |
| Generar resumen | No | No | Sí |

- Contactos y dispositivos siguen la regla de modificar paciente (`EDIT_PATIENT`): sin él no hay botón de editar ni se monta el modal de contactos. Prioridad y candidato a video son indicadores: gestión sin atender pacientes ya no los marca. Tipo de sangre y documento de garantía solo los escribe quien atiende pacientes; el API los ignora para los demás y los formularios de alta y edición no los piden.
- Las etiquetas de indicadores se ven a todos en solo lectura (la prioridad con bandera y su etiqueta en el expediente y solo el ícono con `aria-label` en la lista; candidato a video como chip) y solo se abren o cambian con permiso. Sin ninguna acción permitida la columna de acciones no se renderiza; con dos acciones o menos muestra su etiqueta también en celular. La pantalla de modificar va dentro de `RequirePermission` (`EDIT_PATIENT`) con su aviso y el botón "Volver al paciente", y sin permiso no pide los datos del paciente. Los íconos de acción por fila de la lista miden al menos 44x44.
- El API valida lo mismo: modificar y cambiar estado exigen gestión o atender pacientes; los indicadores, atender pacientes.
- No cambia: registrar un paciente nuevo y el registro rápido al agendar siguen para Recepción.

## D81. Motivo de prioridad, Equipos y equipo en la audiometria
- El motivo de prioridad se pide en un modal (por portal) al marcar, desde la lista y el expediente; quitar no lo pide. Se muestra bajo la casilla y en el tooltip del icono.
- Equipos vive en Configuracion con ruta `/configuracion/equipos`, grupo CARE, icono `Ear` y el mismo permiso que Sedes (`EDIT_APPOINTMENT_TYPES`). El 409 se muestra en el campo modelo.
- El selector de equipo de la audiometria nueva solo aparece si hay equipos activos; con uno solo queda preseleccionado; si falta, el guardado se frena con aviso en el campo y `EQUIPMENT_REQUIRED` del API se traduce a un toast. `ApiError` expone ahora `code`.
- Weber `NO_RESPONSE` se muestra como "NR" con etiqueta accesible "Sin respuesta".
- Weber arranca vacío ("Sin registrar") en cada frecuencia y solo se envía lo que el audiólogo elige; el API acepta Weber parcial. Antes arrancaba en "Centro" y quedaba guardado aunque nadie lo eligiera. El informe imprime "Sin registrar" donde no hay valor.
- En la lista de opciones, NR se lee "NR · Sin respuesta". El 409 `PATIENT_ALREADY_PRIORITY` recarga al paciente y avisa que ya estaba marcado.
- El informe de audiometria muestra paciente, identificacion y equipo una sola vez, en la ficha de arriba; el bloque final solo lleva la firma del profesional y la leyenda "Firma del profesional". Decision del usuario 2026-11-09.
- La firma del informe de audiometria es de quien hizo la audiometria (el mismo profesional de la ficha), no de quien imprime; la del resumen del paciente es de quien lo genera. El API de la entrada solo trae el nombre del autor: el titulo y el colegiado se agregan cuando el autor es quien imprime (sesion) o los lee de `GET /users/:uuid/signature` (identity), que cualquier usuario de la clinica puede pedir (tambien de un profesional inactivo); asi el mismo informe sale igual sin importar quien lo imprime. Si esa lectura falla o da 404, sale el nombre solo, nunca un nombre distinto al de la ficha. Sin autor conocido, la firma repite lo que muestra la ficha. Hook `use-author-signature-name`.
