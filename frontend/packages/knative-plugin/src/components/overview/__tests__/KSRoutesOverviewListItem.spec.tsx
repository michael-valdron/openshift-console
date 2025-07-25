import * as React from 'react';
import { ListItem } from '@patternfly/react-core';
import { shallow, ShallowWrapper } from 'enzyme';
import * as _ from 'lodash';
import { ResourceLink, ExternalLinkWithCopy } from '@console/internal/components/utils';
import { referenceForModel } from '@console/internal/module/k8s';
import { RouteModel } from '../../../models';
import { MockKnativeResources } from '../../../topology/__tests__/topology-knative-test-data';
import KSRoutesOverviewListItem from '../KSRoutesOverviewListItem';

type KSRoutesOverviewListItemProps = React.ComponentProps<typeof KSRoutesOverviewListItem>;

describe('KSRoutesOverviewListItem', () => {
  let wrapper: ShallowWrapper<KSRoutesOverviewListItemProps>;
  beforeEach(() => {
    const [ksroute] = MockKnativeResources.ksroutes.data;
    wrapper = shallow(<KSRoutesOverviewListItem ksroute={ksroute} />);
  });

  it('should list the Route', () => {
    expect(wrapper.find(ListItem)).toHaveLength(1);
  });

  it('should have ResourceLink with proper kind', () => {
    expect(wrapper.find(ResourceLink)).toHaveLength(1);
    expect(wrapper.find(ResourceLink).at(0).props().kind).toEqual(referenceForModel(RouteModel));
  });

  it('should have route ExternalLink with proper href', () => {
    expect(wrapper.find(ExternalLinkWithCopy)).toHaveLength(1);
    expect(wrapper.find(ExternalLinkWithCopy).at(0).props().href).toEqual(
      'http://overlayimage.knativeapps.apps.bpetersen-june-23.devcluster.openshift.com',
    );
    expect(wrapper.find(ExternalLinkWithCopy).at(0).props().text).toEqual(
      'http://overlayimage.knativeapps.apps.bpetersen-june-23.devcluster.openshift.com',
    );
  });

  it('should not show the route url if it is not available', () => {
    const ksroute = { ...MockKnativeResources.ksroutes.data[0], status: { url: '' } };
    wrapper.setProps({ ksroute });
    expect(wrapper.find(ResourceLink)).toHaveLength(1);
    expect(wrapper.find(ExternalLinkWithCopy)).toHaveLength(0);
  });

  it('should have ResourceLink with proper kind and not external link if status is not preset on route', () => {
    const ksroute = _.omit(MockKnativeResources.ksroutes.data[0], 'status');
    wrapper.setProps({ ksroute });
    expect(wrapper.find(ResourceLink).exists()).toBe(true);
    expect(wrapper.find(ResourceLink).at(0).props().kind).toEqual(referenceForModel(RouteModel));
    expect(wrapper.find(ExternalLinkWithCopy).exists()).toBe(false);
  });
});
