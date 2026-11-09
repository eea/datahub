import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '@geocat/frontend-api-client';
import { COLLECTION_ID, SearchService } from '@geocat/frontend-library';
import { of } from 'rxjs';

import { appConfig } from './app.config';
import { SeriesOnlySearchService } from './series-only-search.service';

describe('SeriesOnlySearchService', () => {
  const seriesOnly = { resourceTypes: { included: ['series'] } };
  let service: SeriesOnlySearchService;

  beforeEach(() => {
    vi.spyOn(SearchService.prototype, 'search').mockReturnValue(
      of({ records: [], total: 0, failed: false, facets: {} }),
    );
    vi.spyOn(SearchService.prototype, 'suggest').mockReturnValue(of([]));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideApi('/catalogue'),
        { provide: COLLECTION_ID, useValue: 'main' },
        SeriesOnlySearchService,
      ],
    });
    service = TestBed.inject(SeriesOnlySearchService);
  });

  afterEach(() => vi.restoreAllMocks());

  it('searches series only', () => {
    service.search({ query: 'pm10' });

    expect(SearchService.prototype.search).toHaveBeenCalledWith({ query: 'pm10', ...seriesOnly });
  });

  it('suggests series titles only', () => {
    service.suggest({ query: 'pm10' }, 5);

    expect(SearchService.prototype.suggest).toHaveBeenCalledWith(
      { query: 'pm10', ...seriesOnly },
      5,
    );
  });

  it('keeps series only when another resource type is picked', () => {
    service.search({ resourceTypes: { included: ['dataset'] } });

    expect(SearchService.prototype.search).toHaveBeenCalledWith(seriesOnly);
  });

  it('replaces the library search service in the app', () => {
    expect(appConfig('/catalogue').providers).toContainEqual({
      provide: SearchService,
      useClass: SeriesOnlySearchService,
    });
  });
});
