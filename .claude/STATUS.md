# STATUS.md

> Documento vivo. Actualizar al cierre de cada etapa, antes de `git push`.

**Última actualización:** 2026-09-15 · **Branch:** `main`

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
Colores **medidos** del logo (los seis estimados estaban mal). Verde `#66ae36`
como acento, grises neutros, interfaz clara. Logo extraído de los vectores del
manual de marca. Favicon: la oreja sola.

### Etapa 3 — Estándares de UI
Adoptados de billo (`web-backoffice-comx`): `ResponsiveTable` con tarjetas en
móvil, cuatro estados de lista, `FormViewSection`/`FormViewLabel`, paginación
con elipsis, escala tipográfica de 9 variantes.

### Etapa 4 — Densidad del expediente
Los documentos suben ~180px: "volver" y "editar" pasan al header, el nombre del
paciente es el título del header, y los datos se resumen en una franja con
enlace "Ver todos los datos". Acentuación corregida en ~20 archivos.

---

## 📋 Pendientes

### 🔴 Antes de entregar
| # | Tarea | Notas |
|---|---|---|
| P0-1 | **Cambiar las contraseñas temporales** | Ambos usuarios tienen `Password1`. `PATCH /users/:uuid` con `password` |
| P0-2 | **Desplegar** | Ver "Próximo paso" |

### 🟠 Deseable
| # | Tarea | Notas |
|---|---|---|
| P1-1 | Logo en SVG | El actual sale de vectores rasterizados a 1400px. Exportar SVG desde Illustrator da calidad infinita |
| P1-2 | Limpiar el paciente inactivo huérfano | Requiere acceso a DB: el API no permite reactivar ni borrar del todo (ver D9) |
| P1-3 | Paginación real del filtro "Inactivos" | Hoy filtra en cliente y su conteo no es exacto. Requiere cambio en el API |
| P1-4 | **Migrar a i18n** (`i18next` + `es.json`, patrón de Zynka) | Revierte la regla anterior de "sin i18n" — ver RULES.md §5.2. Instalar `i18next`/`react-i18next`, crear `src/shared/i18n/i18n.ts` + `src/static/texts/i18n.ts` (`TEXT` const) + `es.json`, y migrar los ~17 archivos `.tsx` con strings hardcodeados. Magastore NO sirve de referencia de uso real (tiene el setup pero 0% adoptado); usar Zynka como modelo de convención de keys. |

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
| Contraseña | `Password1` (temporal — ver P0-1) |

Datos de prueba: 1 paciente activo con 1 PDF + 1 paciente inactivo huérfano.
