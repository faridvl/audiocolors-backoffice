# STATUS.md

> Documento vivo. Actualizar al cierre de cada etapa, antes de `git push`.

**Última actualización:** 2026-10-24 · **Branch:** `develop` · **Versión:** 1.0.0

---

## 🎯 Próximo paso

**Desplegar en Vercel** con el subdominio `backoffice.audiocolorscr.com`.

Pasos:
1. Importar el repo como proyecto **nuevo** en Vercel (aparte del landing).
2. Settings → Domains → añadir `backoffice.audiocolorscr.com`. Vercel crea el
   DNS solo si el dominio raíz ya está en la cuenta.
3. **Antes del primer deploy**, añadir las dos variables `NEXT_PUBLIC_*` (se
   inyectan en build; añadirlas después obliga a redeployar).

---

## ✅ Completado

### Etapa 1 — Scaffold y alcance base
Repo nuevo, Next.js 14 + Tailwind con tokens propios. Login, lista de pacientes
con búsqueda y filtros, alta y edición, expediente con archivos adjuntos y
preview inline (lightbox para imágenes, iframe para PDF — no existía en Zynka).

Tenant creado con `POST /auth/register`. Verificado contra producción: login,
alta de paciente, subida de PDF, borrado y **aislamiento entre tenants**.

Defectos de Zynka corregidos al portar:
- Filtro "Inactivos" no enviaba parámetro alguno (era idéntico a "Activos")
- `response.json()` sin protección reventaba con body vacío
- Cast `null as unknown as File` al cancelar la subida
- `window.confirm` nativo → modal propio
- Color primario hardcodeado dentro del componente `Button`

### Etapa 2 — Identidad
Colores **medidos** del logo (los seis estimados estaban mal). Acento verde `#66ae36`
(hoy azul `#1f6fb1`, ver D7), grises neutros, interfaz clara. Logo extraído de los vectores del
manual de marca. Favicon: la oreja sola.

### Etapa 3 — Estándares de UI
Adoptados de un back-office de referencia: `ResponsiveTable` con tarjetas en
móvil, cuatro estados de lista, `FormViewSection`/`FormViewLabel`, paginación
con elipsis, escala tipográfica de 9 variantes.

### Etapa 4 — Densidad del expediente
Los documentos suben ~180px: "volver" y "editar" pasan al header, el nombre del
paciente es el título del header, y los datos se resumen en una franja con
enlace "Ver todos los datos". Acentuación corregida en ~20 archivos.

### Etapa 5 — Agenda
Pantalla `/agenda`: franja de la semana, calendario para saltar de mes, y dos
pestañas — "Citas del día" (por llegar → en sala → atendidas, y "sin marcar"
para las que el job venció) y "Por confirmar" (pacientes con mes tentativo).
Cada fila abre una ficha con la acción principal y el resto (reagendar,
WhatsApp, `.ics` de día completo, llamar, expediente). El día, la sede y la
pestaña viven en la URL para que "atrás" desde un expediente no pierda la fecha.

Cambios en el API (rama `feat/agenda-estados-cita`, ya en `develop`):
reagendar **cancela** la cita vieja en vez de completarla, y `PATCH
/appointments/:uuid` anota `APPOINTMENT_ARRIVED` / `APPOINTMENT_COMPLETED` en la
bitácora. Las citas que el API viejo completó al reagendar se ocultan en la
agenda (se reconocen porque se "completaron" antes de su propia fecha).

Límites conocidos: el API no guarda la hora real (todas a las 08:00 UTC) ni el
profesional que atiende; la fila muestra quién **agendó**.

### Etapa 6 — Ajustes de pacientes y expediente
Tarjetas del resumen según los filtros (D14). Expediente rediseñado en tres
franjas, con los datos siempre visibles (D11). Contactos editables en un modal
(D12). Indicadores en pestañas y sin fechas, y candidato a video como casilla
(D13). Al confirmar una cita se puede elegir la hora (8:00 a 17:00), con el
mismo guardado que la agenda.

### Etapa 7 — Agenda, citas, archivos y garantía
Agenda de escritorio: el arrastre ya no se traba (Chrome lo cancelaba cuando
la lista se corría al levantar la tarjeta) y la ventana del día entra entera en
13" e iPad horizontal, con desplazamiento automático en el borde. Sin "Agregar a
mi calendario". Al agendar, el tipo va primero y la cita dura lo que su tipo
(Cita 60, Control y Mantenimiento 30; `PATCH /appointment-types/:uuid` nuevo).
Archivos: subir sin ver la extensión, rotar al verla y cambiar de sección.
Pacientes: meses del más cercano al más lejano con "Sin cita" al final (D15),
pestaña "Resumen" en móvil (D16) y acciones a la vista (D17). Indicadores:
pestaña "Estado de garantía" con "Garantía expirada", "Renovar receta" y el
archivo de la garantía (D13).

