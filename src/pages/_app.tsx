import React, { useState } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import '@/styles/globals.css';

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
        <title>AudioColors · Expedientes</title>
        <meta
          name="description"
          content="Sistema de expedientes y archivos de pacientes de AudioColors."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f97316" />
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
