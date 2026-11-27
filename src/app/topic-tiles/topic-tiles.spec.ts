import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SearchStateService } from '@geocat/frontend-library';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';

import en from '../../../i18n/en.json';
import { TopicTiles } from './topic-tiles';

const AT_A_GLANCE = 'https://www.eea.europa.eu/en/topics/at-a-glance';
const FEATURED_DATA = 'https://www.eea.europa.eu/en/datahub/featured-data';

describe('TopicTiles', () => {
  const searchState = { setQuery: vi.fn(), clearFilters: vi.fn(), setFilter: vi.fn() };

  const render = () => {
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService(),
        provideRouter([]),
        { provide: SearchStateService, useValue: searchState },
      ],
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en);
    translate.use('en');
    const fixture = TestBed.createComponent(TopicTiles);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const links = [...element.querySelectorAll<HTMLAnchorElement>('li a')];
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const click = (label: string, init: MouseEventInit = {}) => {
      const link = links.find((candidate) => candidate.textContent?.trim() === label)!;
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...init });
      link.dispatchEvent(event);
      return event;
    };
    return { element, links, navigate, click };
  };

  beforeEach(() => Object.values(searchState).forEach((spy) => spy.mockReset()));

  it('titles the block "At a glance"', () => {
    const { element } = render();

    expect(element.querySelector('h2')?.textContent?.trim()).toBe('At a glance');
  });

  it('shows the five topics, then Copernicus and Statistical data', () => {
    const { links } = render();

    expect(links.map((link) => [link.textContent?.trim(), link.getAttribute('href')])).toEqual([
      ['Nature', '/search'],
      ['Health', '/search'],
      ['Climate', '/search'],
      ['Economy and resources', '/search'],
      ['Sustainability', '/search'],
      ['Copernicus', `${FEATURED_DATA}/copernicus-data`],
      ['Statistical data', `${FEATURED_DATA}/statistical-data`],
    ]);
  });

  it("uses each page's stable large image scale", () => {
    const { links } = render();

    expect(links.map((link) => link.querySelector('img')?.src)).toEqual([
      `${AT_A_GLANCE}/nature/@@images/image/large`,
      `${AT_A_GLANCE}/health/@@images/image/large`,
      `${AT_A_GLANCE}/climate/@@images/image/large`,
      `${AT_A_GLANCE}/economy-and-resources/@@images/image/large`,
      `${AT_A_GLANCE}/sustainability/@@images/image/large`,
      'https://www.eea.europa.eu/en/datahub/copernicus-2.jpg/@@images/image/large',
      'https://www.eea.europa.eu/en/datahub/chris-liverani-dbi_my696rk-unsplash.jpg/@@images/image/large',
    ]);
  });

  it('opens the results for the EEA topics of a topic tile, from a clean search', () => {
    const { click, navigate } = render();

    const event = click('Health');

    expect(event.defaultPrevented).toBe(true);
    expect(searchState.setQuery).toHaveBeenCalledWith('');
    expect(searchState.clearFilters).toHaveBeenCalled();
    expect(searchState.setFilter).toHaveBeenCalledWith('eeaTopics', {
      included: [
        'Air pollution',
        'Chemicals',
        'Climate change impacts, risks and adaptation',
        'Environmental health impacts',
        'Noise',
        'Pollution',
        'Environmental inequalities',
      ],
      excluded: [],
    });
    expect(navigate).toHaveBeenCalledWith(['/search']);
  });

  it('lets Copernicus and Statistical data open their own pages', () => {
    const { click, navigate } = render();

    const events = [click('Copernicus'), click('Statistical data')];

    expect(events.map((event) => event.defaultPrevented)).toEqual([false, false]);
    expect(searchState.setFilter).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
