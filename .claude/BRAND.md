# BRAND.md

Identidad de AudioColors y cómo regenerar los assets.

---

## Colores

**Fuente de verdad: el manual de marca** (`Audio Colors Manual de Marca.pdf`,
página "PALETA DE COLORES"), no valores estimados a ojo ni medidos por
píxeles de un JPEG. Una primera versión los estimó a ojo y los seis estaban
mal; una segunda los midió contando píxeles y quedaron cerca pero no exactos
del manual oficial.

| Letra | Hex | Rol |
|---|---|---|
| Oreja (C) | `#e3211e` | rojo — color de la "C" en el wordmark. El isotipo suelto (oreja + puntos) lleva la oreja en gris/negro o blanco, no en este rojo — ver "Assets" |
| O | `#ef7f2b` | naranja |
| L | `#ffce33` | amarillo |
| O | `#66b335` | verde |
| **R** | **`#1f6fb1`** | **azul — color de acento del sistema** |
| S | `#613f90` | morado |

El manual también define dos colores fuera de las letras de "COLORS":
`#5b5d5c` (gris del texto "audio" en el logo sobre fondo claro) y `#ffffff`
(blanco). El gris de marca no está tokenizado aparte — la interfaz usa la
escala `ink` (neutros) para texto y superficies.

Viven en `src/shared/design/tokens.ts` → `BRAND_COLORS`, y alimentan la franja.

La escala `brand-50…900` de `tailwind.config.js` se derivó del azul `#1f6fb1`
variando la luminosidad y conservando tono y saturación.

El azul oscuro de fondo de la variante dark del logo (token `midnight`) es
`#181d37` según el manual (antes se usaba `#1a1a2e`, estimado a ojo).

`success` es teal `#0d9488`, deliberadamente distinto del verde de marca.

---

## Tipografía

**Fira Sans** (Google Fonts), cargada en `_document.tsx`. Es la tipografía de
texto que especifica el manual de marca oficial.

El manual también define **Champagne & Limousines** para el logo/wordmark
("audio COLORS"), pero esa es la fuente del isotipo vectorial, no una
tipografía de interfaz — no se carga en la app.

Antes se usaba Manrope (coincide con el sitio público de AudioColors y con el
sistema EDUS de la CCSS), pero el manual oficial no la especifica.

---

## Assets

| Archivo | Qué es |
|---|---|
| `public/logo-audiocolors.png` | Logo para fondo claro ("audio" gris), 1400px |
| `public/logo-audiocolors-dark.png` | Para fondo oscuro ("audio" blanco) |
| `public/favicon-{16,32,180}.png`, `favicon.ico` | Isotipo reducido: **solo la oreja** (sin puntos), gris oscuro `#1e1e1e`, fondo transparente. Único, sin sufijo dev/prod |
| `public/apple-touch-icon.png` (512×512), `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` | Isotipo completo (oreja + 6 puntos), variante **positivo**: oreja gris oscuro, fondo blanco `#ffffff` — producción |
| `public/apple-touch-icon-dev.png` (512×512), `icon-192-dev.png`, `icon-512-dev.png`, `icon-512-dev-maskable.png` | Isotipo completo, variante **negativo**: oreja blanca, fondo navy `#181d37` — desarrollo |
| `public/splash-{1290x2796,1179x2556,1170x2532,750x1334}.png` | Splash screen de iOS al abrir la PWA desde pantalla de inicio (producción) — fondo blanco `#ffffff`, wordmark a color |
| `public/splash-{1290x2796,1179x2556,1170x2532,750x1334}-dev.png` | Mismos 4 tamaños, variante desarrollo — fondo casi negro `#0a0a0a`, wordmark a color completo (`logo-audiocolors-dark.png`: "audio" blanco + COLORS con sus 6 colores de marca) |

Proporción del logo (wordmark completo): **2.49:1**. El componente `BrandLogo`
recibe solo la altura y calcula el ancho.

