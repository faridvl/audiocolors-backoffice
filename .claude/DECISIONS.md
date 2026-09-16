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

## D8 · Estándares de UI tomados de billo

Se adoptaron de `web-backoffice-comx`, un back-office de producción maduro:

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