Cambios en el API: `feature/editar-tipo-cita` (ya en `develop`) y
`feature/garantia-y-documentos` (PR #11, con la migración
`20261020120000_add_warranty_expired_renew_prescription`, que se aplica a mano
antes de mergear). Probado de punta a punta con el API y una base Postgres
locales.

### Etapa 8 — Versión 1.0.0
Publicada el 2026-10-23 (back-office #24, API #16): historia clínica, Configuración,
agenda por horario, permisos por rol y bandeja de notificaciones/novedades por
versión (`yarn release:bump` / `release:check`). `develop` y `main` quedan iguales.
El detalle de cada cambio y los commits que cubre están en
`docs/novedades/HISTORIAL.md` (solo local, no versionado).

### Migración a i18n (antes P1-4)
`i18next` + `react-i18next` instalados, `src/shared/i18n/i18n.ts` y
`src/static/texts/` (`TEXT` + `es.json`) en uso. Queda el resto de pacientes (P1-5).

---

### Lote del 2026-10-28 — Mantenimientos (D33)
Pestaña Mantenimiento en Indicadores, píldoras en el expediente y registro en la bitácora. Avance
del lote en `HANDOFF.md`.

### Lote del 2026-10-28 — Intentos de contacto (D34)
Pestaña Contacto en Indicadores, píldora "Contacto: N" en el expediente y registro en la bitácora.

---

## 📋 Pendientes

### 🔴 Antes de entregar
| # | Tarea | Notas |
|---|---|---|
| P0-1 | **Cambiar las contraseñas temporales** | La tiene el usuario; P0-1 cambiarla antes de entregar. **Urgente:** ya está en el historial de un repo público; cambiarla cuanto antes. `PATCH /users/:uuid` con `password` |
| P0-2 | **Desplegar** | Ver "Próximo paso" |
| P0-3 | **Duración de los tipos de cita en producción** | Al pasar a producción, revisar en Configuración → Tipos de cita: Cita 60 min, Control y Mantenimiento 30, y Control marcado como control |

### 🟠 Deseable
| # | Tarea | Notas |
|---|---|---|
| P1-1 | Logo en SVG | El actual sale de vectores rasterizados a 1400px. Exportar SVG desde Illustrator da calidad infinita |
| P1-2 | Limpiar el paciente inactivo huérfano | Requiere acceso a DB: el API no permite reactivar ni borrar del todo (ver D9) |
| P1-3 | Paginación real del filtro "Inactivos" | Hoy filtra en cliente y su conteo no es exacto. Requiere cambio en el API |
| P1-5 | Migrar a i18n el resto del módulo de pacientes | Lista (`patient-list-container`, `use-patient-list`), formulario y mensajes de `patient-validation` siguen con texto suelto |

### 🔵 Próximas etapas (decididas, sin empezar)
| # | Tarea | Notas |
|---|---|---|
| P3-1 | **Configuración**: faltan sedes y usuarios | D21. Ya están Tipos de cita (D22) e Historia clínica |
| P3-2 | **Permisos configurables** por el administrador | D20: por rol y por clínica, el API y el front revisan permisos |

### ⚪ Si el uso lo pide
| # | Tarea | Notas |
|---|---|---|
| P2-1 | Importación masiva de pacientes | `POST /patients/bulk` ya existe (500 por lote, deduplica por cédula). Zynka tiene el importador de Excel listo para portar |
| P2-2 | Más usuarios del personal | `POST /users` con rol `ADMIN`, `DOCTOR` o `STAFF` |
| P2-3 | Búsqueda dentro de los documentos | Hoy filtra por nombre de archivo y categoría |

---

## Datos del entorno

| Dato | Valor |
|---|---|
| `tenantUuid` | `9e781ab3-f1db-4311-a9a2-ae2afb595718` |
| OWNER | Matthew Arias Mena · `admin@audiocolors.com` |
| ADMIN | Maria Duran Arias · `maria@audiocolors.com` |
| Contraseña | Temporal: la tiene el usuario; P0-1 cambiarla antes de entregar |

Datos de prueba: 1 paciente activo con 1 PDF + 1 paciente inactivo huérfano.

## Varias sedes por paciente (punto 6, D35)

- Hecho: formulario, pre-registro, expediente, lista y agenda con varias sedes; el API ya las guarda (`9f33ca2`).
- Sin publicar: rama `feature/preguntas-y-mantenimientos`; la migración `20261031140000_patient_branches` va antes que el front.
