import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { DatasetPeriods } from './dataset-periods';
import { Dataset } from './series-datasets.service';

describe('DatasetPeriods', () => {
  const fragment = new BehaviorSubject<string | null>(null);

  const dataset = (id: string, overrides: Partial<Dataset> = {}): Dataset => ({
    id,
    title: `Dataset ${id}`,
    formats: [],
    downloads: [],
    links: [],
    factsheetUrl: `/catalogue/srv/api/records/${id}/formatters/xsl-view?output=pdf`,
    superseded: false,
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

  async function render(items = datasets): Promise<ComponentFixture<DatasetPeriods>> {
    const fixture = TestBed.createComponent(DatasetPeriods);
    fixture.componentRef.setInput('datasets', items);
    await fixture.whenStable();
    return fixture;
  }

  const all = (fixture: ComponentFixture<DatasetPeriods>, testId: string): HTMLElement[] => [
    ...fixture.nativeElement.querySelectorAll(`[data-testid="${testId}"]`),
  ];

  const tabLabels = (fixture: ComponentFixture<DatasetPeriods>) =>
    all(fixture, 'period-tab').map((tab) => tab.textContent?.trim());

  const activeTab = (fixture: ComponentFixture<DatasetPeriods>) =>
    all(fixture, 'period-tab')
      .find((tab) => tab.getAttribute('aria-selected') === 'true')
      ?.textContent?.trim();

  const visibleDatasets = (fixture: ComponentFixture<DatasetPeriods>) =>
    all(fixture, 'dataset')
      .filter((panel) => !panel.closest('[role="tabpanel"]')?.hasAttribute('hidden'))
      .map((panel) => panel.id);

  const panel = (fixture: ComponentFixture<DatasetPeriods>, id: string): HTMLElement =>
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
    await TestBed.configureTestingModule({
      imports: [DatasetPeriods],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: ActivatedRoute, useValue: { fragment } },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      find: {
        recordDetails: {
          datasets: {
            doi: 'Digital Object Identifier (DOI)',
            otherPeriod: 'Other',
            superseded: 'Superseded',
          },
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

  it('marks a superseded dataset and shows only its dates', async () => {
    const fixture = await render([
      dataset('old', {
        startYear: 2005,
        endYear: 2013,
        published: '2016-09-19',
        formats: ['SHP'],
        downloads: [{ href: 'https://a/zip', isDoi: false }],
        links: [{ href: 'https://doi.org/10.2909/old', title: 'DOI', isDoi: true }],
        superseded: true,
      }),
    ]);
    const row = panel(fixture, 'old');
    const chips = [...row.querySelectorAll('p-tag')].map((tag) => tag.textContent?.trim());

    expect(chips).toEqual(['SHP', 'Superseded']);
    expect(row.querySelector('[data-testid="dataset-published"]')).not.toBeNull();
    expect(row.querySelector('[data-testid="dataset-factsheet"]')).toBeNull();
    expect(row.querySelector('[data-testid="dataset-download"]')).toBeNull();
    expect(row.querySelector('[data-testid="dataset-link"]')).toBeNull();
  });

  it('shows no Superseded chip on a current dataset', async () => {
    const fixture = await render();

    expect(panel(fixture, 'new-a').querySelector('[data-testid="dataset-superseded"]')).toBeNull();
  });

  it('opens the dataset in the URL fragment on its period', async () => {
    fragment.next('old');
    const fixture = await render();

    expect(activeTab(fixture)).toBe('2005–2013');
    expect(panel(fixture, 'old').getAttribute('data-p-active')).toBe('true');
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
