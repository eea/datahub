import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OgcApiRecordsRecordGeoJSONDto } from '@geocat/frontend-api-client';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';

import en from '../../../../../i18n/en.json';
import { ResultCard } from './result-card';

describe('ResultCard', () => {
  const record = (properties: Record<string, unknown> = {}) =>
    ({
      id: 'urban-atlas',
      type: 'Feature',
      properties: {
        title: 'Urban Atlas',
        description: 'Land use and land cover for European cities.',
        orgForResource: ['European Environment Agency'],
        issued: ['2024-02-10'],
        eeaTopics: ['Land use', 'Urban sustainability'],
        formats: [{ name: 'GeoTIFF' }, { name: 'SHP' }],
        ...properties,
      },
      links: [],
    }) as unknown as OgcApiRecordsRecordGeoJSONDto;

  async function render(
    value: OgcApiRecordsRecordGeoJSONDto,
  ): Promise<ComponentFixture<ResultCard>> {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en);
    translate.use('en');
    const fixture = TestBed.createComponent(ResultCard);
    fixture.componentRef.setInput('record', value);
    await fixture.whenStable();
    return fixture;
  }

  const byTestId = (fixture: ComponentFixture<ResultCard>, testId: string): HTMLElement | null =>
    fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);

  const detailsLine = (fixture: ComponentFixture<ResultCard>) =>
    byTestId(fixture, 'result-organisation')
      ?.closest('p')
      ?.textContent?.replace(/\s+/g, ' ')
      .trim();

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-20T12:00:00Z'));

    await TestBed.configureTestingModule({
      imports: [ResultCard],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('links the title to the record page', async () => {
    const fixture = await render(record());
    const title = byTestId(fixture, 'result-title');

    expect(title?.textContent?.trim()).toBe('Urban Atlas');
    expect(title?.getAttribute('href')).toBe('/record/urban-atlas');
  });

  it('shows the description', async () => {
    const fixture = await render(record());

    expect(byTestId(fixture, 'result-description')?.textContent?.trim()).toBe(
      'Land use and land cover for European cities.',
    );
  });

  it('lists organisation, publication date, first EEA topic and formats in that order', async () => {
    const fixture = await render(record());

    expect(detailsLine(fixture)).toBe(
      'European Environment Agency • 10 Feb 2024 • Land use • GeoTIFF, SHP',
    );
  });

  it('shows only the first EEA topic of the record', async () => {
    const fixture = await render(record({ eeaTopics: ['Water', 'Agriculture and food system'] }));

    expect(byTestId(fixture, 'result-topic')?.textContent?.trim()).toBe('Water');
  });

  it('leaves out the details a record does not have, with no stray separator', async () => {
    const fixture = await render(record({ issued: undefined, formats: [] }));

    expect(detailsLine(fixture)).toBe('European Environment Agency • Land use');
    expect(byTestId(fixture, 'result-published')).toBeNull();
    expect(byTestId(fixture, 'result-formats')).toBeNull();
  });

  it('leaves out a publication date it cannot read', async () => {
    const fixture = await render(record({ issued: ['n/a'] }));

    expect(detailsLine(fixture)).toBe('European Environment Agency • Land use • GeoTIFF, SHP');
    expect(byTestId(fixture, 'result-new')).toBeNull();
  });

  it('names a format once when several datasets share it', async () => {
    const fixture = await render(
      record({ formats: [{ name: 'GeoTIFF' }, { name: 'GeoTIFF' }, { name: 'SHP' }] }),
    );

    expect(byTestId(fixture, 'result-formats')?.textContent?.trim()).toBe('GeoTIFF, SHP');
  });

  it('marks a record published in the last 30 days as new', async () => {
    const fixture = await render(record({ issued: ['2026-10-27'] }));

    expect(byTestId(fixture, 'result-new')?.textContent?.trim()).toBe('New');
  });

  it('does not mark a record published more than 30 days ago as new', async () => {
    const fixture = await render(record({ issued: ['2026-10-20T11:00:00+00:00'] }));

    expect(byTestId(fixture, 'result-new')).toBeNull();
  });

  it('does not mark a record without a publication date as new', async () => {
    const fixture = await render(record({ issued: undefined }));

    expect(byTestId(fixture, 'result-new')).toBeNull();
  });
});
