import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { UseUtilizationDuration } from '@console/dynamic-plugin-sdk/src/api/internal-types';
import * as UIActions from '@console/internal/actions/ui';
import { RootState } from '@console/internal/redux';
import { DEFAULT_DURATION, DEFAULT_DURATION_KEY } from '../constants';

export const useUtilizationDuration: UseUtilizationDuration = (
  adjustDuration?: (duration: number) => number,
) => {
  const dispatch = useDispatch();
  const duration =
    useSelector<RootState, number>(({ UI }) => UI.getIn(['utilizationDuration', 'duration'])) ??
    DEFAULT_DURATION;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const endDate = useSelector<RootState, Date>(
    ({ UI }) => UI.getIn(['utilizationDuration', 'endDate']) ?? new Date(),
  );
  const selectedKey =
    useSelector<RootState, string>(({ UI }) => UI.getIn(['utilizationDuration', 'selectedKey'])) ??
    DEFAULT_DURATION_KEY;
  const startDate = new Date(endDate.getTime() - duration);
  const updateEndDate = React.useCallback(
    (date: Date) => date > endDate && dispatch(UIActions.setUtilizationDurationEndTime(date)),
    [dispatch, endDate],
  );
  const updateDuration = React.useCallback(
    (newDuration: number) =>
      dispatch(UIActions.setUtilizationDuration(adjustDuration?.(newDuration) ?? newDuration)),
    [adjustDuration, dispatch],
  );
  const updateSelectedKey = React.useCallback(
    (key: string) => dispatch(UIActions.setUtilizationDurationSelectedKey(key)),
    [dispatch],
  );

  return {
    duration,
    endDate,
    selectedKey,
    startDate,
    updateDuration,
    updateEndDate,
    updateSelectedKey,
  };
};
