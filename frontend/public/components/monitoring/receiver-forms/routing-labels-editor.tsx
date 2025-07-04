import * as _ from 'lodash-es';
import { Trans, useTranslation } from 'react-i18next';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import { Button, Grid, GridItem, Tooltip } from '@patternfly/react-core';
import { ExternalLink } from '@console/shared/src/components/links/ExternalLink';
import { SectionHeading } from '../../utils';

const DEFAULT_RECEIVER_LABEL = 'All (default receiver)';

const hasDuplicateNames = (labels: string[]): boolean => {
  return labels.length !== _.uniq(labels).length;
};

export const RoutingLabelEditor = ({ formValues, dispatchFormChange, isDefaultReceiver }) => {
  const setRouteLabel = (path: number, v: string): void => {
    const labels = _.clone(formValues.routeLabels);
    labels.splice(path, 1, v);
    dispatchFormChange({
      type: 'setFormValues',
      payload: {
        routeLabels: labels,
        routeLabelDuplicateNamesError: hasDuplicateNames(labels),
      },
    });
  };

  const onRoutingLabelChange = (path: number): ((e) => void) => {
    return (e) => setRouteLabel(path, e.target.value);
  };

  const addRoutingLabel = (): void => {
    setRouteLabel(formValues.routeLabels.length, '');
  };

  const removeRoutingLabel = (i: number): void => {
    const labels = _.clone(formValues.routeLabels);
    labels.splice(i, 1);
    dispatchFormChange({
      type: 'setFormValues',
      payload: {
        routeLabels: labels,
        routeLabelDuplicateNamesError: hasDuplicateNames(labels),
      },
    });
  };

  const { t } = useTranslation();

  return (
    <div data-test-id="receiver-routing-labels-editor" className="form-group">
      <SectionHeading text={t('public~Routing labels')} required={!isDefaultReceiver} />
      <p className="pf-v6-u-mb-md">
        <Trans ns="public">
          Firing alerts with labels that match all of these{' '}
          <ExternalLink
            href="https://prometheus.io/docs/alerting/latest/configuration/#matcher"
            text={t('public~matchers')}
          />{' '}
          will be sent to this receiver.
        </Trans>
      </p>
      {isDefaultReceiver && (
        <Grid hasGutter className="form-group" key="default">
          <GridItem span={10}>
            <div className="form-group">
              <span className="pf-v6-c-form-control pf-m-disabled">
                <input
                  type="text"
                  data-test-id="label-default"
                  value={DEFAULT_RECEIVER_LABEL}
                  disabled
                  required
                />
              </span>
            </div>
          </GridItem>
        </Grid>
      )}
      {_.map(formValues.routeLabels, (routeLabel, i: number) => {
        return (
          <Grid hasGutter className="form-group" key={i}>
            <GridItem span={10}>
              <div className="form-group">
                <span className="pf-v6-c-form-control">
                  <input
                    type="text"
                    data-test-id={`label-${i}`}
                    onChange={onRoutingLabelChange(i)}
                    placeholder={t('public~Matcher')}
                    value={routeLabel}
                    required
                  />
                </span>
              </div>
            </GridItem>
            <GridItem span={2}>
              <Tooltip content={t('public~Remove')}>
                <Button
                  icon={<MinusCircleIcon />}
                  type="button"
                  onClick={() => removeRoutingLabel(i)}
                  aria-label={t('public~Remove')}
                  isDisabled={!isDefaultReceiver && formValues.routeLabels.length <= 1}
                  variant="plain"
                  data-test-id="remove-routing-label"
                />
              </Tooltip>
            </GridItem>
          </Grid>
        );
      })}
      {formValues.routeLabelDuplicateNamesError && (
        <div className="form-group co-routing-label-editor__error-message">
          <span className="help-block">
            <span data-test-id="duplicate-label-error" className="co-error">
              {t('public~Routing label names must be unique.')}
            </span>
          </span>
        </div>
      )}
      {!isDefaultReceiver && (
        <Button
          icon={<PlusCircleIcon className="co-icon-space-r" />}
          className="pf-m-link--align-left"
          onClick={addRoutingLabel}
          type="button"
          variant="link"
          data-test-id="add-routing-label"
        >
          {t('public~Add label')}
        </Button>
      )}
    </div>
  );
};
