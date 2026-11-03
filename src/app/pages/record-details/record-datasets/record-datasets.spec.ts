import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';

import { RecordDatasets } from './record-datasets';
import { Dataset, SeriesDatasetsService } from './series-datasets.service';

describe('RecordDatasets', () => {
  const fragment = new BehaviorSubject<string | null>(null);
  const snapshot = { fragment: null as string | null };
  const scrollIntoView = vi.fn();

  const dataset = (id: string, overrides: Partial<Dataset> = {}): Dataset => ({
    id,
    title: `Dataset ${id}`,
    formats: [],
    downloads: [],
    links: [],
    factsheetUrl: `/catalogue/srv/api/records/${id}/formatters/xsl-view?output=pdf`,
    ...overrides,
  });

  const datasets = [
    dataset('old', { startYear: 2005, endYear: 2013 }),
    dataset('undated'),
    dataset('new-b', { startYear: 2020, endYear: 2022, published: '2025-01-31' }),
    dataset('new-a', {
      startYear: 2020,
      endYear: 2022,
      published: '2026-01-31',
      formats: ['GeoTIFF'],
      downloads: [{ href: 'https://a/zip', isDoi: false }],
      links: [{ href: 'https://doi.org/10.2909/new-a', title: 'DOI', isDoi: true }],
    }),
    dataset('single-year', { startYear: 2018, endYear: 2018 }),
  ];

  async function render(): Promise<ComponentFixture<RecordDatasets>> {
    const fixture = TestBed.createComponent(RecordDatasets);
    fixture.componentRef.setInput(
      'childUuids',
      datasets.map((item) => item.id),
    );
    await fixture.whenStable();
    return fixture;
  }

  const all = (fixture: ComponentFixture<RecordDatasets>, testId: string): HTMLElement[] => [
    ...fixture.nativeElement.querySelectorAll(`[data-testid="${testId}"]`),
  ];

  const tabLabels = (fixture: ComponentFixture<RecordDatasets>) =>
    all(fixture, 'period-tab').map((tab) => tab.textContent?.trim());

  const activeTab = (fixture: ComponentFixture<RecordDatasets>) =>
    all(fixture, 'period-tab')
      .find((tab) => tab.getAttribute('aria-selected') === 'true')
      ?.textContent?.trim();

  const visibleDatasets = (fixture: ComponentFixture<RecordDatasets>) =>
    all(fixture, 'dataset')
      .filter((panel) => !panel.closest('[role="tabpanel"]')?.hasAttribute('hidden'))
      .map((panel) => panel.id);

  const panel = (fixture: ComponentFixture<RecordDatasets>, id: string): HTMLElement =>
    fixture.nativeElement.querySelector(`[id="${id}"]`);

  beforeEach(async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      },
    );
    fragment.next(null);
    snapshot.fragment = null;
    scrollIntoView.mockReset();
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      value: scrollIntoView,
      configurable: true,
    });
    await TestBed.configureTestingModule({
      imports: [RecordDatasets],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: ActivatedRoute, useValue: { fragment, snapshot } },
        {
          provide: SeriesDatasetsService,
          useValue: { currentDatasets: () => of(datasets) },
        },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      find: {
        recordDetails: {
          datasets: { doi: 'Digital Object Identifier (DOI)', otherPeriod: 'Other' },
        },
      },
    });
    translate.use('en');
  });

  afterEach(() => vi.unstubAllGlobals());

  it('puts the newest period first and undated datasets last', async () => {
    const fixture = await render();

    expect(tabLabels(fixture)).toEqual(['2020–2022', '2018', '2005–2013', 'Other']);
    expect(activeTab(fixture)).toBe('2020–2022');
  });

  it('lists the datasets of the selected period, newest published first', async () => {
    const fixture = await render();

    expect(visibleDatasets(fixture)).toEqual(['new-a', 'new-b']);

    all(fixture, 'period-tab')
      .find((tab) => tab.textContent?.trim() === '2005–2013')
      ?.click();
    await fixture.whenStable();

    expect(visibleDatasets(fixture)).toEqual(['old']);
  });

  it('shows the formats, download and DOI of a dataset', async () => {
    const fixture = await render();
    const row = panel(fixture, 'new-a');

    expect(row.querySelector('[data-testid="dataset-format"]')?.textContent?.trim()).toBe(
      'GeoTIFF',
    );
    expect(row.querySelector('[data-testid="dataset-download"]')?.getAttribute('href')).toBe(
      'https://a/zip',
    );
    expect(row.querySelector('[data-testid="dataset-link"]')?.textContent?.trim()).toBe(
      'Digital Object Identifier (DOI)',
    );
  });

  it('opens the dataset in the URL fragment on its period', async () => {
    snapshot.fragment = 'old';
    const fixture = await render();

    expect(activeTab(fixture)).toBe('2005–2013');
    expect(panel(fixture, 'old').getAttribute('data-p-active')).toBe('true');
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('leaves the page where it is when a dataset is opened', async () => {
    const fixture = await render();
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    panel(fixture, 'new-b').querySelector<HTMLElement>('p-accordion-header')?.click();
    fragment.next('new-b');
    await fixture.whenStable();

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('puts an opened dataset in the URL so it can be bookmarked', async () => {
    const fixture = await render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    panel(fixture, 'new-b').querySelector<HTMLElement>('p-accordion-header')?.click();
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({ fragment: 'new-b', replaceUrl: true }),
    );
    expect(panel(fixture, 'new-b').getAttribute('data-p-active')).toBe('true');
  });
});
