import { useMemo } from 'react';
import { CheckIconConfig, CopyIconConfig, PlayIconConfig } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { getSvgFromPfIconConfig } from '@console/shared/src/utils/icon-utils';
import useCloudShellAvailable from '@console/webterminal-plugin/src/components/cloud-shell/useCloudShellAvailable';
import { MARKDOWN_COPY_BUTTON_ID, MARKDOWN_EXECUTE_BUTTON_ID, MARKDOWN_SNIPPET_ID } from './const';
import './showdown-extension.scss';

const useInlineExecuteCommandShowdownExtension = () => {
  const { t } = useTranslation();
  const showExecuteButton = useCloudShellAvailable();
  return useMemo(
    () => ({
      type: 'lang',
      regex: /`([^`](.*?)[^`])`{{execute}}/g,
      replace: (
        text: string,
        group: string,
        subGroup: string,
        groupType: string,
        groupId: string,
      ): string => {
        if (!group || !subGroup || !groupType || !groupId) return text;
        return `<div class="pf-v6-c-code-block">
        <div class="pf-v6-c-code-block__header">
          <div class="pf-v6-c-code-block__actions">
            <div class="pf-v6-c-code-block__actions-item">
              <button class="pf-v6-c-button pf-m-plain" type="button" aria-label="${t(
                'console-shared~Copy to clipboard',
              )}" ${MARKDOWN_COPY_BUTTON_ID}="${groupType}">
                ${getSvgFromPfIconConfig(CopyIconConfig)}
              </button>
            </div>
            ${
              showExecuteButton
                ? `<div class="pf-v6-c-code-block__actions-item ocs-markdown-execute-snippet__action">
                <button class="pf-v6-c-button pf-m-plain ocs-markdown-execute-snippet__button" type="button" aria-label="${t(
                  'console-shared~Run in Web Terminal',
                )}" ${MARKDOWN_EXECUTE_BUTTON_ID}="${groupType}">
                  ${getSvgFromPfIconConfig(PlayIconConfig)}
                  ${getSvgFromPfIconConfig(CheckIconConfig)}
                </button>
              </div>`
                : ''
            }
          </div>
        </div>
        <div class="pf-v6-c-code-block__content">
          <pre class="pf-v6-c-code-block__pre pfext-code-block__pre">
            <code class="pf-v6-c-code-block__code" ${MARKDOWN_SNIPPET_ID}="${groupType}">${group.trim()}</code>
          </pre>
        </div>
      </div>`;
      },
    }),
    [showExecuteButton, t],
  );
};

export default useInlineExecuteCommandShowdownExtension;
