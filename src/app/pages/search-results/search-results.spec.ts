import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { SearchResult, SearchService } from '@geocat/frontend-library';
import { provideTranslateService, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Message } from '@openng/optimus-ui/message';
import { NEVER, Observable, of } from 'rxjs';

import en from '../../../../i18n/en.json';
import fr from '../../../../i18n/fr.json';
import nl from '../../../../i18n/nl.json';
import { SearchResults } from './search-results';

describe('SearchResults', () => {
  const result = (total: number, failed = false): SearchResult => ({
    records: [],
    total,
    facets: {},
    failed,
  });
  const search = vi.fn((): Observable<SearchResult> => of(result(322)));

  const backLink = (fixture: ComponentFixture<SearchResults>): HTMLAnchorElement =>
    fixture.nativeElement.querySelector('[data-testid="back-to-search-home"]');
  const count = (fixture: ComponentFixture<SearchResults>): HTMLElement =>
    fixture.nativeElement.querySelector('[data-testid="results-count"]');

  const render = (): ComponentFixture<SearchResults> => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en);
    translate.use('en');
    const fixture = TestBed.createComponent(SearchResults);
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(async () => {
    search.mockReset();
    search.mockReturnValue(of(result(322)));

    await TestBed.configureTestingModule({
      imports: [SearchResults],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: SearchService, useValue: { search } },
      ],
    })
      .overrideComponent(SearchResults, {
        set: { imports: [TranslatePipe, RouterLink, Message], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  it('puts the back link and the result count on one line above the search panel', () => {
    const fixture = render();
    const row = backLink(fixture).parentElement;
    const panel: HTMLElement = fixture.nativeElement.querySelector('app-search-panel');

    expect(backLink(fixture).textContent?.trim()).toBe('Back to search home');
    expect(count(fixture).textContent?.replace(/\s+/g, ' ').trim()).toBe('Results: 322');
    expect(count(fixture).parentElement).toBe(row);
    expect(row?.compareDocumentPosition(panel)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(panel.textContent?.trim()).toBe('');
  });

  it('says it is searching while the request runs', () => {
    search.mockReturnValue(NEVER);
    const fixture = render();

    expect(count(fixture).textContent?.trim()).toBe('Searching…');
  });

  it('leaves the count out when the request fails', () => {
    search.mockReturnValue(of(result(0, true)));
    const fixture = render();

    expect(count(fixture).textContent?.trim()).toBe('');
    expect(fixture.nativeElement.querySelector('p-message')).not.toBeNull();
  });

  it('links back to the landing page', () => {
    const fixture = render();

    expect(backLink(fixture).getAttribute('href')).toBe('/home');
  });

  it.each([
    ['en', en],
    ['fr', fr],
    ['nl', nl],
  ])('names the back link in %s', (lang, translations) => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation(lang, translations);
    translate.use(lang);
    const fixture = TestBed.createComponent(SearchResults);
    fixture.detectChanges();

    expect(backLink(fixture).textContent?.trim()).toBe(
      translations.find.searchResults.backToSearchHome,
    );
  });
});
