---
name: nueva-seccion
description: Añade una sección CRUD completa al back-office (listado + alta + edición + detalle) siguiendo los patrones del proyecto. Usar cuando se pida una pantalla nueva para un recurso del API — citas, audífonos, usuarios, etc.
---

# Sección nueva

Cómo añadir un recurso al back-office sin improvisar estructura. Todo el
andamiaje ya existe: se reutiliza, no se reinventa.

## Antes de escribir código

1. **Comprobar que el endpoint existe** en `standard-saas-api`. Si no existe,
   **parar y avisar**: el API se comparte con Zynka y no se toca desde aquí
   (regla 7 de `.claude/RULES.md`).
2. Leer el DTO/controller del API para conocer los campos exactos.
3. Comprobar si Zynka (`next-audiology-files`) ya tiene algo portable — suele
   tenerlo, pero **revisa su tamaño y dependencias antes de copiar**: su detalle
   de paciente tiene 1052 líneas y 16 queries.

## Archivos a crear

Para un recurso `thing`:

```
src/types/things/thing.ts                        Thing, CreateThingPayload, enums
src/shared/api/querys/things-query.ts            useThingsQuery (lista)
src/shared/api/querys/get-thing-query.ts         useThingQuery (detalle)
src/shared/api/mutations/things/
  create-thing-mutation.ts
  update-thing-mutation.ts
src/components/containers/things/
  thing-validation.ts                            esquemas Yup compartidos
  thing-form.tsx                                 formulario compartido crear/editar
  things-list/{thing-list-container.tsx, use-thing-list.ts}
  thing-create/{...-container.tsx, use-...ts}
  thing-edit/{...-container.tsx, use-...ts}
  thing-detail/thing-detail-container.tsx
src/pages/cosas/{index.tsx, nuevo.tsx, [uuid]/{index.tsx, editar.tsx}}
```

Rutas de página **en español** (las ve el usuario); código en inglés.
Registrarlas en `src/shared/navigation/routes.ts` y en `useNavigation()`.

## Plantillas a copiar

| Para | Copiar de |
|---|---|
| Listado | `containers/patients/patients-list/` |
| Alta / edición | `containers/patients/patient-{create,edit}/` + `patient-form.tsx` |
| Detalle | `containers/patients/patient-detail/` |
| Query paginada | `shared/api/querys/patients-query.ts` |
| Mutation | `shared/api/mutations/patients/create-patient-mutation.ts` |

## Componentes que ya existen — no rehacer

- `ResponsiveTable` — tabla con los cuatro estados y tarjetas en móvil
- `Pagination` — numerada con elipsis
- `FormViewSection` / `FormViewLabel` — secciones de ver y editar
- `FormField` — campo de formulario con label, error y helper
- `Button`, `Typography`, `AppLayout`

## Checklist

- [ ] `AppLayout` con `title`; en detalle, además `backHref`, `subtitle` y
      `action` (el botón editar va en el **header**, no en el contenido)
- [ ] `export const getServerSideProps = authorizeServerSidePage();` en cada página
- [ ] El container no importa React Query: todo va en el hook
- [ ] `ResponsiveTable` recibe `hasActiveFilters` y mensajes distintos para
      "no hay datos" vs "sin resultados"
- [ ] Botón de crear a la derecha de la barra de filtros, `w-full sm:w-auto`
- [ ] Búsqueda con debounce de 300 ms que resetea a página 1
- [ ] Colores por token, cero hex sueltos
- [ ] Texto en español **con tildes** — escribir con Write o Python UTF-8,
      no con heredocs de bash
- [ ] Añadir el ítem a `NAVIGATION` en `app-layout.tsx`
- [ ] `yarn lint && yarn typecheck` limpios

## Al terminar

Actualizar `.claude/STATUS.md`: mover lo hecho a Completado y ajustar el
próximo paso.
