import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/common/layout/app-layout';
import { ProfileContainer } from '@/components/containers/profile/profile-container';
import { authorizeServerSidePage } from '@/hocs/auth';
import { TEXT } from '@/static/texts/i18n';

export default function ProfilePage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t(TEXT.PROFILE.PAGE_TITLE)}</title>
      </Head>

      <AppLayout title={t(TEXT.PROFILE.TITLE)} isTitleVisibleOnMobile>
        <ProfileContainer />
      </AppLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
