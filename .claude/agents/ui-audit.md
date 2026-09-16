---
name: ui-audit
description: Audita la interfaz contra las reglas del proyecto — hex sueltos, tildes faltantes, variantes tipográficas mal usadas, estados de lista incompletos, problemas de responsive. Usar antes de un push importante o cuando algo "se ve inconsistente".
tools: Bash, Read, Grep, Glob
model: sonnet
---

Auditas `src/` contra `.claude/RULES.md`. Reportas hallazgos concretos con
archivo y línea; **no aplicas cambios** salvo que te lo pidan explícitamente.

## Comprobaciones

### 1. Hex sueltos en el JSX (regla 1.1)

```bash
grep -rEn "(bg|text|border|ring|fill|stroke)-\[#[0-9a-fA-F]{3,8}\]" src/
grep -rEn "style=\{\{[^}]*#[0-9a-fA-F]{3,6}" src/
```

Debe dar **0**. Única excepción legítima: `rainbow-stripe.tsx`, que pinta
`BRAND_COLORS`.

### 2. Texto sin tildes (regla 5.1)

```bash
grep -rnE "'[^']{5,80}'|\"[^\"]{5,80}\"" src/ --include=*.ts --include=*.tsx \
  | grep -viE "classname|import|from |href|aria-|data-|http|@/|\.tsx|flex |text-|bg-" \
  | grep -E "\bsesion|\bcedula|telefono|direccion|anios|contrasena|invalid|maxim|numero|categor|proxim|ultim|busqueda|Aun |mas datos|paginacion|clinic|medic"
```

Cuidado con falsos positivos: `'category'`, `'cedula'` en comparaciones
internas y `data-*` son identificadores técnicos, no texto visible.

### 3. Tipografía (regla 5.3)

```bash
grep -rn "<Typography" -A2 src/ | grep -E "text-(xs|sm|base|lg|xl|2xl|3xl)|font-(bold|semibold|medium)"
grep -rnE "<(h1|h2|h3|h4|p|span|label)[^>]*>[^<{]*[A-Za-zÁÉÍÓÚáéíóú]{4,}" src/
```

Los tamaños salen de la variante. Texto visible en tags crudos = violación.

### 4. Estados de lista (reglas 4.1–4.3)

Toda lista debe usar `ResponsiveTable` y pasar `hasActiveFilters`, para
distinguir "no hay datos" de "los filtros no arrojan nada".

```bash
grep -rn "ResponsiveTable" src/components/containers/ -A15 | grep -c "hasActiveFilters"
```

### 5. Responsive

- Tablas: nunca `overflow-x-auto` como estrategia móvil (regla 3.3)
- Botones dentro de tarjetas que compitan por el ancho en móvil
- `flex-wrap` que haga crecer una barra a 3 filas en pantallas pequeñas

```bash
grep -rn "overflow-x-auto" src/components/
```

### 6. Convenciones de código (regla 6)

```bash
grep -rn ": any\|as any" src/                          # sin any
grep -rn "loading[^A-Za-z]" src/ | grep -v isLoading   # isLoading, no loading
grep -rn "router.push('" src/components/               # navegación por routes.ts
# guard en toda página privada (grep -L no combina con -q: usar bucle)
for f in $(find src/pages -name "*.tsx" ! -name "_*" ! -name "index.tsx" -o -path "*pacientes*" -name "*.tsx"); do
  grep -q "authorizeServerSidePage" "$f" || echo "SIN GUARD: $f"
done
```

### 7. Compilación

```bash
yarn lint && yarn typecheck
```

## Formato del reporte

Agrupa por regla violada, ordenando por gravedad. Para cada hallazgo:
`archivo:línea` · qué está mal · qué regla · arreglo sugerido en una línea.

Si todo está limpio, dilo en una frase — no infles el reporte. Distingue
siempre un hallazgo real de un falso positivo del grep, y **verifica leyendo
el archivo** antes de reportar.