### Splash screens de iOS

Sin un `<link rel="apple-touch-startup-image">` explícito por tamaño de
pantalla, iOS Safari no genera un splash confiable a partir del
`background_color` del manifest — muchas versiones caen a pantalla negra. Se
declaran a mano en `_document.tsx`, un `<link>` por tamaño con `media` query
(`device-width`/`device-height` en **CSS px**, no en los px reales del PNG,
más `-webkit-device-pixel-ratio` y `orientation: portrait`), eligiendo sufijo
`-dev` igual que `iconSuffix` para el `apple-touch-icon`.

Cuatro tamaños cubiertos (los iPhone modernos más comunes en uso, portrait
únicamente — no se cubre iPad ni landscape):

| Archivo (px reales) | Dispositivo | CSS px @ DPR |
|---|---|---|
| `1290x2796` | 16/15/14 Pro Max | 430×932 @3x |
| `1179x2556` | 16/15/14 Pro | 393×852 @3x |
| `1170x2532` | 16/15/14/13 | 390×844 @3x |
| `750x1334` | SE/8/7 | 375×667 @2x |

Composición de cada splash, de arriba a abajo:

1. Franja de 6 colores en el borde superior — la misma paleta y orden que
   `RainbowStripe` (rojo, naranja, amarillo, verde, azul, morado), a todo el
   ancho, grosor ~0.7% de la altura.
2. Wordmark "audio COLORS" centrado, **50% del ancho** de la pantalla (grande
   y protagonista, no un elemento chico perdido en el centro).
3. "GESTIÓN CLÍNICA" debajo, versalitas con tracking moderado — mismo patrón
   que el label bajo el logo en el sidebar y el login (`Typography` variante
   `HELPER`, `uppercase`), pero con tamaño de fuente (~4.8% del ancho) y
   tracking (10% del tamaño de fuente) ajustados para seguir siendo legible
   reducido en pantalla de celular — el tracking amplio de la interfaz de
   escritorio (`tracking-[0.2em]`) se vuelve manchas ilegibles a esta escala.
   En las 8 variantes.
4. "Ambiente de pruebas" debajo de eso, más chico (~3.4% del ancho) y
   discreto (blanco semitransparente) — **solo** en las 4 variantes `-dev`.

**Por qué fondo `#0a0a0a` (casi negro) en dev y no el morado que se usaba
antes:** el morado `#613f90` es también el color de la "S" del wordmark —
usarlo de fondo hace que esa letra se funda y pierda contraste (se verificó
renderizando: la S se veía "lavada"). El casi-negro es neutro, tiene
contraste de sobra con las 6 letras de marca (se midió: distancia mínima
~144 con la S, el resto por encima de 177) y no compite con ninguna. Se usa
`#0a0a0a` en vez de negro puro `#000000` por preferencia estética (menos
duro en pantalla, mismo criterio que otras marcas). El wordmark en esta
variante **sí conserva sus colores reales** (`logo-audiocolors-dark.png`:
"audio" blanco + COLORS a color) — sobre `#0a0a0a` todas las letras
contrastan bien, a diferencia de sobre morado.

Este mismo `#0a0a0a` es ahora el color de "modo desarrollo" en toda la app,
no solo en el splash: `theme-color` (meta tag de `_document.tsx`), el
`theme_color`/`background_color` del manifest PWA (`site.webmanifest.ts`) y
el token `dev-accent` de `tailwind.config.js` — todos alineados para que el
morado deje de aparecer como fondo en ningún lado.

### El isotipo (oreja + 6 puntos)

Según el manual de marca oficial (`Audio Colors Manual de Marca.pdf`, págs.
2-5, "VARIANTES DEL LOGO"), el isotipo para usar sin el wordmark es la oreja
**más una fila de 6 puntos de colores debajo** — no la oreja sola. La oreja
va en gris oscuro/negro sólido (no rojo: el rojo `#e3211e` es solo el color
de la "C" cuando forma parte del wordmark "audio COLORS" completo). Los 6
puntos llevan siempre los mismos hex de la paleta, en ambas variantes de
fondo:

