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

  it('asks for the business domain facet of series only', () => {
    const { request } = respond(service().domains(), { features: [] });

    expect(queryOf(request)).toEqual({
      limit: '1',
      offset: '0',
      filter: "resourceType = 'series'",
      facets: 'eeaBusinessDomain',
    });
    expect(request.headers.get('Accept')).toBe('application/json');
  });

  it('groups the subdomain buckets under their domain, both sorted by name', async () => {
    const { result } = respond(service().domains(), {
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
    });

    expect(await result).toEqual([
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
    const { result } = respond(service().domains(), { features: [], facets: {} });

    expect(await result).toEqual([]);
  });

  it('lists every series of a subdomain by its full path, sorted by title', async () => {
    const { request, result } = respond(
      service().series({ name: 'Snow & Ice', path: 'Water^Snow & Ice', seriesCount: 2 }),
      {
        features: [
          { id: 'a', properties: { title: 'Lake ice phenology' } },
          { id: 'b', properties: {} },
        ],
      },
    );

    expect(await result).toEqual([
      { id: 'a', title: 'Lake ice phenology' },
      { id: 'b', title: 'b' },
    ]);
    expect(queryOf(request)).toEqual({
      limit: '2',
      offset: '0',
      sortby: 'resourceTitleObject',
      filter: "resourceType = 'series' AND eeaBusinessDomain = 'Water^Snow & Ice'",
      facets: '',
    });
  });

  it('escapes quotes in the path of a subdomain', () => {
    const { request } = respond(
      service().series({ name: "Europe's air", path: "Air^Europe's air", seriesCount: 1 }),
      { features: [] },
    );

    expect(request.params.get('filter')).toBe(
      "resourceType = 'series' AND eeaBusinessDomain = 'Air^Europe''s air'",
    );
  });
});
