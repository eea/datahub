import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SearchService, SearchStateService } from '@geocat/frontend-library';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { SearchResults } from './search-results';

describe('SearchResults', () => {
  const search = vi.fn(() => of({ records: [], total: 0, failed: false, facets: {} }));

  beforeEach(async () => {
    search.mockClear();
    await TestBed.configureTestingModule({
      imports: [SearchResults],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: SearchService, useValue: { search } },
      ],
    }).compileComponents();
  });

  it('searches series only', () => {
    TestBed.createComponent(SearchResults).detectChanges();

    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({ resourceTypes: { included: ['series'] } }),
    );
  });

  it('keeps series only when another resource type is picked', () => {
    TestBed.inject(SearchStateService).filters.resourceType.included.set(['dataset']);
    TestBed.createComponent(SearchResults).detectChanges();

    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({ resourceTypes: { included: ['series'] } }),
    );
  });
});