`#e3211e` `#ef7f2b` `#ffce33` `#66b335` `#1f6fb1` `#613f90`

Dos variantes de fondo (iguales en ambas, solo cambia oreja y fondo):

- **Positivo** (producción): oreja gris oscuro, fondo blanco `#ffffff`.
- **Negativo** (desarrollo): oreja blanca, fondo navy `#181d37`.

El favicon de pestaña del navegador (`favicon-16/32/180.png`, `favicon.ico`)
es distinto: **solo la oreja, sin los 6 puntos** — a 16-32px los puntos se
comprimen a un par de píxeles cada uno y se vuelven ruido de color sin forma
reconocible, no información (se verificó renderizando y mirando el resultado
antes de decidir esto). Va en gris oscuro sólido sobre fondo transparente,
única para ambos entornos — el fondo casi siempre lo da la pestaña del
navegador, que es clara en la gran mayoría de temas.

---

## Fuente de verdad

`D:\Documentos\audio colors\docs audio colors\AUDIOCOLORS LOGO Y VARIANTES.ai`

Es un PDF con **24 variantes vectoriales**. Se lee con PyMuPDF (`import fitz`),
disponible en el entorno.

| Página | Variante |
|---|---|
| 0 | Logo a color, fondo claro ← **el que se usa** |
| 1 | Con tagline "ESPECIALIDADES AUDIOLÓGICAS" |
| 4 | Isotipo oreja + 6 puntos, positivo (oreja gris, fondo blanco) ← **base del isotipo y del favicon** |
| 5 | Isotipo alternativo "AC" (no se usa) |
| 12 | Logo a color, fondo oscuro ← **variante dark** |
| 16 | Isotipo oreja + 6 puntos, negativo (oreja blanca, fondo navy `#181d37`) ← **variante dev del isotipo** |

La hoja de contacto tiene 4 filas × 6 columnas (24 páginas, índice = fila×6 +
columna): fila 0 color/fondo claro, fila 1 monocromo, fila 2 sobre navy, fila
3 sobre negro. El isotipo oreja+puntos es la columna 4 de cada fila.

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
    bg = (24, 29, 55) if dark_variant else (255, 255, 255)

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

### Isotipo (oreja + 6 puntos) y favicon de pestaña

La página 4 (positivo) y la 16 (negativo) del `.ai` **ya traen el isotipo
completo coloreado** — la oreja en gris/blanco sólido y los 6 puntos con sus
hex de marca — así que no hace falta pintar nada a mano, solo separarlos y
retintar con los hex oficiales del manual (más fiables que el valor con
antialiasing del render).

Procedimiento:

1. Renderizar la página **sin alfa** sobre el fondo opaco correspondiente
   (blanco para la 4, navy `(24,29,55)` para la 16), igual que `build_logo`.
2. Encontrar el hueco vertical entre la oreja y la fila de puntos: recorrer
   filas de píxeles, marcar cuáles tienen tinta (distancia al fondo > 24) y
   ubicar el gap más grande entre dos filas con tinta. En el archivo actual
   el gap ronda 200px (a 10x de escala) entre oreja y puntos.
3. Construir la máscara alfa de cada región por distancia al fondo (mismo
   criterio que `build_logo`: `alpha=0` si `d<=10`, `alpha=255` si `d>=45`,
   interpolado entre medio) y teñir la oreja de gris oscuro `(30,30,30)`
   (positivo) o blanco (negativo).
4. Para los puntos: recortar la tira inferior a su propio bbox, encontrar las
   6 columnas por huecos horizontales sin tinta (`split_dots`), y re-teñir
   cada una con su hex de `DOT_COLORS = ['#e3211e','#ef7f2b','#ffce33',
   '#66b335','#1f6fb1','#613f90']` en orden, preservando el alfa original de
   cada píxel (no reemplazar RGB con alfa=0).
