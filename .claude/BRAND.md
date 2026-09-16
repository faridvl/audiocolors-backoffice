# BRAND.md

Identidad de AudioColors y cómo regenerar los assets.

---

## Colores

**Medidos del archivo original** (`logo.jpeg`) contando píxeles por letra, no
estimados a ojo. Una primera versión los estimó y los seis estaban mal.

| Letra | Hex | Rol |
|---|---|---|
| Oreja (C) | `#e41e1e` | rojo — favicon |
| O | `#ea7e2a` | naranja |
| L | `#fccc30` | amarillo |
| O | `#66ae36` | verde |
| **R** | **`#1e6cae`** | **azul — color de acento del sistema** |
| S | `#604290` | morado |

Viven en `src/shared/design/tokens.ts` → `BRAND_COLORS`, y alimentan la franja.

La escala `brand-50…900` de `tailwind.config.js` se derivó del azul `#1e6cae`
variando la luminosidad y conservando tono y saturación.

`success` es teal `#0d9488`, deliberadamente distinto del verde de marca.

---

## Tipografía

**Manrope** (Google Fonts), cargada en `_document.tsx`.

Coincide con el sitio público de AudioColors **y** con el sistema EDUS de la
CCSS (`ccss.sa.cr/appedus`), que usa la misma familia.

---

## Assets

| Archivo | Qué es |
|---|---|
| `public/logo-audiocolors.png` | Logo para fondo claro ("audio" gris), 1400px |
| `public/logo-audiocolors-dark.png` | Para fondo oscuro ("audio" blanco) |
| `public/favicon-{16,32,180}.png`, `favicon.ico` | La oreja sola, rojo, transparente |

Proporción del logo: **2.49:1**. El componente `BrandLogo` recibe solo la
altura y calcula el ancho.

---

## Fuente de verdad

`D:\Documentos\audio colors\docs audio colors\AUDIOCOLORS LOGO Y VARIANTES.ai`

Es un PDF con **24 variantes vectoriales**. Se lee con PyMuPDF (`import fitz`),
disponible en el entorno.

| Página | Variante |
|---|---|
| 0 | Logo a color, fondo claro ← **el que se usa** |
| 1 | Con tagline "ESPECIALIDADES AUDIOLÓGICAS" |
| 4 | Isotipo: oreja + 6 puntos ← **base del favicon** |
| 5 | Isotipo alternativo "AC" |
| 12 | Logo a color, fondo oscuro ← **variante dark** |

Las 24 se pueden inspeccionar generando una hoja de contacto (ver script abajo).

---

## Regenerar los assets

**La clave:** renderizar **sin alfa** sobre fondo opaco y derivar la
transparencia de la distancia al fondo. Renderizar con alfa directamente produce
píxeles de color basura (`rgb(0,255,0)` con alfa 1-4) que ensucian los bordes y
dan aspecto lavado.

```python
import fitz
from PIL import Image

AI = r'D:\Documentos\audio colors\docs audio colors\AUDIOCOLORS LOGO Y VARIANTES.ai'
doc = fitz.open(AI)

def build_logo(page_index, out_path, dark_variant=False, target_w=1400):
    pix = doc[page_index].get_pixmap(matrix=fitz.Matrix(8, 8), alpha=False)
    img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    px = img.load()
    bg = (26, 26, 46) if dark_variant else (255, 255, 255)

    def dist(r, g, b):
        return max(abs(r - bg[0]), abs(g - bg[1]), abs(b - bg[2]))

    w, h = img.size
    min_x, min_y, max_x, max_y = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            if dist(*px[x, y]) > 24:
                min_x, max_x = min(min_x, x), max(max_x, x)
                min_y, max_y = min(min_y, y), max(max_y, y)

    cropped = img.crop((min_x, min_y, max_x + 1, max_y + 1))
    cp = cropped.load()
    out = Image.new('RGBA', cropped.size, (0, 0, 0, 0))
    op = out.load()

    for y in range(cropped.height):
        for x in range(cropped.width):
            r, g, b = cp[x, y]
            d = dist(r, g, b)
            if d <= 10:
                continue
            op[x, y] = (r, g, b, 255 if d > 45 else round(255 * (d - 10) / 35))

    final = out.crop(out.getbbox())
    ratio = target_w / final.width
    final.resize((target_w, round(final.height * ratio)), Image.LANCZOS).save(
        out_path, optimize=True)

build_logo(0,  'public/logo-audiocolors.png')
build_logo(12, 'public/logo-audiocolors-dark.png', dark_variant=True)
```

Para el favicon: extraer la página 4, separar la oreja de los puntos buscando el
hueco vertical (>40px sin tinta), teñirla de `#e41e1e` y generar 16/32/180 + ico
con fondo transparente.

Hoja de contacto de las 24 variantes:

```python
cols, rows, thumb = 6, 4, 220
sheet = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, cols*thumb, rows*thumb), False)
sheet.clear_with(230)
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(thumb/500, thumb/500), alpha=False)
    pix.set_origin((i % cols) * thumb, (i // cols) * thumb)
    sheet.copy(pix, pix.irect)
sheet.save('contact-sheet.png')
```

---

## Material adicional disponible

En `D:\Documentos\audio colors\v2` hay fotografía profesional: equipo
(Matthew y María), laboratorio, audífonos, baterías, recetas y las sedes
(Neily, Quepos, Río Claro). Útil si se necesita imaginería más adelante.

**No usar** `bg-audio-colors.jpeg` como fondo a pantalla completa: está
comprimida a 0.029 bytes/píxel (un JPEG decente ronda 0.15–0.30) y se ve blanda
al ampliarla.

---

## Datos de contacto públicos

Teléfono `+506 8871-3657` · Instagram `@audiocolors_` · Facebook `AudioColors`.

Presentes en el landing; **no** en el back-office, que es interno.
