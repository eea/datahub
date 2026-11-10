import en from '../../i18n/en.json';
import fr from '../../i18n/fr.json';
import nl from '../../i18n/nl.json';
import { SEARCH_FILTERS_LIST } from './search-filters';
import { translationOf } from './testing/translation-of';

const LANGUAGES: [string, object][] = [
  ['en', en],
  ['fr', fr],
  ['nl', nl],
];

describe('SEARCH_FILTERS_LIST', () => {
  LANGUAGES.forEach(([language, translations]) => {
    it(`has a ${language} label for every filter`, () => {
      const missing = SEARCH_FILTERS_LIST.map((filter) => filter.labelKey).filter(
        (key) => typeof translationOf(translations, key) !== 'string',
      );

      expect(missing).toEqual([]);
    });
  });

  it('gives every filter its own key', () => {
    const keys = SEARCH_FILTERS_LIST.map((filter) => filter.key);

    expect(new Set(keys).size).toBe(keys.length);
  });
});
