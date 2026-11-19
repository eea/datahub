export interface RecordTime {
  interval?: (string | null)[];
}

export interface YearRange {
  start: number;
  end: number;
}

const yearOf = (date: string | null | undefined): number | undefined => {
  const year = date ? new Date(date).getUTCFullYear() : NaN;
  return Number.isNaN(year) ? undefined : year;
};

export const yearRange = (time: RecordTime | undefined): YearRange | undefined => {
  const [from, to] = (time?.interval ?? []).map(yearOf);
  const [start, end] = [from ?? to, to ?? from];
  return start === undefined || end === undefined ? undefined : { start, end };
};

export const formatYearRange = ({ start, end }: YearRange): string =>
  start === end ? `${start}` : `${start}–${end}`;
