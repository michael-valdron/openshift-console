import * as _ from 'lodash-es';
import * as React from 'react';
import { Alert, AlertGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { LoadingInline } from './status-box';

const injectDisabled = (children, disabled) => {
  return React.Children.map(children, (c) => {
    if (!_.isObject(c) || c.type !== 'button') {
      return c;
    }

    return React.cloneElement(c, { disabled: c.props.disabled || disabled });
  });
};

const ErrorMessage = ({ message }) => {
  const { t } = useTranslation();
  return (
    <Alert
      isInline
      className="co-alert co-alert--scrollable"
      variant="danger"
      title={t('public~An error occurred')}
      data-test="alert-error"
    >
      <div className="co-pre-line">{message}</div>
    </Alert>
  );
};
const InfoMessage = ({ message }) => (
  <Alert
    isInline
    className="co-alert"
    variant="info"
    title={message}
    data-test="button-bar-info-message"
  />
);
const SuccessMessage = ({ message }) => (
  <Alert isInline className="co-alert" variant="success" title={message} />
);

export interface ButtonBarProps extends Required<React.PropsWithChildren<{}>> {
  className?: string;
  errorMessage?: React.ReactNode;
  infoMessage?: string;
  successMessage?: string;
  inProgress?: boolean;
}

// NOTE: DO NOT use <a> elements within a ButtonBar.
// They don't support the disabled attribute, and therefore
// can't be disabled during a pending promise/request.
export const ButtonBar: React.FCC<ButtonBarProps> = ({
  children,
  className,
  errorMessage,
  infoMessage,
  successMessage,
  inProgress,
}) => {
  return (
    <div className={className}>
      <AlertGroup
        isLiveRegion
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions text"
      >
        {successMessage && <SuccessMessage message={successMessage} />}
        {errorMessage && <ErrorMessage message={errorMessage} />}
        {injectDisabled(children, inProgress)}
        {inProgress && <LoadingInline />}
        {infoMessage && <InfoMessage message={infoMessage} />}
      </AlertGroup>
    </div>
  );
};
