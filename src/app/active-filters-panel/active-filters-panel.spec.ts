import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SEARCH_FILTERS, SearchStateService } from '@geocat/frontend-library';
import { provideTranslateService } from '@ngx-translate/core';

import { SEARCH_FILTERS_LIST } from '../search-filters';
import { ActiveFiltersPanel } from './active-filters-panel';

describe('ActiveFiltersPanel', () => {
  let fixture: ComponentFixture<ActiveFiltersPanel>;
  let state: SearchStateService;
  let changes: number;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveFiltersPanel],
      providers: [
        provideTranslateService(),
        { provide: SEARCH_FILTERS, useValue: SEARCH_FILTERS_LIST },
      ],
    }).compileComponents();

    state = TestBed.inject(SearchStateService);
    fixture = TestBed.createComponent(ActiveFiltersPanel);
    changes = 0;
    fixture.componentInstance.filtersChange.subscribe(() => changes++);
    fixture.detectChanges();
  });

  const host = (): HTMLElement => fixture.nativeElement;
  const text = (element: Element | null) => element?.textContent?.replace(/\s+/g, ' ').trim();
  const group = (key: string) =>
    host().querySelector(`[data-testid="active-filters-group-${key}"]`);
  const groupParts = (key: string) => Array.from(group(key)?.children ?? []).map(text);

  function select(key: string, included: string[], excluded: string[] = []): void {
    state.setFilter(key, { included, excluded });
    fixture.detectChanges();
  }

  it('shows nothing while no filter is set', () => {
    expect(host().querySelector('section')).toBeNull();
  });

  it('groups the selected values under their filter, an excluded value struck through', () => {
    select('eeaTopics', ['Air pollution', 'Biodiversity'], ['Noise']);
    select('format', ['SHP']);

    expect(groupParts('eeaTopics')).toEqual([
      'find.searchResults.filters.eeaTopics:',
      'Air pollution',
      'Biodiversity',
      'Noise',
    ]);
    expect(groupParts('format')).toEqual(['find.searchResults.filters.format:', 'SHP']);
    const struck = Array.from(group('eeaTopics')!.querySelectorAll('.line-through'));
    expect(struck.map((value) => value.textContent)).toEqual(['Noise']);
  });

  it('removes only the value whose button is clicked', () => {
    select('eeaTopics', ['Air pollution', 'Biodiversity']);

    group('eeaTopics')!.querySelector('button')!.click();
    fixture.detectChanges();

    expect(state.selection('eeaTopics')).toEqual({ included: ['Biodiversity'], excluded: [] });
    expect(groupParts('eeaTopics')).toEqual([
      'find.searchResults.filters.eeaTopics:',
      'Biodiversity',
    ]);
    expect(changes).toBe(1);
  });

  it('removes an excluded value from the excluded side only', () => {
    select('eeaTopics', ['Air pollution'], ['Noise']);
    const buttons = group('eeaTopics')!.querySelectorAll('button');

    expect(buttons[0].getAttribute('aria-label')).toBe('find.searchResults.activeFilters.remove');
    expect(buttons[1].getAttribute('aria-label')).toBe(
      'find.searchResults.activeFilters.removeExcluded',
    );

    buttons[1].click();
    fixture.detectChanges();

    expect(state.selection('eeaTopics')).toEqual({ included: ['Air pollution'], excluded: [] });
    expect(group('eeaTopics')!.querySelector('.line-through')).toBeNull();
    expect(changes).toBe(1);
  });

  it('clears every filter with clear all and goes away', () => {
    select('eeaTopics', ['Air pollution']);
    select('format', ['SHP']);

    host().querySelector<HTMLButtonElement>('[data-testid="active-filters-clear-all"]')!.click();
    fixture.detectChanges();

    expect(state.selection('eeaTopics').included).toEqual([]);
    expect(state.selection('format').included).toEqual([]);
    expect(host().querySelector('section')).toBeNull();
    expect(changes).toBe(1);
  });

  it('collapses the values and keeps the title and clear all', () => {
    select('eeaTopics', ['Air pollution']);
    const toggle = host().querySelector<HTMLButtonElement>(
      '[data-testid="active-filters-toggle"]',
    )!;

    toggle.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    const body = host().querySelector<HTMLElement>('#active-filters-body');
    expect(body?.hidden).toBe(true);
    expect(toggle.getAttribute('aria-controls')).toBe(body?.id);
    expect(text(host().querySelector('h2'))).toBe('find.searchResults.activeFilters.title');
    expect(host().querySelector('[data-testid="active-filters-clear-all"]')).not.toBeNull();
  });
});
