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
  Calendario.
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

