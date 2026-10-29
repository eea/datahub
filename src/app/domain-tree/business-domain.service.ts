import { inject, Injectable } from '@angular/core';
import { OgcApiRecordsGetRecords200ResponseDto, RecordsService } from '@geocat/frontend-api-client';
import { COLLECTION_ID } from '@geocat/frontend-library';
import { map, Observable, of } from 'rxjs';

import { SUBDOMAINS_BY_DOMAIN } from './business-domains';

const LEVEL_SEPARATOR = '^';
const SERIES_FILTER = "resourceType = 'series'";
const BUSINESS_DOMAIN_SCHEME = 'external.theme.eea-business-domains';
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

const BUSINESS_DOMAINS: BusinessDomain[] = Object.entries(SUBDOMAINS_BY_DOMAIN).map(
  ([domain, subdomains]) => ({
    name: domain,
    subdomains: subdomains.map((name) => ({ name, path: `${domain}${LEVEL_SEPARATOR}${name}` })),
  }),
);

const escapeCql = (value: string): string => value.replace(/'/g, "''");

@Injectable({ providedIn: 'root' })
export class BusinessDomainService {
  private readonly recordsApi = inject(RecordsService);
  private readonly collectionId = inject(COLLECTION_ID);

  domains(): Observable<BusinessDomain[]> {
    return of(BUSINESS_DOMAINS);
  }

  series(subdomain: Subdomain): Observable<SeriesLink[]> {
    return this.getRecords(`${SERIES_FILTER} AND keywords = '${escapeCql(subdomain.name)}'`).pipe(
      map((response) =>
        response.features
          .filter((record) =>
            (record.properties.themes ?? []).some(
              (theme) =>
                theme.scheme.endsWith(BUSINESS_DOMAIN_SCHEME) &&
                theme.concepts.some((concept) => concept.id === subdomain.name),
            ),
          )
          .map((record) => ({ id: record.id, title: record.properties.title ?? record.id })),
      ),
    );
  }

  private getRecords(filter: string): Observable<OgcApiRecordsGetRecords200ResponseDto> {
    return this.recordsApi
      .getRecords(
        this.collectionId,
        undefined,
        undefined,
        String(SERIES_PAGE_SIZE),
        '0',
        undefined,
        undefined,
        undefined,
        undefined,
        'resourceTitleObject',
        filter,
        undefined,
        undefined,
        undefined,
        '',
        'body',
        false,
        { httpHeaderAccept: 'application/json' },
      )
      .pipe(map((response) => response as OgcApiRecordsGetRecords200ResponseDto));
  }
}
