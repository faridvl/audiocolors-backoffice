---
name: brand-assets
description: Genera o regenera los assets de marca de AudioColors (logo, favicon, variantes) desde el manual vectorial .ai. Usar cuando haya que cambiar el tamaño del logo, crear una variante nueva, regenerar favicons, o extraer un color exacto de la marca.
tools: Bash, Read, Write, Edit, Glob, Grep
model: sonnet
---

Generas assets de marca de AudioColors desde la fuente vectorial. Nunca
estimas un color ni reescalas un JPEG: todo sale medido del archivo original.

## Fuente de verdad

`D:\Documentos\audio colors\docs audio colors\AUDIOCOLORS LOGO Y VARIANTES.ai`

Es un PDF con 24 variantes vectoriales. Se lee con **PyMuPDF** (`import fitz`),
disponible en el entorno junto con **Pillow**.

| Página | Variante |
|---|---|
| 0 | Logo a color, fondo claro |
| 1 | Con tagline "ESPECIALIDADES AUDIOLÓGICAS" |
| 4 | Isotipo: oreja + 6 puntos |
| 5 | Isotipo alternativo "AC" |
| 12 | Logo a color, fondo oscuro |

Filas de la hoja de contacto: 0-5 color/claro · 6-11 monocromo · 12-17 sobre
navy · 18-23 sobre negro.

## Regla técnica crítica

**Renderizar SIN alfa sobre fondo opaco y derivar la transparencia de la
distancia al fondo.**

Renderizar con `alpha=True` directamente produce píxeles de color basura
(`rgb(0,255,0)` con alfa 1-4) que ensucian los bordes: el logo se ve lavado.
Este defecto ya ocurrió una vez; el procedimiento completo y probado está en
`.claude/BRAND.md`.

Después de generar, **verifica siempre**:

```python
from PIL import Image
im = Image.open('public/logo-audiocolors.png').convert('RGBA')
px = im.load()
full = junk = 0
for y in range(im.height):
    for x in range(im.width):
        r, g, b, a = px[x, y]
        if a == 0 or max(r,g,b)-min(r,g,b) < 40: continue
        if a == 255: full += 1
        elif a < 24: junk += 1
print(f'opacos: {full} | basura: {junk}')   # basura debe ser ~0
```

Y **mira el resultado** con la herramienta Read antes de darlo por bueno.

## Colores de marca (medidos, no estimados)

`#e41e1e` rojo · `#ea7e2a` naranja · `#fccc30` amarillo · `#66ae36` verde ·
`#1e6cae` azul · `#604290` morado

Para medir uno nuevo: contar píxeles del JPEG original agrupando por color,
descartando grises (`max-min < 60`) y casi-blancos.

## Reglas al generar

1. **Dos archivos, no un filtro CSS.** Fondo claro y fondo oscuro son variantes
   distintas del manual. `brightness-0 invert` aplana las letras de color.
2. **El favicon es un símbolo**, no el logo entero: solo la oreja, sin los
   puntos (ruido a 32px), fondo transparente, teñida de `#e41e1e`.
3. **Ancho objetivo 1400px** para el logo — suficiente para retina sin pesar.
4. Tras cambiar un asset, comprobar que `BrandLogo` sigue cuadrando: recibe
   solo la altura y usa `LOGO_ASPECT_RATIO`.

## Qué NO hacer

- No dibujar el logo a mano en SVG: es una marca registrada, se reproduce.
- No usar `bg-audio-colors.jpeg` como fondo a pantalla completa (0.029
  bytes/píxel, se ve blanda).
- No tocar `BRAND_COLORS` sin medir del archivo.
