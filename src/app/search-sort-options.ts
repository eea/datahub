import { SearchSortOption } from '@geocat/frontend-library';

export const SEARCH_SORT_OPTIONS_LIST: readonly SearchSortOption[] = [
  { value: 'relevance', labelKey: 'find.searchResults.sort.relevance' },
  { value: 'popularity', labelKey: 'find.searchResults.sort.popularity', sortby: '-popularity' },
  {
    value: 'title-asc',
    labelKey: 'find.searchResults.sort.titleAsc',
    sortby: 'resourceTitleObject',
  },
  {
    value: 'title-desc',
    labelKey: 'find.searchResults.sort.titleDesc',
    sortby: '-resourceTitleObject',
  },
  { value: 'date-asc', labelKey: 'find.searchResults.sort.dateOldest', sortby: 'issued' },
  { value: 'date-desc', labelKey: 'find.searchResults.sort.dateNewest', sortby: '-issued' },
];
