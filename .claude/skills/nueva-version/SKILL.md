---
name: nueva-version
description: Prepara una versión nueva de AudioColors antes del PR de develop a main — sube la versión (yarn release:bump), redacta el changelog que la clínica ve en Notificaciones a partir de los commits nuevos, se lo muestra al usuario como texto editable, espera su OK, lo carga en releases.ts y es.json y deja el PR listo. Usar cuando se pida pasar a producción, abrir el PR a main, "sacar versión", hacer el bump o escribir el changelog / las novedades de una versión.
---

# Nueva versión

Cada PR de `develop` a `main` es una versión (RULES.md §8). La clínica la ve
como una notificación en el menú del usuario: "Versión X.Y.Z" con sus cambios
agrupados en **Novedades**, **Mejoras** y **Correcciones**.

El orden no se cambia: **bump → borrador → OK del usuario → cargar → check → PR**.
Nunca se publica un changelog que el usuario no aprobó en el chat.

## Paso 1 — Qué entra

1. `git fetch -q` y listar los commits de develop que todavía no están en main:

   ```bash
   git log --no-merges --format="%h %s%n%b" origin/main..origin/develop
   ```

2. Repetir en el API (`E:\Proyectos\node\standard-saas-api`, o el checkout que
   se esté usando) para ver cambios que la clínica nota aunque vengan del API.
3. Si no hay nada nuevo para la clínica, decírselo al usuario y no hacer bump.

## Paso 2 — Número de versión

- **Mayor** (`2.0.0`): cambia la forma de trabajar de toda la clínica.
- **Menor** (`1.1.0`): hay al menos una novedad (una función nueva).
- **Parche** (`1.0.1`): solo mejoras chicas o correcciones.

Proponer el número junto con el borrador; el usuario puede cambiarlo.

## Paso 3 — Borrador en el chat (texto editable)

Mostrarlo **en un bloque de texto plano**, para que el usuario lo copie y corrija:

```
Versión 1.1.0

NOVEDADES
- Tema: descripción.

MEJORAS
- Tema: descripción.

CORRECCIONES
- Tema: descripción.
```

Cómo se escribe (lo lee el personal de una clínica, es un sistema médico):

- **Tema** corto y reconocible: el nombre de la pantalla o función
  ("Historia clínica", "Agenda", "Archivos").
- **Descripción** de una línea, en tono sobrio y profesional, sobre lo que
  pueden hacer ahora. Sin emojis, sin signos de exclamación, sin jerga
  (nada de API, endpoint, migración, componente, commit).
- **General, no exhaustivo**: no explicar cómo funciona por dentro ni cada
  detalle; varios commits de lo mismo son una sola línea.
- Fuera lo que la clínica no nota: refactors, documentación, CI, lint.
- Un grupo sin cambios no se muestra.

**Esperar el OK del usuario.** Si corrige el texto, usar el suyo tal cual.

## Paso 4 — Cargar la versión aprobada

1. `yarn release:bump X.Y.Z` (rama nueva desde develop, p. ej. `release/X.Y.Z`).
2. En `src/static/releases.ts`, reemplazar el comentario de la entrada nueva
   por sus cambios, en el orden del borrador:
   `feature('vX_Y_Z.clave')`, `improvement(...)`, `fix(...)`.
3. En `src/static/texts/es.json` → `notifications.releases.vX_Y_Z.<clave>`,
   `title` y `description` de cada uno. Escribir con Write o Python UTF-8
   (tildes), nunca con heredocs de bash.
4. `yarn release:check`, `yarn lint` y `yarn typecheck` limpios.
5. Mirar la notificación en el navegador (`yarn dev`): lista y detalle, en
   escritorio y celular. Mandar captura al usuario.

## Paso 5 — PR a main

1. Commit con la skill `commit` y push de la rama.
2. PR a `develop`, y de `develop` a `main`. El workflow
   `[CHECK] Versión documentada` exige la versión mayor que la de main y con
   sus cambios.
3. **Mergear a main solo con el OK explícito del usuario** (es producción).
   Al mergear, `[Release] Etiqueta de versión` crea la etiqueta `vX.Y.Z`.

## Imagen para el cliente (opcional)

Si el usuario también quiere la imagen de novedades para mandarle a la
clínica, usar la skill `novedades` con los mismos cambios aprobados.
