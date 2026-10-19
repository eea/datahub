import { SearchParams } from '@geocat/frontend-library';

export const seriesOnly = (params: SearchParams): SearchParams => ({
  ...params,
  resourceTypes: { included: ['series'] },
});
