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

  const businessDomain = (name: string) => ({
    scheme:
      'https://sdi.eea.europa.eu/catalogue/srv/api/registries/vocabularies/external.theme.eea-business-domains',
    concepts: [{ id: name }],
  });

  const snowAndIce = { name: 'Snow & Ice', path: 'Freshwater & Water Management^Snow & Ice' };

  it('lists the business domains with their subdomains', async () => {
    const domains = await firstValueFrom(service().domains());

    expect(domains.map((domain) => domain.name)).toContain('Freshwater & Water Management');
    expect(domains.flatMap((domain) => domain.subdomains)).toContainEqual(snowAndIce);
  });

  it('asks for the series with the subdomain as keyword, sorted by title', () => {
    const { request } = respond(service().series(snowAndIce), { features: [] });

    expect(queryOf(request)).toEqual({
      limit: '100',
      offset: '0',
      sortby: 'resourceTitleObject',
      filter: "resourceType = 'series' AND keywords = 'Snow & Ice'",
      facets: '',
    });
    expect(request.headers.get('Accept')).toBe('application/json');
  });

  it('keeps only the series whose business domain is the subdomain', async () => {
    const { result } = respond(service().series(snowAndIce), {
      features: [
        {
          id: 'a',
          properties: { title: 'Lake ice phenology', themes: [businessDomain('Snow & Ice')] },
        },
        { id: 'b', properties: { themes: [businessDomain('Snow & Ice')] } },
        {
          id: 'c',
          properties: {
            title: 'Snow cover',
            themes: [{ scheme: 'external.theme.gemet', concepts: [{ id: 'Snow & Ice' }] }],
          },
        },
        {
          id: 'd',
          properties: { title: 'Glaciers', themes: [businessDomain('Floods & Droughts')] },
        },
        { id: 'e', properties: { title: 'Sea ice' } },
      ],
    });

    expect(await result).toEqual([
      { id: 'a', title: 'Lake ice phenology' },
      { id: 'b', title: 'b' },
    ]);
  });

  it('skips a record whose themes lack a scheme', async () => {
    const { result } = respond(service().series(snowAndIce), {
      features: [
        {
          id: 'a',
          properties: { title: 'No scheme', themes: [{ concepts: [{ id: 'Snow & Ice' }] }] },
        },
        {
          id: 'b',
          properties: { title: 'Lake ice phenology', themes: [businessDomain('Snow & Ice')] },
        },
      ],
    });

    expect(await result).toEqual([{ id: 'b', title: 'Lake ice phenology' }]);
  });

  it('finds no series when GN5 leaves out an empty features list', async () => {
    const { result } = respond(service().series(snowAndIce), {
      type: 'FeatureCollection',
      numberMatched: 0,
      numberReturned: 0,
    });

    expect(await result).toEqual([]);
  });

  it('escapes quotes in the name of a subdomain', () => {
    const { request } = respond(
      service().series({ name: "Europe's air", path: "Air^Europe's air" }),
      { features: [] },
    );

    expect(request.params.get('filter')).toBe(
      "resourceType = 'series' AND keywords = 'Europe''s air'",
    );
  });
});
