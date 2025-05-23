import { checkErrors, testName } from '../../support';
import { detailsPage } from '../../views/details-page';
import { guidedTour } from '../../views/guided-tour';
import { listPage } from '../../views/list-page';
import * as yamlEditor from '../../views/yaml-editor';

const POD_NAME = `pod1`;
const CONTAINER_NAME = `container1`;
const XTERM_CLASS = `[class="xterm-viewport"]`;
const podToDebug = `apiVersion: v1
kind: Pod
metadata:
  name: ${POD_NAME}
spec:
  securityContext:
    runAsNonRoot: true
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: ${CONTAINER_NAME}
      image: quay.io/fedora/fedora
      securityContext:
        allowPrivilegeEscalation: false
        capabilities:
          drop:
          - ALL
  restartPolicy: Always`;

describe('Debug pod', () => {
  before(() => {
    cy.login();
    guidedTour.close();
    cy.createProjectWithCLI(testName);
  });

  afterEach(() => {
    checkErrors();
  });

  after(() => {
    cy.visit('/');
    cy.deleteProjectWithCLI(testName);
  });

  it('Create pod that has crashbackloop error', () => {
    cy.visit(`/k8s/ns/${testName}/import`);
    yamlEditor.isImportLoaded();
    yamlEditor.setEditorContent(podToDebug).then(() => {
      yamlEditor.clickSaveCreateButton();
      cy.byTestID('yaml-error').should('not.exist');
      detailsPage.sectionHeaderShouldExist('Pod details');
    });
  });

  it('Opens debug terminal page from Logs subsection', () => {
    cy.visit(`/k8s/ns/${testName}/pods`);
    listPage.rows.shouldExist(POD_NAME);
    cy.visit(`/k8s/ns/${testName}/pods/${POD_NAME}`);
    detailsPage.isLoaded();
    detailsPage.selectTab('Logs');
    detailsPage.isLoaded();
    cy.byTestID('debug-container-link').click();
    listPage.titleShouldHaveText(`Debug ${CONTAINER_NAME}`);
    cy.get(XTERM_CLASS).should('exist');
  });

  it('Opens debug terminal page from Pod Details - Status tool tip', () => {
    cy.visit(`/k8s/ns/${testName}/pods/${POD_NAME}`);
    detailsPage.isLoaded();
    cy.byTestID('popover-status-button').click();
    cy.byTestID(`popup-debug-container-link-${CONTAINER_NAME}`).click();
    listPage.titleShouldHaveText(`Debug ${CONTAINER_NAME}`);
    cy.get(XTERM_CLASS).should('exist');
  });

  it('Opens debug terminal page from Pods Page - Status tool tip', () => {
    cy.visit(`/k8s/ns/${testName}/pods`);
    listPage.rows.shouldExist(POD_NAME);
    listPage.rows.clickStatusButton(POD_NAME);
    // Click on first debug link
    cy.byTestID(`popup-debug-container-link-${CONTAINER_NAME}`).click();
    listPage.titleShouldHaveText(`Debug ${CONTAINER_NAME}`);
    cy.get(XTERM_CLASS).should('exist');
  });
});
