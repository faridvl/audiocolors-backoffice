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

Ambas requieren cambio en el API, que se comparte con Zynka. Ver regla 7 de
`RULES.md`.

---

## Pendientes antes de producción

1. **Cambiar las contraseñas temporales** (`Password1` para ambos usuarios).
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

---

## D19 · Permisos por rol: el empleado no ve lo clínico

**Decisión (2026-10-22):** cuatro roles (dueño, administrador, médico y
empleado). El empleado (recepción, secretaría) ve pacientes, contactos, citas,
agenda y archivos; no ve historia clínica, Control de evolución, Bitácora ni
las preguntas de la historia clínica. El médico sí puede cambiar las preguntas.
Ver RULES.md §9.

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
  Cada rol trae permisos por defecto (los de RULES.md §9).
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

**Estado:** implementado con Tipos de cita e Historia clínica (2026-10-22); faltan sedes y usuarios.

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

