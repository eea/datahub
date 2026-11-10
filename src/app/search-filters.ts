import { SearchFilter } from '@geocat/frontend-library';

export const SEARCH_FILTERS_LIST: readonly SearchFilter[] = [
  {
    kind: 'terms',
    key: 'format',
    labelKey: 'find.searchResults.filters.format',
    field: 'format',
    placement: 'primary',
  },
  {
    kind: 'terms',
    key: 'organization',
    labelKey: 'find.searchResults.filters.organization',
    field: 'orgForResource',
    placement: 'primary',
  },
  {
    kind: 'terms',
    key: 'spatialRepresentationType',
    labelKey: 'find.searchResults.filters.spatialRepresentationType',
    field: 'spatialRepresentationType',
    placement: 'primary',
  },
  {
    kind: 'toggle',
    key: 'includeArchived',
    labelKey: 'find.searchResults.filters.includeArchived',
    cqlWhenOff: "NOT (status = 'obsolete' OR status = 'superseded')",
  },
];
