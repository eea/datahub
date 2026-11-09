import { HttpRequest, provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { COLLECTION_ID } from '@geocat/frontend-library';
import { firstValueFrom, Observable } from 'rxjs';

import { BusinessDomainService } from './business-domain.service';

describe('BusinessDomainService', () => {
  const service = () => TestBed.inject(BusinessDomainService);
  const httpMock = () => TestBed.inject(HttpTestingController);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: COLLECTION_ID, useValue: 'collection' },
      ],
    });
  });

  afterEach(() => httpMock().verify());

  const respond = <T>(call: Observable<T>, body: object) => {
    const result = firstValueFrom(call);
    const testRequest = httpMock().expectOne((candidate) =>
      candidate.url.endsWith('/collections/collection/items'),
    );
    testRequest.flush(body);
    return { request: testRequest.request, result };
  };

  const queryOf = ({ params }: HttpRequest<unknown>) =>
    Object.fromEntries(params.keys().map((key) => [key, params.get(key)]));

  const facet = (...values: string[]) => ({
    facets: {
      eeaBusinessDomain: {
        type: 'term',
        property: 'eeaBusinessDomain',
        buckets: values.map((value) => ({ value, count: 1 })),
      },
    },
  });

  const snowAndIce = { name: 'Snow & Ice', path: 'Freshwater & Water Management^Snow & Ice' };

  it('asks the series for their business domain facet', () => {
    const { request } = respond(service().domains(), facet());

    expect(queryOf(request)).toEqual({
      limit: '1',
      offset: '0',
      filter: "resourceType = 'series'",
      facets: 'eeaBusinessDomain',
    });
    expect(request.headers.get('Accept')).toBe('application/json');
  });

  it('lists the business domains with their subdomains, both by name', async () => {
    const { result } = respond(
      service().domains(),
      facet(
        'Reference Data',
        'Reference Data^Elevation',
        'Freshwater & Water Management',
        'Freshwater & Water Management^Snow & Ice',
        'Reference Data^Basemaps',
      ),
    );

    expect(await result).toEqual([
      { name: 'Freshwater & Water Management', subdomains: [snowAndIce] },
      {
        name: 'Reference Data',
        subdomains: [
          { name: 'Basemaps', path: 'Reference Data^Basemaps' },
          { name: 'Elevation', path: 'Reference Data^Elevation' },
        ],
      },
    ]);
  });

  it('finds no business domains when GN5 sends no facet', async () => {
    const { result } = respond(service().domains(), { features: [] });

    expect(await result).toEqual([]);
  });

  it('skips facet buckets without a value', async () => {
    const { result } = respond(service().domains(), {
      facets: {
        eeaBusinessDomain: {
          type: 'term',
          property: 'eeaBusinessDomain',
          buckets: [{ value: '', count: 1 }, { count: 1 }, { value: 'Reference Data', count: 1 }],
        },
      },
    });

    expect(await result).toEqual([{ name: 'Reference Data', subdomains: [] }]);
  });

  it('asks for the series of the subdomain by its full path, sorted by title', () => {
    const { request } = respond(service().series(snowAndIce), { features: [] });

    expect(queryOf(request)).toEqual({
      limit: '100',
      offset: '0',
      sortby: 'resourceTitleObject',
      filter:
        "resourceType = 'series' AND eeaBusinessDomain = 'Freshwater & Water Management^Snow & Ice'",
      facets: '',
    });
  });

  it('lists the series by title, or by id when the title is missing', async () => {
    const { result } = respond(service().series(snowAndIce), {
      features: [
        { id: 'a', properties: { title: 'Lake ice phenology' } },
        { id: 'b', properties: {} },
      ],
    });

    expect(await result).toEqual([
      { id: 'a', title: 'Lake ice phenology' },
      { id: 'b', title: 'b' },
    ]);
  });

  it('finds no series when GN5 leaves out an empty features list', async () => {
    const { result } = respond(service().series(snowAndIce), {
      type: 'FeatureCollection',
      numberMatched: 0,
      numberReturned: 0,
    });

    expect(await result).toEqual([]);
  });

  it('escapes quotes in the path of a subdomain', () => {
    const { request } = respond(
      service().series({ name: "Europe's air", path: "Air^Europe's air" }),
      { features: [] },
    );

    expect(request.params.get('filter')).toBe(
      "resourceType = 'series' AND eeaBusinessDomain = 'Air^Europe''s air'",
    );
  });
});
