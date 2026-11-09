import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { DocumentTemplatesContainer } from '@/components/containers/document-templates/document-templates-container';
import { SettingsLayout } from '@/components/containers/settings/settings-layout';
import { SettingsSection } from '@/components/containers/settings/settings-sections';
import { authorizeServerSidePage } from '@/hocs/auth';
import { TEXT } from '@/static/texts/i18n';

export default function DocumentTemplatesPage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t(TEXT.DOCUMENT_TEMPLATES.PAGE_TITLE)}</title>
      </Head>

      <SettingsLayout section={SettingsSection.TEMPLATES} showsDescription={false}>
        <DocumentTemplatesContainer />
      </SettingsLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
