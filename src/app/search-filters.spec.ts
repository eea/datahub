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

  LANGUAGES.forEach(([language, translations]) => {
    it(`has a ${language} label for All time and every period`, () => {
      const missing = SEARCH_FILTERS_LIST.flatMap((filter) =>
        filter.kind === 'period'
          ? [filter.allLabelKey, ...filter.periods.map((period) => period.labelKey)]
          : [],
      ).filter((key) => typeof translationOf(translations, key) !== 'string');

      expect(missing).toEqual([]);
    });
  });

  it('gives every filter its own key', () => {
    const keys = SEARCH_FILTERS_LIST.map((filter) => filter.key);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('puts EEA topics and Reporting obligations on the filter line, in that order', () => {
    const primary = SEARCH_FILTERS_LIST.filter(
      (filter) => 'placement' in filter && filter.placement === 'primary',
    ).map((filter) => filter.key);

    expect(primary).toEqual(['eeaTopics', 'reportingObligations']);
  });

  it('lists the other filters behind All filters in the order of the design', () => {
    const more = SEARCH_FILTERS_LIST.filter(
      (filter) => 'placement' in filter && filter.placement === 'more',
    ).map((filter) => filter.key);

    expect(more).toEqual([
      'format',
      'gemetKeywords',
      'organization',
      'spatialRepresentationType',
      'scales',
      'timeCoverage',
    ]);
  });

  it('starts each GEMET keyword with a capital, as the catalogue sends them in lower case', () => {
    const gemet = SEARCH_FILTERS_LIST.find((filter) => filter.key === 'gemetKeywords');
    const label = gemet?.kind === 'terms' ? gemet.label : undefined;

    expect(label?.('natural areas, landscape, ecosystems')).toBe(
      'Natural areas, landscape, ecosystems',
    );
  });
});
