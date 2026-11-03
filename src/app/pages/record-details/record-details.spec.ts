import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BASE_PATH, RecordService } from '@geocat/frontend-api-client';
import { COLLECTION_ID, SearchStateService } from '@geocat/frontend-library';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import {
  EEA_WEBSITE_ACTIONS,
  EEA_WEBSITE_NAVIGATION,
  EeaWebsiteLinks,
} from '../../eea-website/eea-website-links';
import { SeriesDatasetsService } from './record-datasets/series-datasets.service';
import { RecordDetails } from './record-details';

describe('RecordDetails', () => {
  const uuid = 'e006507d-15c8-49e6-959c-53b61facd873';
  const properties = signal<Record<string, string | string[]> | undefined>({});
  const currentDatasets = vi.fn();
  const sentence = 'Urban Atlas provides comparable land use and land cover data for urban areas. ';
  const longDescription = sentence.repeat(4);

  async function render(): Promise<ComponentFixture<RecordDetails>> {
    const fixture = TestBed.createComponent(RecordDetails);
    await fixture.whenStable();
    return fixture;
  }

  function byTestId(fixture: ComponentFixture<RecordDetails>, testId: string): HTMLElement {
    return fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);
  }

  beforeEach(async () => {
    properties.set({});
    currentDatasets.mockReset().mockReturnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [RecordDetails],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        {
          provide: ActivatedRoute,
          useValue: { params: of({ uuid }), fragment: of(null), snapshot: { fragment: null } },
        },
        {
          provide: RecordService,
          useValue: {
            getRecord: () => {
              const found = properties();
              return found
                ? of({ id: uuid, properties: found })
                : throwError(() => new Error('Not found'));
            },
          },
        },
        { provide: SeriesDatasetsService, useValue: { currentDatasets } },
        { provide: COLLECTION_ID, useValue: 'collection' },
        { provide: BASE_PATH, useValue: '/catalogue' },
        {
          provide: EeaWebsiteLinks,
          useValue: {
            footer: signal(EEA_WEBSITE_ACTIONS),
            header: signal(EEA_WEBSITE_NAVIGATION),
          },
        },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      find: {
        recordDetails: {
          lastModified: 'Last modified {{date}}',
          seeLess: 'See less',
          seeMore: 'See more',
        },
      },
    });
    translate.use('en');
  });

  it('shows the title, last modified date and the catalogue RSS feed in the banner', async () => {
    properties.set({ title: 'Urban Atlas', updated: '2025-12-02T09:30:00Z' });
    const fixture = await render();

    expect(fixture.nativeElement.querySelector('h1').textContent.trim()).toBe('Urban Atlas');
    expect(byTestId(fixture, 'last-modified').textContent.trim()).toBe('Last modified 02 Dec 2025');
    expect(byTestId(fixture, 'rss-link').getAttribute('href')).toBe('/catalogue/rss');
  });

  it('keeps the Datahub overview link and shows an error when the record is not found', async () => {
    properties.set(undefined);
    const fixture = await render();

    expect(byTestId(fixture, 'datahub-overview-link')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('h1')).toBeNull();
    expect(fixture.nativeElement.querySelector('p-message').textContent.trim()).toBe(
      'record.view.notFoundOrNotShared',
    );
  });

  it('links Datahub overview back to the results of the current search', async () => {
    TestBed.inject(SearchStateService).setQuery('urban atlas');
    const fixture = await render();

    expect(byTestId(fixture, 'datahub-overview-link').getAttribute('href')).toBe(
      '/search?q=urban%20atlas',
    );
  });

  it('links Datahub overview to all results when nothing was searched', async () => {
    const fixture = await render();

    expect(byTestId(fixture, 'datahub-overview-link').getAttribute('href')).toBe('/search');
  });

  it('cuts a long description after 220 characters and shows all of it on See more', async () => {
    properties.set({ description: longDescription });
    const fixture = await render();
    const toggle = byTestId(fixture, 'description-toggle');

    expect(byTestId(fixture, 'record-description').textContent).toContain(
      `${longDescription.slice(0, 220).trim()}…`,
    );
    expect(toggle.textContent.trim()).toBe('See more');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    toggle.click();
    await fixture.whenStable();

    expect(byTestId(fixture, 'record-description').textContent).toContain(longDescription.trim());
    expect(toggle.textContent.trim()).toBe('See less');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('shows a short description in full without See more', async () => {
    properties.set({ description: 'Land use and land cover data.' });
    const fixture = await render();

    expect(byTestId(fixture, 'record-description').textContent.trim()).toBe(
      'Land use and land cover data.',
    );
    expect(byTestId(fixture, 'description-toggle')).toBeNull();
  });

  it('lists the datasets of a series', async () => {
    properties.set({ title: 'Urban Atlas', childUuid: ['a', 'b'] });
    const fixture = await render();

    expect(currentDatasets).toHaveBeenCalledWith(['a', 'b']);
  });

  it('shows no datasets block for a record without datasets', async () => {
    properties.set({ title: 'Urban Atlas 2018' });
    const fixture = await render();

    expect(currentDatasets).not.toHaveBeenCalled();
    expect(byTestId(fixture, 'record-datasets')).toBeNull();
  });
});
