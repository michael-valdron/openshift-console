import * as React from 'react';
import { Button, Flex, List, ListItem, Modal, ModalBody, ModalHeader, Spinner} from '@patternfly/react-core';
import {
  DocumentTitle,
  K8sResourceCommon,
  useK8sWatchResource,
  useModal,
} from '@openshift-console/dynamic-plugin-sdk';
import './modal.scss';
import { useTranslation } from 'react-i18next';

export const scResource = {
  kind: 'StorageClass',
  namespaced: false,
  isList: true,
};

export const TestModal: React.FC<{ closeModal: () => void }> = (props) => {
  const [res] = useK8sWatchResource<K8sResourceCommon[]>(scResource);
  const { t } = useTranslation("plugin__console-demo-plugin");
  return (
    <Modal
      isOpen
      onClose={props?.closeModal}
    >
      <ModalHeader title={t('Storage Classes')} />
      <ModalBody>
        {t('StorageClasses present in this cluster:')}
        <List>
          {!!res &&
            res.map((item) => <ListItem key={item.metadata.uid}>{item.metadata.name}</ListItem>)}
        </List>
      </ModalBody>
    </Modal>
  );
};

const LoadingComponent: React.FC = () => {
  const { t } = useTranslation("plugin__console-demo-plugin");

  return (
    <Flex
      className="demo-modal__loader"
      alignItems={{ default: 'alignItemsCenter' }}
      justifyContent={{ default: 'justifyContentCenter' }}
      grow={{ default: 'grow' }}
    >
      <Spinner size="xl" aria-label={t('Component is resolving')} />
    </Flex>
  );
};

export const TestModalPage: React.FC<{ closeComponent: any }> = () => {
  const launchModal = useModal();
  const { t } = useTranslation("plugin__console-demo-plugin");

  const TestComponent = ({ closeModal, ...rest }) => (
    <TestModal closeModal={closeModal} {...rest} />
  );

  const Component = React.lazy(() =>
    Promise.all([import('./ModalPage')]).then(([m]) => ({
      default: m.TestModal,
    })),
  );

  const AsyncTestComponent = ({ closeModal, ...rest }) => {
    return (
      <React.Suspense fallback={LoadingComponent}>
        <Component closeModal={closeModal} {...rest} />
      </React.Suspense>
    );
  };

  const onClick = React.useCallback(() => launchModal(TestComponent, {}), [launchModal]);
  const onAsyncClick = React.useCallback(() => launchModal(AsyncTestComponent, {}), [launchModal]);

  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      justifyContent={{ default: 'justifyContentCenter' }}
      grow={{ default: 'grow' }}
      direction={{ default: 'column' }}
      className="demo-modal__page"
    >
      <DocumentTitle>{t('Modal Launchers')}</DocumentTitle>
      <Button onClick={onClick}>{t('Launch Modal')}</Button>
      <Button onClick={onAsyncClick}>
        {t('Launch Modal Asynchronously')}
      </Button>
    </Flex>
  );
};
