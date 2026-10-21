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

## Límites

- Subir archivos no funciona: el API los manda a R2 y en local no hay
  credenciales. Para probar archivos se cargan filas en `PatientDocument`
  apuntando a imágenes de `public/`.
- Nunca usar estos `.env` contra Neon: la base de desarrollo es
  `ep-shy-dawn-aifninxj` y se migra a mano, confirmando antes.
