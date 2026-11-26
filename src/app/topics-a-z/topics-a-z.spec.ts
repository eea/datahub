import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import {
  FilterOption,
  SearchResult,
  SearchService,
  SearchStateService,
} from '@geocat/frontend-library';
import { provideTranslateService } from '@ngx-translate/core';
import { Observable, of, Subject } from 'rxjs';

import { groupByLetter, TopicsAZ } from './topics-a-z';

const topic = (label: string): FilterOption => ({ value: label, label, count: 1 });

const result = (eeaTopics?: FilterOption[], failed = false): SearchResult => ({
  records: [],
  total: 0,
  facets: eeaTopics ? { eeaTopics } : {},
  failed,
});

describe('groupByLetter', () => {
  it('sorts the topics and groups them under their first letter', () => {
    expect(
      groupByLetter([topic('Soil'), topic('air pollution'), topic('Bathing water'), topic('Air')]),
    ).toEqual([
      { letter: 'A', topics: [topic('Air'), topic('air pollution')] },
      { letter: 'B', topics: [topic('Bathing water')] },
      { letter: 'S', topics: [topic('Soil')] },
    ]);
  });

  it('files a topic with an accented first letter under the plain letter', () => {
    expect(groupByLetter([topic('Énergie'), topic('Eau')]).map(({ letter }) => letter)).toEqual([
      'E',
    ]);
  });
});

describe('TopicsAZ', () => {
  const searchState = { setQuery: vi.fn(), clearFilters: vi.fn(), setFilter: vi.fn() };
  const search = vi.fn((): Observable<SearchResult> => of(result([])));

  const render = () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: SearchService, useValue: { search } },
        { provide: SearchStateService, useValue: searchState },
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(TopicsAZ);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    return { fixture, element, navigate };
  };

  beforeEach(() => {
    Object.values(searchState).forEach((spy) => spy.mockReset());
    search.mockReset();
  });

  it('lists the EEA topics facet by letter', () => {
    search.mockReturnValue(of(result([topic('Water'), topic('Air pollution'), topic('Waste')])));
    const { element } = render();

    const groups = [...element.querySelectorAll('section')].map((section) => [
      section.querySelector('h3')?.textContent?.trim(),
      [...section.querySelectorAll('a')].map((link) => link.textContent?.trim()),
    ]);
    expect(groups).toEqual([
      ['A', ['Air pollution']],
      ['W', ['Waste', 'Water']],
    ]);
  });

  it('asks for the facet of the whole catalogue, without filters or a query', () => {
    render();

    expect(search).toHaveBeenCalledWith({ page: 1, pageSize: 1 });
  });

  it('opens the results for a topic from a clean search', () => {
    search.mockReturnValue(of(result([topic('Soil')])));
    const { element, navigate } = render();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });

    element.querySelector('a')!.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(searchState.setQuery).toHaveBeenCalledWith('');
    expect(searchState.clearFilters).toHaveBeenCalled();
    expect(searchState.setFilter).toHaveBeenCalledWith('eeaTopics', {
      included: ['Soil'],
      excluded: [],
    });
    expect(navigate).toHaveBeenCalledWith(['/search']);
  });

  it.each([
    ['find.landing.topics.loading', () => new Subject<SearchResult>()],
    ['find.landing.topics.failed', () => of(result(undefined, true))],
    ['find.landing.topics.empty', () => of(result())],
  ])('says %s instead of a list', (key, answer) => {
    search.mockReturnValue(answer());
    const { element } = render();

    expect(element.textContent?.trim()).toBe(key);
  });
});
