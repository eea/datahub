import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SearchStateService } from '@geocat/frontend-library';

import { EeaTopicsSearch } from './eea-topics-search';

describe('EeaTopicsSearch', () => {
  const searchState = { setQuery: vi.fn(), clearFilters: vi.fn(), setFilter: vi.fn() };

  const setup = () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: SearchStateService, useValue: searchState }],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    return { search: TestBed.inject(EeaTopicsSearch), navigate };
  };

  const click = (init: MouseEventInit = {}) =>
    new MouseEvent('click', { cancelable: true, ...init });

  beforeEach(() => Object.values(searchState).forEach((spy) => spy.mockReset()));

  it('opens the results for the EEA topics from a clean search', () => {
    const { search, navigate } = setup();
    const event = click();

    search.open(event, ['Soil', 'Water']);

    expect(event.defaultPrevented).toBe(true);
    expect(searchState.setQuery).toHaveBeenCalledWith('');
    expect(searchState.clearFilters).toHaveBeenCalled();
    expect(searchState.setFilter).toHaveBeenCalledWith('eeaTopics', {
      included: ['Soil', 'Water'],
      excluded: [],
    });
    expect(navigate).toHaveBeenCalledWith(['/search']);
  });

  it.each<[string, MouseEventInit]>([
    ['Ctrl', { ctrlKey: true }],
    ['Cmd', { metaKey: true }],
    ['Shift', { shiftKey: true }],
    ['the middle button', { button: 1 }],
  ])('leaves a click with %s, which opens a new tab or window, to the browser', (_, init) => {
    const { search, navigate } = setup();
    const event = click(init);

    search.open(event, ['Soil']);

    expect(event.defaultPrevented).toBe(false);
    expect(searchState.setFilter).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