5. Componer oreja + puntos re-teñidos en un único canvas RGBA transparente,
   recortar a bbox y reescalar.

Para el **favicon de pestaña** (`favicon-16/32/180.png`, `favicon.ico`): usar
solo la región de la oreja (sin componer los puntos), teñida de gris oscuro
`#1e1e1e`, fondo transparente. Se decidió así después de renderizar el
isotipo completo a 16/32px y comprobar que los puntos se vuelven ruido de
color sin forma reconocible a ese tamaño — la oreja sola sigue siendo
legible. Para el `.ico`, pasar `sizes=[(16,16),(32,32),(48,48)]` y
`append_images` con las tres resoluciones al guardar, si no PIL solo
embebe un tamaño.

Para **apple-touch-icon / icon-192 / icon-512 / icon-512-maskable**: usar el
isotipo completo (oreja + 6 puntos), centrado sobre un canvas cuadrado,
aplanado sobre fondo opaco blanco (prod) o navy `#181d37` (dev) — estos
formatos no soportan transparencia real en la práctica (iOS y Android
rellenan con negro si el PNG trae alfa).

**`apple-touch-icon.png` / `apple-touch-icon-dev.png` se generan a 512×512,
no a 180×180** (aunque `_document.tsx` siga declarando `sizes="180x180"`,
que es el tamaño lógico de referencia de Apple — 60pt @3x — y no necesita
coincidir con el archivo real; iOS escala el PNG referenciado al tamaño que
necesite). Con solo 180px de lienzo el trazo curvo de la oreja quedaba
notoriamente escalonado al hacer zoom (pantalla de inicio, spotlight): 180px
es la resolución mínima que acepta `apple-touch-icon`, no la ideal, y
generar directo a ese tamaño deja muy pocas muestras por curva para un buen
antialiasing. La corrección: renderizar el `.ai` con supersampling **mucho
más alto** (`fitz.Matrix(16, 16)` en vez de `(8, 8)`) y luego reducir a
512×512 con `Image.LANCZOS` — el downscale desde una resolución muy alta es
lo que produce un borde sólido y liso en vez de escalonado; generar directo
al tamaño final con el mismo supersampling moderado que usan los demás
assets no alcanza para esta curva en particular. Mismo criterio de margen
(~67% del lienzo) y mismos fondos (blanco prod / navy dev) que la versión
anterior — solo cambia la resolución de salida y el supersampling de origen.
`icon-192`/`icon-512`/sus variantes maskable **no** se tocaron: ya estaban en
su tamaño de manifest PWA estándar y no mostraban el mismo problema visible.

**Margen para los no-maskable (apple-touch-icon, icon-192, icon-512):** el
isotipo debe ocupar **~65-70% del ancho/alto del lienzo**, dejando **~15-17%
de margen por lado** (contenido centrado). Una primera versión los generó al
~86% del lienzo (~7% de margen) y el resultado se veía "pegado al borde"
comparado con íconos reales de otras apps (se detectó comparando contra el
ícono de Magastore en un iPhone real, que tiene bastante aire) — iOS aplica
su propio recorte de esquina redondeada sobre el ícono cuadrado, y con tan
poco margen el contenido queda visualmente apretado contra esa curva. El
~67% usado en la práctica corresponde a redimensionar el isotipo para que su
lado mayor mida `canvas_size * 0.67` antes de centrarlo.

**Margen para los maskable (icon-512-maskable, icon-512-dev-maskable):** ya
usan la "safe zone" estándar de Android (~40% de margen total, isotipo
ocupando ~60% del lienzo) — medido y confirmado visualmente, no hace falta
tocarlos.

Verificar siempre el resultado con el chequeo de basura de bordes de la
introducción de este documento antes de reemplazar los archivos en
`public/`, y mirarlo con la herramienta Read.

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
