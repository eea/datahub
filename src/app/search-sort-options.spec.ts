import en from '../../i18n/en.json';
import { SEARCH_SORT_OPTIONS_LIST } from './search-sort-options';
import { translationOf } from './testing/translation-of';

describe('SEARCH_SORT_OPTIONS_LIST', () => {
  it("lists the design's options in the design's order", () => {
    const labels = SEARCH_SORT_OPTIONS_LIST.map((option) => translationOf(en, option.labelKey));

    expect(labels).toEqual([
      'Relevance',
      'Most popular',
      'Title a-z',
      'Title z-a',
      'Oldest',
      'Newest',
    ]);
  });

  it('sorts Oldest and Newest on the publication date', () => {
    const sortby = (value: string) =>
      SEARCH_SORT_OPTIONS_LIST.find((option) => option.value === value)?.sortby;

    expect(sortby('date-asc')).toBe('issued');
    expect(sortby('date-desc')).toBe('-issued');
  });
});
