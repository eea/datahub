import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SearchService } from '@geocat/frontend-library';
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

  it('offers no resource type filter', () => {
    const fixture = TestBed.createComponent(SearchResults);
    fixture.detectChanges();

    const labels = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('app-filter-dropdown button'),
      (button) => button.textContent?.trim(),
    );

    expect(labels).toContain('find.searchResults.filters.organization');
    expect(labels).not.toContain('find.searchResults.filters.resourceType');
  });
});
