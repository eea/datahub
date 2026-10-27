import { TestBed } from '@angular/core/testing';
import { RecordsService } from '@geocat/frontend-api-client';
import { COLLECTION_ID } from '@geocat/frontend-library';
import { firstValueFrom, of } from 'rxjs';

import { BusinessDomainService } from './business-domain.service';

describe('BusinessDomainService', () => {
  const getRecords = vi.fn();
  const service = () => TestBed.inject(BusinessDomainService);

  beforeEach(() => {
    getRecords.mockReset();
    TestBed.configureTestingModule({
      providers: [
        { provide: RecordsService, useValue: { getRecords } },
        { provide: COLLECTION_ID, useValue: 'collection' },
      ],
    });
  });

  it('asks for the business domain facet of series only', async () => {
    getRecords.mockReturnValue(of({ features: [] }));

    await firstValueFrom(service().domains());

    expect(getRecords).toHaveBeenCalledWith(
      'collection',
      undefined,
      undefined,
      '1',
      '0',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "resourceType = 'series'",
      undefined,
      undefined,
      undefined,
      'eeaBusinessDomain',
      'body',
      false,
      { httpHeaderAccept: 'application/json' },
    );
  });

  it('groups the subdomain buckets under their domain, both sorted by name', async () => {
    getRecords.mockReturnValue(
      of({
        features: [],
        facets: {
          eeaBusinessDomain: {
            buckets: [
              { value: 'Water', count: 3 },
              { value: 'Water^Snow & Ice', count: 1 },
              { value: 'Air', count: 4 },
              { value: 'Water^Floods & Droughts', count: 2 },
              { value: 'Air^Noise', count: 4 },
            ],
          },
        },
      }),
    );

    expect(await firstValueFrom(service().domains())).toEqual([
      { name: 'Air', subdomains: [{ name: 'Noise', path: 'Air^Noise', seriesCount: 4 }] },
      {
        name: 'Water',
        subdomains: [
          { name: 'Floods & Droughts', path: 'Water^Floods & Droughts', seriesCount: 2 },
          { name: 'Snow & Ice', path: 'Water^Snow & Ice', seriesCount: 1 },
        ],
      },
    ]);
  });

  it('has no domains when the backend does not serve the facet', async () => {
    getRecords.mockReturnValue(of({ features: [], facets: {} }));

    expect(await firstValueFrom(service().domains())).toEqual([]);
  });

  it('lists every series of a subdomain by its full path, sorted by title', async () => {
    getRecords.mockReturnValue(
      of({
        features: [
          { id: 'a', properties: { title: 'Lake ice phenology' } },
          { id: 'b', properties: {} },
        ],
      }),
    );

    const series = await firstValueFrom(
      service().series({ name: 'Snow & Ice', path: 'Water^Snow & Ice', seriesCount: 2 }),
    );

    expect(series).toEqual([
      { id: 'a', title: 'Lake ice phenology' },
      { id: 'b', title: 'b' },
    ]);
    expect(getRecords).toHaveBeenCalledWith(
      'collection',
      undefined,
      undefined,
      '2',
      '0',
      undefined,
      undefined,
      undefined,
      undefined,
      'resourceTitleObject',
      "resourceType = 'series' AND eeaBusinessDomain = 'Water^Snow & Ice'",
      undefined,
      undefined,
      undefined,
      '',
      'body',
      false,
      { httpHeaderAccept: 'application/json' },
    );
  });

  it('escapes quotes in the path of a subdomain', async () => {
    getRecords.mockReturnValue(of({ features: [] }));

    await firstValueFrom(
      service().series({ name: "Europe's air", path: "Air^Europe's air", seriesCount: 1 }),
    );

    expect(getRecords).toHaveBeenCalledWith(
      'collection',
      undefined,
      undefined,
      '1',
      '0',
      undefined,
      undefined,
      undefined,
      undefined,
      'resourceTitleObject',
      "resourceType = 'series' AND eeaBusinessDomain = 'Air^Europe''s air'",
      undefined,
      undefined,
      undefined,
      '',
      'body',
      false,
      { httpHeaderAccept: 'application/json' },
    );
  });
});
