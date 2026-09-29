import React, { useState } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import '@/styles/globals.css';
import '@/shared/i18n/i18n';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <>
      <Head>
        <title>AudioColors · Gestión Clínica</title>
        <meta
          name="description"
          content="Sistema de expedientes y archivos de pacientes de AudioColors."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
        <Toaster position="top-right" richColors closeButton duration={4000} />
      </QueryClientProvider>
    </>
  );
};

export default MyApp;
