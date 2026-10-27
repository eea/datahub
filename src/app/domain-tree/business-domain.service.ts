import { inject, Injectable } from '@angular/core';
import {
  OgcApiRecordsFacetResultBucketDto,
  OgcApiRecordsGetRecords200ResponseDto,
  RecordsService,
} from '@geocat/frontend-api-client';
import { COLLECTION_ID } from '@geocat/frontend-library';
import { map, Observable } from 'rxjs';

export const BUSINESS_DOMAIN_PROPERTY = 'eeaBusinessDomain';
export const LEVEL_SEPARATOR = '^';

const SERIES_FILTER = "resourceType = 'series'";
const FACETS_ONLY_PAGE_SIZE = 1;

export interface Subdomain {
  name: string;
  path: string;
  seriesCount: number;
}

export interface BusinessDomain {
  name: string;
  subdomains: Subdomain[];
}

export interface SeriesLink {
  id: string;
  title: string;
}

type SubdomainBucket = OgcApiRecordsFacetResultBucketDto & { value: string };

const byName = (a: { name: string }, b: { name: string }): number => a.name.localeCompare(b.name);

const escapeCql = (value: string): string => value.replace(/'/g, "''");

const domainOf = (path: string): string => path.slice(0, path.indexOf(LEVEL_SEPARATOR));

const toSubdomain = ({ value, count }: SubdomainBucket): Subdomain => ({
  name: value.slice(value.indexOf(LEVEL_SEPARATOR) + LEVEL_SEPARATOR.length),
  path: value,
  seriesCount: count ?? 0,
});

const toDomains = (buckets: OgcApiRecordsFacetResultBucketDto[]): BusinessDomain[] => {
  const subdomains = buckets
    .filter((bucket): bucket is SubdomainBucket => !!bucket.value?.includes(LEVEL_SEPARATOR))
    .map(toSubdomain);
  return [...new Set(subdomains.map((subdomain) => domainOf(subdomain.path)))]
    .map((name) => ({
      name,
      subdomains: subdomains.filter((subdomain) => domainOf(subdomain.path) === name).sort(byName),
    }))
    .sort(byName);
};

@Injectable({ providedIn: 'root' })
export class BusinessDomainService {
  private readonly recordsApi = inject(RecordsService);
  private readonly collectionId = inject(COLLECTION_ID);

  domains(): Observable<BusinessDomain[]> {
    return this.getRecords({
      limit: FACETS_ONLY_PAGE_SIZE,
      filter: SERIES_FILTER,
      facets: BUSINESS_DOMAIN_PROPERTY,
    }).pipe(
      map((response) => toDomains(response.facets?.[BUSINESS_DOMAIN_PROPERTY]?.buckets ?? [])),
    );
  }

  series(subdomain: Subdomain): Observable<SeriesLink[]> {
    return this.getRecords({
      limit: subdomain.seriesCount,
      filter: `${SERIES_FILTER} AND ${BUSINESS_DOMAIN_PROPERTY} = '${escapeCql(subdomain.path)}'`,
      sortby: 'resourceTitleObject',
      facets: '',
    }).pipe(
      map((response) =>
        response.features.map((record) => ({
          id: record.id,
          title: record.properties.title ?? record.id,
        })),
      ),
    );
  }

  private getRecords(request: {
    limit: number;
    filter: string;
    sortby?: string;
    facets: string;
  }): Observable<OgcApiRecordsGetRecords200ResponseDto> {
    return this.recordsApi
      .getRecords(
        this.collectionId,
        undefined,
        undefined,
        String(request.limit),
        '0',
        undefined,
        undefined,
        undefined,
        undefined,
        request.sortby,
        request.filter,
        undefined,
        undefined,
        undefined,
        request.facets,
        'body',
        false,
        { httpHeaderAccept: 'application/json' },
      )
      .pipe(map((response) => response as OgcApiRecordsGetRecords200ResponseDto));
  }
}
