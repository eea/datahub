import { SearchFilter } from '@geocat/frontend-library';

const SCALE = 'resolutionScaleDenominator';

export const EEA_TOPICS = 'eeaTopics';

export const SEARCH_FILTERS_LIST: readonly SearchFilter[] = [
  {
    kind: 'terms',
    key: EEA_TOPICS,
    labelKey: 'find.searchResults.filters.eeaTopics',
    field: 'eeaTopics',
    placement: 'primary',
  },
  {
    kind: 'terms',
    key: 'reportingObligations',
    labelKey: 'find.searchResults.filters.reportingObligations',
    field: 'reportingObligations',
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
    key: 'gemetKeywords',
    labelKey: 'find.searchResults.filters.gemetKeywords',
    field: 'gemetKeywords',
    placement: 'more',
    label: (value) => value.charAt(0).toUpperCase() + value.slice(1),
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
  {
    kind: 'choices',
    key: 'scales',
    labelKey: 'find.searchResults.filters.scales',
    placement: 'more',
    countFacet: 'resolutionScaleDenominatorRanges',
    choices: [
      {
        value: '1_upTo100000',
        label: '*-100,000',
        cql: `${SCALE} < 100000`,
      },
      {
        value: '2_100000to1000000',
        label: '100,000-1,000,000',
        cql: `(${SCALE} >= 100000 AND ${SCALE} < 1000000)`,
      },
      {
        value: '3_1000000to10000000',
        label: '1,000,000-10,000,000',
        cql: `(${SCALE} >= 1000000 AND ${SCALE} < 10000000)`,
      },
      {
        value: '4_above10000000',
        label: '10,000,000-*',
        cql: `${SCALE} >= 10000000`,
      },
    ],
  },
  {
    kind: 'yearRange',
    key: 'timeCoverage',
    labelKey: 'find.searchResults.filters.timeCoverage',
    placement: 'more',
    facet: 'temporalExtent',
    minYear: 1985,
  },
  {
    kind: 'period',
    key: 'period',
    labelKey: 'find.searchResults.filters.period',
    field: 'issued',
    allLabelKey: 'find.searchResults.period.allTime',
    periods: [
      { value: 'lastWeek', labelKey: 'find.searchResults.period.lastWeek', days: 7 },
      { value: 'lastMonth', labelKey: 'find.searchResults.period.lastMonth', months: 1 },
      { value: 'last3Months', labelKey: 'find.searchResults.period.last3Months', months: 3 },
      { value: 'lastYear', labelKey: 'find.searchResults.period.lastYear', months: 12 },
      { value: 'last2Years', labelKey: 'find.searchResults.period.last2Years', months: 24 },
    ],
  },
  {
    kind: 'toggle',
    key: 'includeArchived',
    labelKey: 'find.searchResults.filters.includeArchived',
    cqlWhenOff: "NOT (status = 'obsolete' OR status = 'superseded')",
  },
];
