import { Alert } from '@patternfly/react-core';
import { shallow } from 'enzyme';
import * as rbacModule from '@console/internal/components/utils/rbac';
import { sampleDeployments } from '../../../utils/__tests__/test-resource-data';
import HealthChecksAlert from '../HealthChecksAlert';

jest.mock('@console/shared/src/hooks/useUserSettingsCompatibility', () => ({
  useUserSettingsCompatibility: () => [[], jest.fn(), true],
}));

describe('HealthChecksAlert', () => {
  const spyUseAccessReview = jest.spyOn(rbacModule, 'useAccessReview');
  it('should show alert when health check probes not present', () => {
    spyUseAccessReview.mockReturnValue(true);
    const wrapper = shallow(<HealthChecksAlert resource={sampleDeployments.data[1]} />);
    expect(wrapper.find(Alert).exists()).toBe(true);
  });

  it('should not show alert when health check probes present', () => {
    spyUseAccessReview.mockReturnValue(true);
    const wrapper = shallow(<HealthChecksAlert resource={sampleDeployments.data[2]} />);
    expect(wrapper.find(Alert).exists()).toBe(false);
  });
  it('should not show alert when user has only view access', () => {
    spyUseAccessReview.mockReturnValue(false);
    const wrapper = shallow(<HealthChecksAlert resource={sampleDeployments.data[1]} />);
    expect(wrapper.find(Alert).exists()).toBe(false);
  });
});
