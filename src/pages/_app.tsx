import React, { useEffect, useState } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ACCESS_REFRESHED_EVENT } from '@/shared/api/api-service-client';
import { SESSION_QUERY_KEY } from '@/hooks/use-session';
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

  useEffect(() => {
    const refreshSession = () => {
      void queryClient.invalidateQueries({ queryKey: [SESSION_QUERY_KEY] });
    };
    window.addEventListener(ACCESS_REFRESHED_EVENT, refreshSession);
    return () => window.removeEventListener(ACCESS_REFRESHED_EVENT, refreshSession);
  }, [queryClient]);

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
        <Toaster position="bottom-right" richColors closeButton duration={4000} />
      </QueryClientProvider>
    </>
  );
};

export default MyApp;
