import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { DefaultPage } from '@console/internal/components/default-resource';

const TriggerBindingsPage = (props) => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t('pipelines-plugin~TriggerBindings')}</title>
      </Helmet>
      <DefaultPage {...props} />
    </>
  );
};

export default TriggerBindingsPage;
