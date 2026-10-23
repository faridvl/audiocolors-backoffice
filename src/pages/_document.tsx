import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

interface MyDocumentProps {
  isDev: boolean;
}

/**
 * El apple-touch-icon (el que usa iOS al "Agregar a inicio") y el manifest
 * cambian segun el host: dev-backoffice.audiocolors.com lleva fondo distinto
 * al de produccion, para no confundir cual PWA se abrio. Mismo patron que
 * magastore-backoffice.
 */
class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    const host = ctx.req?.headers.host ?? '';
    const isDev = host.includes('dev-backoffice') || host.includes('localhost') || host.includes('127.0.0.1');
    return { ...initialProps, isDev };
  }

  render() {
    const iconSuffix = this.props.isDev ? '-dev' : '';
    /** Azul de la R (produccion) vs casi negro (desarrollo) — BRAND.md. */
    const themeColor = this.props.isDev ? '#0a0a0a' : '#1f6fb1';

    /**
     * Splash screen de iOS al abrir la PWA desde pantalla de inicio. Sin un
     * <link rel="apple-touch-startup-image"> explicito por tamano, iOS Safari
     * no genera uno confiable a partir del manifest y cae a pantalla negra.
     * device-width/device-height van en CSS px (no en los px reales del PNG).
     * El fondo de la variante -dev es casi negro #0a0a0a, igual que
     * theme-color y el manifest: el morado de marca es tambien el color de
     * la "S" del wordmark y sobre si mismo pierde contraste — BRAND.md.
     */
    const splashSizes = [
      { width: 1290, height: 2796, cssWidth: 430, cssHeight: 932, dpr: 3 },
      { width: 1179, height: 2556, cssWidth: 393, cssHeight: 852, dpr: 3 },
      { width: 1170, height: 2532, cssWidth: 390, cssHeight: 844, dpr: 3 },
      { width: 750, height: 1334, cssWidth: 375, cssHeight: 667, dpr: 2 },
    ];

    return (
      <Html lang="es">
        <Head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
          <link rel="apple-touch-icon" sizes="180x180" href={`/apple-touch-icon${iconSuffix}.png`} />
          <link rel="manifest" href="/api/site.webmanifest" />
          <meta name="theme-color" content={themeColor} />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content={this.props.isDev ? '[DEV] AudioColors' : 'AudioColors'} />

          {splashSizes.map(({ width, height, cssWidth, cssHeight, dpr }) => (
            <link
              key={`${width}x${height}`}
              rel="apple-touch-startup-image"
              href={`/splash-${width}x${height}${iconSuffix}.png`}
              media={`(device-width: ${cssWidth}px) and (device-height: ${cssHeight}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)`}
            />
          ))}

          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
