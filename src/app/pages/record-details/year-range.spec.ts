import { formatYearRange, yearRange } from './year-range';

describe('yearRange', () => {
  it('reads the start and end year of an interval', () => {
    expect(yearRange({ interval: ['2020-01-01T00:00Z', '2022-12-31T00:00Z'] })).toEqual({
      start: 2020,
      end: 2022,
    });
  });

  it('uses the only year it has for an open interval', () => {
    expect(yearRange({ interval: ['2020-01-01T00:00Z'] })).toEqual({ start: 2020, end: 2020 });
    expect(yearRange({ interval: [null, '2022-12-31T00:00Z'] })).toEqual({
      start: 2022,
      end: 2022,
    });
  });

  it('has no range without a readable date', () => {
    expect(yearRange(undefined)).toBeUndefined();
    expect(yearRange({ interval: [] })).toBeUndefined();
    expect(yearRange({ interval: ['not a date', null] })).toBeUndefined();
  });
});

describe('formatYearRange', () => {
  it('joins two different years with a dash', () => {
    expect(formatYearRange({ start: 2020, end: 2022 })).toBe('2020–2022');
  });

  it('shows a single year once', () => {
    expect(formatYearRange({ start: 2018, end: 2018 })).toBe('2018');
  });
});
