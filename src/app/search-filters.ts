import { SearchFilter } from '@geocat/frontend-library';

export const SEARCH_FILTERS_LIST: readonly SearchFilter[] = [
  {
    kind: 'terms',
    key: 'eeaTopics',
    labelKey: 'find.searchResults.filters.eeaTopics',
    field: 'eeaTopics',
    placement: 'primary',
  },
  {
    kind: 'terms',
    key: 'format',
    labelKey: 'find.searchResults.filters.format',
    field: 'format',
    placement: 'more',
  },
  {
    kind: 'terms',
    key: 'organization',
    labelKey: 'find.searchResults.filters.organization',
    field: 'orgForResource',
    placement: 'more',
  },
  {
    kind: 'terms',
    key: 'spatialRepresentationType',
    labelKey: 'find.searchResults.filters.spatialRepresentationType',
    field: 'spatialRepresentationType',
    placement: 'more',
  },
];
