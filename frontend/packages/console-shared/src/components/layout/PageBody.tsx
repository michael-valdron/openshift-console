import * as React from 'react';
import { Flex } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';

const PageBody: React.FC<PageBodyProps> = ({ children, className, ...props }) => {
  return (
    <Flex
      className={css('co-m-page__body', className)}
      direction={{ default: 'column' }}
      rowGap={{ default: 'rowGapNone' }}
      flexWrap={{ default: 'nowrap' }}
      style={{ flex: '1 0 auto' }}
      {...props}
    >
      {children}
    </Flex>
  );
};

export type PageBodyProps = {
  children: React.ReactNode;
  className?: string;
};

export default PageBody;
