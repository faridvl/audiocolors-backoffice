# Alta del tenant y de usuarios

Cómo se creó AudioColors en el backend, y cómo agregar usuarios nuevos.

> **Nunca insertar usuarios directo en la base de datos.** Las contraseñas se hashean con bcrypt, así que un `INSERT` plano produce un login imposible. Además `Patient.tenantId` es un entero que debe coincidir entre las dos bases (`saas_identity` y `saas_medical_records`); el endpoint lo resuelve en una transacción.

---

## 1. Crear el tenant (ya hecho)

Se ejecutó una sola vez:

```bash
curl -X POST "https://standard-saas-api-production.up.railway.app/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "AudioColors",
    "businessType": "AUDIOLOGY",
    "ownerName": "Matthew Arias Mena",
    "email": "admin@audiocolors.com",
    "password": "<CONTRASEÑA>",
    "isSpecialist": false
  }'
```

Resultado:

| Dato | Valor |
|---|---|
| `tenantUuid` | `9e781ab3-f1db-4311-a9a2-ae2afb595718` |
| `tenantId` | `12` |
| OWNER `userUuid` | `774246f4-9eaa-44a5-b112-59f79614d80b` |

`RegisterTenantUseCase` crea Tenant + User OWNER en una transacción e inicializa los tipos de cita del tenant.

---

## 2. Agregar un usuario del personal

Con el token del OWNER o de un ADMIN:

```bash
# 1. obtener token
TOKEN=$(curl -s -X POST "https://standard-saas-api-production.up.railway.app/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@audiocolors.com","password":"<CONTRASEÑA>"}' \
  | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# 2. crear usuario
curl -X POST "https://standard-saas-api-production.up.railway.app/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nombre Apellido",
    "email": "persona@audiocolors.com",
    "password": "<CONTRASEÑA>",
    "role": "ADMIN"
  }'
```

Roles disponibles: `OWNER`, `ADMIN`, `DOCTOR`, `STAFF`. El usuario hereda el tenant de quien lo crea.

---

## Estado actual — ambiente de pruebas

| Rol | Nombre | Correo |
|---|---|---|
| OWNER | Matthew Arias Mena | `admin@audiocolors.com` |
| ADMIN | Maria Duran Arias | `maria@audiocolors.com` |

Ambos con contraseña temporal `Password1`.

**Pendiente antes de entregar a la clínica:** cambiar ambas contraseñas por unas reales. Se hace con `PATCH /users/:uuid` enviando `password`.

---

## Verificaciones hechas contra producción

| Prueba | Resultado |
|---|---|
| Login de ambos usuarios | OK — JWT con `tenantUuid` y `tenantId: 12` |
| Lista de pacientes del tenant nuevo | Vacía — no ve datos del tenant de pruebas de Zynka |
| Crear paciente | 201 |
| Subir PDF | 201 — Cloudflare R2 **operativo**, archivo accesible por URL pública |
| Eliminar documento | 204 |

Nota sobre el borrado de pacientes: `DELETE /patients/:uuid` es soft delete y `PATCH` ignora `isActive`, así que **un paciente eliminado no se puede reactivar** desde el frontend. Queda invisible en la lista normal y visible con `?includeInactive=true`.
