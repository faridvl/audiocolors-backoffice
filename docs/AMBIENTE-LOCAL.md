# Ambiente local de pruebas

Front, API y base corriendo en esta máquina, para probar de punta a punta
(incluidas migraciones nuevas) sin tocar la base de desarrollo ni la de
producción. Los datos son de prueba y se pueden borrar.

## Piezas

| Pieza | Dónde | Puerto |
|---|---|---|
| Base Postgres | Contenedor Docker `audiocolors-prueba-db` (se reinicia solo con Docker) | `5433` |
| API identity | Worktree del API, `yarn local:identity` | `7170` |
| API medical-records | Worktree del API, `yarn local:records` | `7071` |
| Front | Este repo, con las variables de abajo | `3000` |

Bases dentro del contenedor: `saas_identity` y `saas_medical_records`
(usuario `admin`, contraseña `password123`, solo para este contenedor).

El API fuerza SSL al conectarse a la base, así que el contenedor tiene SSL
activado con un certificado propio (`ALTER SYSTEM SET ssl = on`). Si se
recrea el contenedor, hay que volver a generarlo.

## Cuenta de prueba

Clínica "AudioColors (prueba local)", usuario OWNER `prueba@audiocolors.test`.
La contraseña está en `.env.prueba.local` (ignorado por git). Solo existe en
esta base local.

## Iniciar sesión con Playwright

`yarn e2e:login` entra con la cuenta OWNER `farid@audiocolors.com` y deja la sesión en
`e2e/.auth/session.json`, reutilizable como `storageState`. El correo y la contraseña
se leen de `.env.e2e.local` (`E2E_EMAIL`, `E2E_PASSWORD`, ignorado por git) y la URL de
`E2E_BASE_URL` (por defecto `http://localhost:3000`). La cuenta existe en esta base y en
la de desarrollo.

El API solo acepta peticiones desde los orígenes de `ALLOWED_ORIGINS` (`http://localhost:3000`):
un front en `127.0.0.1` o en otro puerto se queda en `/login` sin mostrar el motivo.

## Levantar

1. Abrir Docker Desktop (el contenedor arranca solo).
2. En el worktree del API, los `.env` de `packages/identity` y
   `packages/medical-records` apuntan a `localhost:5433`, con el mismo
   `JWT_SECRET` en los dos y `ALLOWED_ORIGINS=http://localhost:3000`.
3. Aplicar migraciones pendientes **solo en esta base**:
   ```bash
   MEDICAL_RECORDS_DB_URL=postgresql://admin:password123@localhost:5433/saas_medical_records npx prisma migrate deploy
   ```
   (desde `packages/medical-records`; igual para `identity` con `IDENTITY_DB_URL`).
4. `yarn local:identity` y `yarn local:records`.
5. El front contra el API local (las variables de la terminal ganan sobre `.env.local`):
   ```bash
   NEXT_PUBLIC_IDENTITY_API_URL=http://localhost:7170 NEXT_PUBLIC_MEDICAL_RECORDS_API_URL=http://localhost:7071 yarn dev
   ```

### Sin cerrar el front de desarrollo

Si `localhost:3000` ya corre contra el API de desarrollo (con su sesión abierta),
se levanta un segundo front en `127.0.0.1:3001`. Otro host para que las cookies de
sesión no se pisen, y otra carpeta de compilación para no chocar con la de `:3000`:

```bash
NEXT_DIST_DIR=.next-prueba NEXT_PUBLIC_IDENTITY_API_URL=http://localhost:7170 NEXT_PUBLIC_MEDICAL_RECORDS_API_URL=http://localhost:7071 npx next dev -H 127.0.0.1 -p 3001
```

Los dos `.env` del API local necesitan
`ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3001`.

## Si Docker Desktop no arranca

Docker Desktop está en `D:\Docker\Programas\Docker Desktop.exe` (no en
`Program Files`) y necesita la versión 4.94 o superior.

**"initializing Secrets Engine … engine.sock … The file cannot be accessed by
the system"**: tras un apagado o reinicio quedó trabado el socket de una corrida
anterior y Docker no lo puede reemplazar. Se arregla así:

1. Tocar **Quit** en el aviso de error (no "Reset to factory defaults": borra
   los contenedores y con ellos la base de prueba).
2. Borrar el socket **desde WSL**. Desde Windows no se puede: `del`, `fsutil`
   y renombrar la carpeta responden "El sistema no tiene acceso al archivo" o
   "Acceso denegado", porque es un socket de Unix.
   ```powershell
   wsl -d docker-desktop -- rm -f /mnt/host/c/Users/Personal/AppData/Local/docker-secrets-engine/engine.sock
   ```
   (dentro de esa distro la unidad C está en `/mnt/host/c`, no en `/mnt/c`).
3. `wsl --shutdown` y abrir Docker Desktop de nuevo. Si el contenedor
   `audiocolors-prueba-db` no arranca solo: `docker start audiocolors-prueba-db`.

## Límites

- Subir archivos no funciona: el API los manda a R2 y en local no hay
  credenciales. Para probar archivos se cargan filas en `PatientDocument`
  apuntando a imágenes de `public/`.
- Nunca usar estos `.env` contra Neon: la base de desarrollo es
  `ep-shy-dawn-aifninxj` y se migra a mano, confirmando antes.
