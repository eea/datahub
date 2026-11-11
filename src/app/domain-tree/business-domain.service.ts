import { inject, Injectable } from '@angular/core';
import { OgcApiRecordsGetRecords200ResponseDto, RecordsService } from '@geocat/frontend-api-client';
import { COLLECTION_ID } from '@geocat/frontend-library';
import { map, Observable } from 'rxjs';

const LEVEL_SEPARATOR = '^';
const SERIES_FILTER = "resourceType = 'series'";
const BUSINESS_DOMAIN = 'eeaBusinessDomain';
const SERIES_PAGE_SIZE = 100;

export interface Subdomain {
  name: string;
  path: string;
}

export interface BusinessDomain {
  name: string;
  subdomains: Subdomain[];
}

export interface SeriesLink {
  id: string;
  title: string;
}

const escapeCql = (value: string): string => value.replace(/'/g, "''");

const byName = (a: { name: string }, b: { name: string }): number => a.name.localeCompare(b.name);

const toBusinessDomains = (paths: string[]): BusinessDomain[] => {
  const subdomains = paths
    .filter((path) => path.includes(LEVEL_SEPARATOR))
    .map((path) => ({ name: path.slice(path.indexOf(LEVEL_SEPARATOR) + 1), path }));
  return paths
    .filter((path) => !path.includes(LEVEL_SEPARATOR))
    .map((name) => ({
      name,
      subdomains: subdomains
        .filter((subdomain) => subdomain.path.startsWith(`${name}${LEVEL_SEPARATOR}`))
        .sort(byName),
    }))
    .sort(byName);
};

@Injectable({ providedIn: 'root' })
export class BusinessDomainService {
  private readonly recordsApi = inject(RecordsService);
  private readonly collectionId = inject(COLLECTION_ID);

  domains(): Observable<BusinessDomain[]> {
    return this.getRecords({ limit: 1, filter: SERIES_FILTER, facets: BUSINESS_DOMAIN }).pipe(
      map((response) =>
        toBusinessDomains(
          (response.facets?.[BUSINESS_DOMAIN]?.buckets ?? []).flatMap((bucket) =>
            bucket.value ? [bucket.value] : [],
          ),
        ),
      ),
    );
  }

  series(subdomain: Subdomain): Observable<SeriesLink[]> {
    return this.getRecords({
      limit: SERIES_PAGE_SIZE,
      filter: `${SERIES_FILTER} AND ${BUSINESS_DOMAIN} = '${escapeCql(subdomain.path)}'`,
      sortby: 'resourceTitleObject',
      facets: '',
    }).pipe(
      map((response) =>
        (response.features ?? []).map((record) => ({
          id: record.id,
          title: record.properties.title ?? record.id,
        })),
      ),
    );
  }

  private getRecords(request: {
    limit: number;
    filter: string;
    facets: string;
    sortby?: string;
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
