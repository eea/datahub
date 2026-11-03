import { HttpEvent, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { catchError, filter, map, Observable, of, switchMap } from 'rxjs';

interface DateRange {
  gte?: string;
  lte?: string;
}

interface IndexedDataset {
  format?: string[];
  publicationDateForResource?: string[];
  resourceTemporalExtentDateRange?: DateRange[];
}

interface MockedFeature {
  id: string;
  time?: { interval?: (string | null)[] };
  properties: Record<string, unknown>;
}

interface SearchResponse {
  hits?: { hits?: { _id: string; _source: IndexedDataset }[] };
}

const INDEXED_FIELDS = ['format', 'publicationDateForResource', 'resourceTemporalExtentDateRange'];

const searchUrl = (itemsUrl: string): string =>
  itemsUrl.replace(/\/ogcapi-records\/.*$/, '/srv/api/search/records/_search');

const earliest = (dates: string[]): string | null =>
  dates.reduce<string | null>((min, date) => (min === null || date < min ? date : min), null);

const latest = (dates: string[]): string | null =>
  dates.reduce<string | null>((max, date) => (max === null || date > max ? date : max), null);

const extent = (ranges: DateRange[] = []): MockedFeature['time'] => {
  const [start, end] = [
    earliest(ranges.flatMap((range) => range.gte ?? [])),
    latest(ranges.flatMap((range) => range.lte ?? [])),
  ];
  return start || end ? { interval: [start, end] } : undefined;
};

const withIndexedFields = (feature: MockedFeature, indexed?: IndexedDataset): MockedFeature =>
  indexed
    ? {
        ...feature,
        time: extent(indexed.resourceTemporalExtentDateRange),
        properties: {
          ...feature.properties,
          formats: (indexed.format ?? []).map((name) => ({ name })),
          publicationDateForResource: indexed.publicationDateForResource,
        },
      }
    : feature;

const indexedDatasets = (
  request: HttpRequest<unknown>,
  ids: string[],
  next: (request: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>,
): Observable<Record<string, IndexedDataset>> =>
  next(
    new HttpRequest('POST', searchUrl(request.url), {
      size: ids.length,
      query: { ids: { values: ids } },
      _source: INDEXED_FIELDS,
    }),
  ).pipe(
    filter((event): event is HttpResponse<SearchResponse> => event instanceof HttpResponse),
    map(({ body }) =>
      Object.fromEntries((body?.hits?.hits ?? []).map((hit) => [hit._id, hit._source])),
    ),
    catchError(() => of({})),
  );

export const mockDatasetFields: HttpInterceptorFn = (request, next) => {
  const ids = request.params.get('ids')?.split(',');
  if (!ids) return next(request);
  return next(request).pipe(
    switchMap((event) => {
      if (!(event instanceof HttpResponse)) return of(event);
      const body = event.body as { features?: MockedFeature[] } | null;
      return indexedDatasets(request, ids, next).pipe(
        map((indexed) =>
          event.clone({
            body: {
              ...body,
              features: (body?.features ?? []).map((feature) =>
                withIndexedFields(feature, indexed[feature.id]),
              ),
            },
          }),
        ),
      );
    }),
  );
};
