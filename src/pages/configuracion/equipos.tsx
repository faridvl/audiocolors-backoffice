import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { EquipmentSettingsContainer } from '@/components/containers/equipment-settings/equipment-settings-container';
import { SettingsLayout } from '@/components/containers/settings/settings-layout';
import { SettingsSection } from '@/components/containers/settings/settings-sections';
import { authorizeServerSidePage } from '@/hocs/auth';
import { TEXT } from '@/static/texts/i18n';

export default function EquipmentSettingsPage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t(TEXT.SETTINGS.EQUIPMENT.PAGE_TITLE)}</title>
      </Head>

      <SettingsLayout section={SettingsSection.EQUIPMENT}>
        <EquipmentSettingsContainer />
      </SettingsLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
