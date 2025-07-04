import * as React from 'react';
import { DescriptionList, Grid, GridItem } from '@patternfly/react-core';
import * as _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom-v5-compat';
import { useActivePerspective } from '@console/dynamic-plugin-sdk';
import { Conditions } from '@console/internal/components/conditions';
import { DetailsPage } from '@console/internal/components/factory';
import { PodsPage } from '@console/internal/components/pod';
import {
  ContainerTable,
  DetailsItem,
  ResourceSummary,
  SectionHeading,
  navFactory,
} from '@console/internal/components/utils';
import { useK8sWatchResource } from '@console/internal/components/utils/k8s-watch-hook';
import { K8sResourceKind, referenceForModel, K8sKind } from '@console/internal/module/k8s';
import {
  ActionMenu,
  ActionMenuVariant,
  ActionServiceProvider,
  useTabbedTableBreadcrumbsFor,
} from '@console/shared';
import PaneBody from '@console/shared/src/components/layout/PaneBody';
import { ExternalLink } from '@console/shared/src/components/links/ExternalLink';
import { RevisionModel, RouteModel } from '../../models';
import { isServerlessFunction } from '../../topology/knative-topology-utils';
import { RevisionKind, ServiceKind, ServiceTypeValue } from '../../types';
import { serverlessTab } from '../../utils/serverless-tab-utils';
import { KnativeServiceTypeContext } from '../functions/ServiceTypeContext';
import RevisionsOverviewList from '../overview/RevisionsOverviewList';
import RevisionsPage from '../revisions/RevisionsPage';
import RoutesPage from '../routes/RoutesPage';

type FunctionsPodsProps = {
  obj: K8sResourceKind;
};

const ServiceDetails: React.FC<{ obj: ServiceKind }> = ({ obj }) => {
  const { t } = useTranslation();
  const [revisions, revisionLoaded, revisionErrorLoad] = useK8sWatchResource<RevisionKind[]>({
    kind: referenceForModel(RevisionModel),
    namespace: obj.metadata.namespace,
    isList: true,
    selector: { matchLabels: { 'serving.knative.dev/service': obj.metadata.name } },
  });

  return (
    <>
      <PaneBody>
        <SectionHeading text={t('knative-plugin~Details')} />
        <Grid hasGutter>
          <GridItem md={6}>
            <ResourceSummary
              resource={obj}
              podSelector="spec.podSelector"
              showNodeSelector={false}
            />
          </GridItem>
          <GridItem md={6}>
            <DescriptionList>
              {isServerlessFunction(obj) && (
                <DetailsItem label={t('knative-plugin~Type')} obj={obj}>
                  {t('knative-plugin~Function')}
                </DetailsItem>
              )}
              {obj?.status?.url && (
                <DetailsItem label={t('knative-plugin~URL')} obj={obj} path="status.url">
                  <ExternalLink href={obj.status.url} displayBlock text={obj.status.url} />
                </DetailsItem>
              )}
              {revisions && revisionLoaded && !revisionErrorLoad && (
                <DetailsItem label={t('knative-plugin~Revisions')} obj={obj} path="status.traffic">
                  <RevisionsOverviewList revisions={revisions} service={obj} hideSectionHeading />
                </DetailsItem>
              )}
            </DescriptionList>
          </GridItem>
        </Grid>
      </PaneBody>
      <PaneBody>
        <SectionHeading text={t('knative-plugin~Containers')} />
        <ContainerTable containers={obj.spec.template.spec.containers} />
      </PaneBody>
      {_.isArray(obj?.status?.conditions) && (
        <PaneBody>
          <SectionHeading text={t('knative-plugin~Conditions')} />
          <Conditions conditions={obj.status.conditions} />
        </PaneBody>
      )}
    </>
  );
};

const FunctionsPods: React.FC<FunctionsPodsProps> = ({ obj }) => (
  <PodsPage
    showTitle={false}
    selector={{ matchLabels: { 'serving.knative.dev/service': obj.metadata.name } }}
    showNamespaceOverride
    canCreate={false}
    namespace={obj.metadata.namespace}
  />
);

const ServiceDetailsPage: React.FC<React.ComponentProps<typeof DetailsPage>> = (props) => {
  const { t } = useTranslation();
  const serviceTypeValue = React.useContext(KnativeServiceTypeContext);
  const { kindObj } = props;
  const params = useParams();
  const location = useLocation();
  const isAdminPerspective = useActivePerspective()[0] === 'admin';
  const pages = [
    navFactory.details(ServiceDetails),
    navFactory.editYaml(),
    {
      href: RevisionModel.plural,
      // t('knative-plugin~Revisions')
      nameKey: 'knative-plugin~Revisions',
      component: RevisionsPage,
      pageData: {
        kind: referenceForModel(RevisionModel),
        namespace: params.ns,
        showTitle: false,
        name: '',
      },
    },
    {
      href: RouteModel.plural,
      // t('knative-plugin~Routes')
      nameKey: 'knative-plugin~Routes',
      component: RoutesPage,
      pageData: {
        kind: referenceForModel(RouteModel),
        namespace: params.ns,
        showTitle: false,
        name: '',
      },
    },
    navFactory.pods(FunctionsPods),
  ];
  const actionMenu = (kindObjData: K8sKind, obj: K8sResourceKind) => {
    const resourceKind = referenceForModel(kindObjData);
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
  const breadcrumbs = useTabbedTableBreadcrumbsFor(
    kindObj,
    location,
    params,
    serviceTypeValue === ServiceTypeValue.Function ? 'functions' : 'serving',
    serverlessTab(kindObj.kind),
    serviceTypeValue === ServiceTypeValue.Function ? t('knative-plugin~Functions') : undefined,
    serviceTypeValue === ServiceTypeValue.Function ? true : isAdminPerspective,
    serviceTypeValue === ServiceTypeValue.Function ? t('knative-plugin~Function') : undefined,
  );
  return (
    <DetailsPage
      {...props}
      breadcrumbsFor={() => breadcrumbs}
      pages={pages}
      customActionMenu={actionMenu}
      customData={{ selectResourcesForName: params.name }}
    />
  );
};

export default ServiceDetailsPage;
