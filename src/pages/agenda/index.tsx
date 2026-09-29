import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/common/layout/app-layout';
import { AgendaContainer } from '@/components/containers/agenda/agenda-container';
import { authorizeServerSidePage } from '@/hocs/auth';
import { TEXT } from '@/static/texts/i18n';

export default function AgendaPage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t(TEXT.AGENDA.PAGE_TITLE)}</title>
      </Head>

      <AppLayout title={t(TEXT.AGENDA.TITLE)}>
        <AgendaContainer />
      </AppLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
