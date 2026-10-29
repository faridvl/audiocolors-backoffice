import { GetServerSideProps } from 'next';
import { authorizeServerSidePage } from '@/hocs/auth';
import { routesPrivate } from '@/shared/navigation/routes';

// La sección pasó a llamarse Preguntas: se conserva la URL vieja por los enlaces guardados.
export default function ClinicalHistoryRedirectPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const guardResult = await authorizeServerSidePage()(context);
  if ('redirect' in guardResult) return guardResult;

  return {
    redirect: {
      destination: routesPrivate.settings.questions,
      permanent: false,
    },
  };
};
