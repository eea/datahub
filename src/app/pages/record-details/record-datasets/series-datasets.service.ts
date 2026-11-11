import { inject, Injectable } from '@angular/core';
import {
  BASE_PATH,
  OgcApiRecordsGetRecords200ResponseDto,
  OgcApiRecordsLinkDto,
  OgcApiRecordsRecordGeoJSONDto,
  RecordsService,
} from '@geocat/frontend-api-client';
import { COLLECTION_ID, DEFAULT_SPACE } from '@geocat/frontend-library';
import { forkJoin, map, Observable, of } from 'rxjs';

const IDS_PER_REQUEST = 100;
const SUPERSEDED_STATUSES = ['superseded', 'obsolete'];
const SERVICE_TYPE_PREFIXES = ['OGC:', 'ESRI:'];
const FOLDER_PATH_TYPE = 'EEA:FOLDERPATH';
const DOI_TYPE = 'DOI';

export interface DatasetLink {
  href: string;
  title?: string;
  isDoi: boolean;
}

export interface Dataset {
  id: string;
  title: string;
  formats: string[];
  published?: string;
  startYear?: number;
  endYear?: number;
  downloads: DatasetLink[];
  links: DatasetLink[];
  factsheetUrl: string;
  superseded: boolean;
}

interface DatasetProperties {
  status?: string[];
  issued?: string[];
}

interface DatasetTime {
  interval?: (string | null)[];
}

const isWebLink = (link: OgcApiRecordsLinkDto): boolean => /^https?:\/\//.test(link.href);

const isServiceLink = (link: OgcApiRecordsLinkDto): boolean =>
  SERVICE_TYPE_PREFIXES.some((prefix) => link.type?.startsWith(prefix));

const toDatasetLink = (link: OgcApiRecordsLinkDto): DatasetLink => ({
  href: link.href,
  title: link.title || undefined,
  isDoi: link.type === DOI_TYPE,
});

const yearOf = (date: string | null | undefined): number | undefined => {
  const year = date ? new Date(date).getUTCFullYear() : NaN;
  return Number.isNaN(year) ? undefined : year;
};

@Injectable({ providedIn: 'root' })
export class SeriesDatasetsService {
  private readonly recordsApi = inject(RecordsService);
  private readonly collectionId = inject(COLLECTION_ID);
  private readonly basePath = inject(BASE_PATH);

  datasets(ids: string[]): Observable<Dataset[]> {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) return of([]);

    const slices = Array.from({ length: Math.ceil(uniqueIds.length / IDS_PER_REQUEST) }, (_, i) =>
      uniqueIds.slice(i * IDS_PER_REQUEST, (i + 1) * IDS_PER_REQUEST),
    );

    return forkJoin(slices.map((slice) => this.getRecords(slice))).pipe(
      map((responses) =>
        responses
          .flatMap((response) => response.features ?? [])
          .map((record) => this.toDataset(record)),
      ),
    );
  }

  private toDataset(record: OgcApiRecordsRecordGeoJSONDto): Dataset {
    const properties = record.properties as OgcApiRecordsRecordGeoJSONDto['properties'] &
      DatasetProperties;
    const [start, end] = (record.time as DatasetTime | undefined)?.interval ?? [];
    const links = (record.links ?? []).filter(isWebLink);

    return {
      id: record.id,
      title: properties.title ?? record.id,
      formats: [...new Set((properties.formats ?? []).flatMap((format) => format.name ?? []))],
      published: properties.issued?.[0],
      startYear: yearOf(start) ?? yearOf(end),
      endYear: yearOf(end) ?? yearOf(start),
      downloads: links.filter((link) => link.rel === 'enclosure').map(toDatasetLink),
      links: links
        .filter(
          (link) =>
            link.rel === 'related' && !isServiceLink(link) && link.type !== FOLDER_PATH_TYPE,
        )
        .map(toDatasetLink),
      factsheetUrl: `${this.basePath}/${DEFAULT_SPACE}/api/records/${record.id}/formatters/xsl-view?output=pdf&language=eng&approved=true`,
      superseded: (properties.status ?? []).some((status) => SUPERSEDED_STATUSES.includes(status)),
    };
  }

  private getRecords(ids: string[]): Observable<OgcApiRecordsGetRecords200ResponseDto> {
    return this.recordsApi
      .getRecords(
        this.collectionId,
        undefined,
        undefined,
        String(ids.length),
        '0',
        undefined,
        undefined,
        undefined,
        ids.join(','),
        undefined,
        undefined,
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
