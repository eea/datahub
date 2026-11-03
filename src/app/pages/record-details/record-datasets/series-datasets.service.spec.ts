import { TestBed } from '@angular/core/testing';
import { BASE_PATH, RecordsService } from '@geocat/frontend-api-client';
import { COLLECTION_ID } from '@geocat/frontend-library';
import { firstValueFrom, of } from 'rxjs';

import { SeriesDatasetsService } from './series-datasets.service';

describe('SeriesDatasetsService', () => {
  const getRecords = vi.fn();
  let service: SeriesDatasetsService;

  const feature = (id: string, overrides: Record<string, unknown> = {}) => ({
    id,
    type: 'Feature',
    properties: { title: `Dataset ${id}` },
    links: [],
    ...overrides,
  });

  const respondWith = (...features: object[]) =>
    getRecords.mockReturnValue(of({ type: 'FeatureCollection', features }));

  const requestedIds = (call: number): string[] => getRecords.mock.calls[call][8].split(',');

  beforeEach(() => {
    getRecords.mockReset();
    TestBed.configureTestingModule({
      providers: [
        { provide: RecordsService, useValue: { getRecords } },
        { provide: COLLECTION_ID, useValue: 'collection' },
        { provide: BASE_PATH, useValue: '/catalogue' },
      ],
    });
    service = TestBed.inject(SeriesDatasetsService);
  });

  it('asks for each dataset once', async () => {
    respondWith();

    await firstValueFrom(service.datasets(['a', 'b', 'a']));

    expect(getRecords).toHaveBeenCalledTimes(1);
    expect(requestedIds(0)).toEqual(['a', 'b']);
  });

  it('splits long id lists over several requests', async () => {
    respondWith();
    const ids = Array.from({ length: 150 }, (_, i) => `id-${i}`);

    await firstValueFrom(service.datasets(ids));

    expect(getRecords).toHaveBeenCalledTimes(2);
    expect(requestedIds(0)).toHaveLength(100);
    expect(requestedIds(1)).toHaveLength(50);
  });

  it('makes no request for a series without datasets', async () => {
    expect(await firstValueFrom(service.datasets([]))).toEqual([]);
    expect(getRecords).not.toHaveBeenCalled();
  });

  it('marks superseded and obsolete datasets as superseded', async () => {
    respondWith(
      feature('current', { properties: { title: 'Current', status: ['completed'] } }),
      feature('old', { properties: { title: 'Old', status: ['superseded'] } }),
      feature('gone', { properties: { title: 'Gone', status: ['obsolete'] } }),
    );

    const datasets = await firstValueFrom(service.datasets(['current', 'old', 'gone']));

    expect(datasets.map(({ id, superseded }) => ({ id, superseded }))).toEqual([
      { id: 'current', superseded: false },
      { id: 'old', superseded: true },
      { id: 'gone', superseded: true },
    ]);
  });

  it('reads the formats, publication date and temporal coverage', async () => {
    respondWith(
      feature('a', {
        time: { interval: ['2017-01-01T00:00Z', '2019-12-31T00:00Z'] },
        properties: {
          title: 'Urban Atlas 2018',
          formats: [{ name: 'SHP' }, { name: 'GeoTIFF' }, { name: 'SHP' }],
          publicationDateForResource: ['2020-05-06'],
        },
      }),
    );

    const [dataset] = await firstValueFrom(service.datasets(['a']));

    expect(dataset).toMatchObject({
      title: 'Urban Atlas 2018',
      formats: ['SHP', 'GeoTIFF'],
      published: '2020-05-06',
      startYear: 2017,
      endYear: 2019,
      factsheetUrl:
        '/catalogue/srv/api/records/a/formatters/xsl-view?output=pdf&language=eng&approved=true',
    });
  });

  it('keeps downloads and links apart and leaves out services and folder paths', async () => {
    respondWith(
      feature('a', {
        links: [
          { rel: 'enclosure', type: 'WWW:URL', title: 'Direct download', href: 'https://a/zip' },
          { rel: 'related', type: 'DOI', title: 'DOI', href: 'https://doi.org/10.2909/a' },
          { rel: 'related', type: 'WWW:LINK', title: 'Viewer', href: 'https://a/viewer' },
          { rel: 'related', type: 'OGC:WMS', href: 'https://a/wms' },
          { rel: 'related', type: 'ESRI:REST', href: 'https://a/rest' },
          { rel: 'related', type: 'EEA:FOLDERPATH', href: 'https://a/webdav' },
          { rel: 'related', type: 'EEA:DBPG', href: 'pg:gis_sdi/table' },
          { rel: 'self', type: 'application/json', href: 'https://a/self' },
        ],
      }),
    );

    const [dataset] = await firstValueFrom(service.datasets(['a']));

    expect(dataset.downloads).toEqual([
      { href: 'https://a/zip', title: 'Direct download', isDoi: false },
    ]);
    expect(dataset.links).toEqual([
      { href: 'https://doi.org/10.2909/a', title: 'DOI', isDoi: true },
      { href: 'https://a/viewer', title: 'Viewer', isDoi: false },
    ]);
  });
});
