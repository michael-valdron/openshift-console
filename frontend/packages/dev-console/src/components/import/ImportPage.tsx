import * as React from 'react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom-v5-compat';
import { Firehose, FirehoseResource } from '@console/internal/components/utils';
import { ImageStreamModel, ProjectModel } from '@console/internal/models';
import DevPreviewBadge from '@console/shared/src/components/badges/DevPreviewBadge';
import { DocumentTitle } from '@console/shared/src/components/document-title/DocumentTitle';
import { PageHeading } from '@console/shared/src/components/heading/PageHeading';
import { QUERY_PROPERTIES } from '../../const';
import NamespacedPage, { NamespacedPageVariants } from '../NamespacedPage';
import QueryFocusApplication from '../QueryFocusApplication';
import { ImportTypes, ImportData } from './import-types';
import ImportForm from './ImportForm';

const ImportFlows = (t: TFunction): { [name: string]: ImportData } => ({
  git: {
    type: ImportTypes.git,
    title: t('devconsole~Import from Git'),
    buildStrategy: 'Devfile',
    loader: () =>
      import('./GitImportForm' /* webpackChunkName: "git-import-form" */).then((m) => m.default),
  },
  s2i: {
    type: ImportTypes.s2i,
    title: t('devconsole~Create Source-to-Image application'),
    buildStrategy: 'Source',
    loader: () =>
      import('./SourceToImageForm' /* webpackChunkName: "source-to-image-form" */).then(
        (m) => m.default,
      ),
  },
});

const ImportPage: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const { ns: namespace } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const imageStreamName = searchParams.get('imagestream');
  const imageStreamNamespace = searchParams.get('imagestream-ns');
  const preselectedNamespace = searchParams.get('preselected-ns');
  const importType = searchParams.get('importType');

  let importData: ImportData;
  let resources: FirehoseResource[];
  if (imageStreamName && imageStreamNamespace) {
    importData = ImportFlows(t).s2i;
    resources = [
      {
        kind: ImageStreamModel.kind,
        prop: 'imageStreams',
        isList: false,
        name: imageStreamName,
        namespace: imageStreamNamespace,
      },
      {
        kind: ProjectModel.kind,
        prop: 'projects',
        isList: true,
      },
    ];
  } else {
    importData = ImportFlows(t).git;
    resources = [
      {
        kind: ImageStreamModel.kind,
        prop: 'imageStreams',
        isList: true,
        namespace: 'openshift',
      },
      {
        kind: ProjectModel.kind,
        prop: 'projects',
        isList: true,
      },
    ];
  }

  return (
    <QueryFocusApplication>
      {(application) => (
        <NamespacedPage disabled variant={NamespacedPageVariants.light}>
          <DocumentTitle>{importData.title}</DocumentTitle>
          <PageHeading
            title={importData.title}
            badge={importType === ImportTypes.devfile ? <DevPreviewBadge /> : null}
          />
          <Firehose resources={resources}>
            <ImportForm
              forApplication={application}
              contextualSource={searchParams.get(QUERY_PROPERTIES.CONTEXT_SOURCE)}
              namespace={namespace || preselectedNamespace}
              importData={importData}
            />
          </Firehose>
        </NamespacedPage>
      )}
    </QueryFocusApplication>
  );
};

export default ImportPage;
