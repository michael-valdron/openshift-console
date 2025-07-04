import * as _ from 'lodash-es';
import { css } from '@patternfly/react-styles';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';
import { sortable } from '@patternfly/react-table';
import {
  Status,
  LazyActionMenu,
  ActionServiceProvider,
  ActionMenu,
  ActionMenuVariant,
} from '@console/shared';
import PaneBody from '@console/shared/src/components/layout/PaneBody';
import { ResourceEventStream } from './events';
import { DetailsPage, ListPage, Table, TableData } from './factory';
import {
  ContainerTable,
  navFactory,
  SectionHeading,
  ResourceSummary,
  ResourcePodCount,
  AsyncComponent,
  Kebab,
  ResourceLink,
  resourcePath,
  OwnerReferences,
  PodsComponent,
  RuntimeClass,
} from './utils';
import { Timestamp } from '@console/shared/src/components/datetime/Timestamp';
import { referenceFor, referenceForModel } from '../module/k8s';
import { VolumesTable } from './volumes-table';
import { PodDisruptionBudgetField } from '@console/app/src/components/pdb/PodDisruptionBudgetField';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
} from '@patternfly/react-core';

const EnvironmentPage = (props) => (
  <AsyncComponent
    loader={() => import('./environment.jsx').then((c) => c.EnvironmentPage)}
    {...props}
  />
);

const envPath = ['spec', 'template', 'spec', 'containers'];
const environmentComponent = (props) => (
  <EnvironmentPage
    obj={props.obj}
    rawEnvData={props.obj.spec.template.spec}
    envPath={envPath}
    readOnly={false}
  />
);

const { details, editYaml, pods, envEditor, events } = navFactory;

const ReplicationControllerPods = (props) => <PodsComponent {...props} showNodes />;

export const ReplicationControllersDetailsPage = (props) => {
  const { t } = useTranslation();
  const Details = ({ obj: replicationController }) => {
    const revision = _.get(replicationController, [
      'metadata',
      'annotations',
      'openshift.io/deployment-config.latest-version',
    ]);
    const phase = _.get(replicationController, [
      'metadata',
      'annotations',
      'openshift.io/deployment.phase',
    ]);
    return (
      <>
        <PaneBody>
          <SectionHeading text={t('public~ReplicationController details')} />
          <Grid hasGutter>
            <GridItem md={6}>
              <ResourceSummary
                resource={replicationController}
                showPodSelector
                showNodeSelector
                showTolerations
              >
                {revision && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('public~Deployment revision')}</DescriptionListTerm>
                    <DescriptionListDescription>{revision}</DescriptionListDescription>
                  </DescriptionListGroup>
                )}
              </ResourceSummary>
            </GridItem>
            <GridItem md={6}>
              <DescriptionList>
                {phase && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('public~Phase')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <Status status={phase} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                <ResourcePodCount resource={replicationController} />
                <RuntimeClass obj={replicationController} />
                <PodDisruptionBudgetField obj={replicationController} />
              </DescriptionList>
            </GridItem>
          </Grid>
        </PaneBody>
        <PaneBody>
          <SectionHeading text={t('public~Containers')} />
          <ContainerTable containers={replicationController.spec.template.spec.containers} />
        </PaneBody>
        <PaneBody>
          <VolumesTable resource={replicationController} heading={t('public~Volumes')} />
        </PaneBody>
      </>
    );
  };

  const customActionMenu = (kindObj, obj) => {
    const resourceKind = referenceForModel(kindObj);
    const context = { [resourceKind]: obj };
    return (
      <ActionServiceProvider context={context}>
        {({ actions, options, loaded }) =>
          loaded && (
            <ActionMenu actions={actions} options={options} variant={ActionMenuVariant.DROPDOWN} />
          )
        }
      </ActionServiceProvider>
    );
  };

  return (
    <DetailsPage
      {...props}
      getResourceStatus={(resource) =>
        resource?.metadata?.annotations?.['openshift.io/deployment.phase'] || null
      }
      customActionMenu={customActionMenu}
      pages={[
        details(Details),
        editYaml(),
        pods(ReplicationControllerPods),
        envEditor(environmentComponent),
        events(ResourceEventStream),
      ]}
    />
  );
};

const kind = 'ReplicationController';

const tableColumnClasses = [
  '',
  '',
  'pf-m-hidden pf-m-visible-on-md',
  'pf-m-hidden pf-m-visible-on-lg',
  'pf-m-hidden pf-m-visible-on-lg',
  'pf-m-hidden pf-m-visible-on-xl',
  Kebab.columnClass,
];

const ReplicationControllerTableRow = ({ obj }) => {
  const { t } = useTranslation();
  const phase = obj?.metadata?.annotations?.['openshift.io/deployment.phase'];
  const resourceKind = referenceFor(obj);
  const context = { [resourceKind]: obj };

  return (
    <>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} />
      </TableData>
      <TableData className={css(tableColumnClasses[1], 'co-break-word')} columnID="namespace">
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        <Link
          to={`${resourcePath(kind, obj.metadata.name, obj.metadata.namespace)}/pods`}
          title="pods"
        >
          {t('public~{{statusReplicas}} of {{specReplicas}} pods', {
            statusReplicas: obj.status.replicas || 0,
            specReplicas: obj.spec.replicas,
          })}
        </Link>
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <Status status={phase} />
      </TableData>
      <TableData className={tableColumnClasses[4]}>
        <OwnerReferences resource={obj} />
      </TableData>
      <TableData className={tableColumnClasses[5]}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </TableData>
      <TableData className={tableColumnClasses[6]}>
        <LazyActionMenu context={context} />
      </TableData>
    </>
  );
};

export const ReplicationControllersList = (props) => {
  const { t } = useTranslation();

  const ReplicationControllerTableHeader = () => [
    {
      title: t('public~Name'),
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: t('public~Namespace'),
      sortField: 'metadata.namespace',
      transforms: [sortable],
      props: { className: tableColumnClasses[1] },
      id: 'namespace',
    },
    {
      title: t('public~Status'),
      sortFunc: 'numReplicas',
      transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: t('public~Phase'),
      sortField: 'metadata.annotations["openshift.io/deployment.phase"]',
      transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    {
      title: t('public~Owner'),
      sortField: 'metadata.ownerReferences[0].name',
      transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: t('public~Created'),
      sortField: 'metadata.creationTimestamp',
      transforms: [sortable],
      props: { className: tableColumnClasses[5] },
    },
    {
      title: '',
      props: { className: tableColumnClasses[6] },
    },
  ];

  return (
    <Table
      {...props}
      aria-label={t('public~ReplicationControllers')}
      Header={ReplicationControllerTableHeader}
      Row={ReplicationControllerTableRow}
      virtualize
    />
  );
};

export const ReplicationControllersPage = (props) => {
  const { canCreate = true } = props;
  return (
    <ListPage
      canCreate={canCreate}
      kind="ReplicationController"
      ListComponent={ReplicationControllersList}
      {...props}
    />
  );
};
