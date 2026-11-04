import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BASE_PATH, OgcApiRecordsRecordGeoJSONDto } from '@geocat/frontend-api-client';
import { provideTranslateService } from '@ngx-translate/core';

import { RecordMoreInformation } from './record-more-information';

describe('RecordMoreInformation', () => {
  const ROD_SCHEME =
    'https://sdi.eea.europa.eu/catalogue/srv/api/registries/vocabularies/external.theme.rod-eionet-europa-eu';

  const record = (
    properties: Partial<OgcApiRecordsRecordGeoJSONDto['properties']> = {},
    time?: object,
  ) =>
    ({
      id: 'urban-atlas',
      type: 'Feature',
      time,
      properties: { title: 'Urban Atlas', ...properties },
      links: [],
    }) as unknown as OgcApiRecordsRecordGeoJSONDto;

  async function render(
    value: OgcApiRecordsRecordGeoJSONDto,
  ): Promise<ComponentFixture<RecordMoreInformation>> {
    const fixture = TestBed.createComponent(RecordMoreInformation);
    fixture.componentRef.setInput('record', value);
    await fixture.whenStable();
    return fixture;
  }

  const byTestId = (fixture: ComponentFixture<RecordMoreInformation>, testId: string) =>
    fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordMoreInformation],
      providers: [provideTranslateService(), { provide: BASE_PATH, useValue: '/catalogue' }],
    }).compileComponents();
  });

  it('lists the reporting obligations, linked to ROD', async () => {
    const fixture = await render(
      record({
        themes: [
          {
            scheme: ROD_SCHEME,
            concepts: [
              {
                id: 'Air Quality Directive IPR',
                url: 'https://rod.eionet.europa.eu/obligations/670',
              },
              { id: 'Ambient air quality' },
            ],
          },
          { scheme: 'http://www.eionet.europa.eu/gemet', concepts: [{ id: 'air pollution' }] },
        ],
      }),
    );
    const obligations = byTestId(fixture, 'reporting-obligations');

    expect(
      [...obligations.querySelectorAll('a, span')].map((item: Element) => item.textContent?.trim()),
    ).toEqual(['Air Quality Directive IPR', 'Ambient air quality']);
    expect(obligations.querySelector('a').getAttribute('href')).toBe(
      'https://rod.eionet.europa.eu/obligations/670',
    );
  });

  it('lists a reporting obligation the record repeats once', async () => {
    const obligation = {
      id: 'Information on Natura 2000 sites (SPAs, Birds Directive)',
      url: 'http://rod.eionet.europa.eu/obligations/274',
    };
    const fixture = await render(
      record({ themes: [{ scheme: ROD_SCHEME, concepts: [obligation, obligation] }] }),
    );

    expect(byTestId(fixture, 'reporting-obligations').querySelectorAll('a').length).toBe(1);
  });

  it('shows the temporal coverage and each organisation once', async () => {
    const fixture = await render(
      record(
        {
          orgForResource: [
            'European Environment Agency',
            'Copernicus',
            'European Environment Agency',
          ],
        },
        { interval: ['2005-01-01T00:00:00Z', '2022-12-31T00:00:00Z'] },
      ),
    );

    expect(byTestId(fixture, 'temporal-coverage').textContent.trim()).toBe('2005–2022');
    expect(byTestId(fixture, 'organisation').textContent.trim()).toBe(
      'European Environment Agency, Copernicus',
    );
  });

  it('shows a dash for each field the record lacks', async () => {
    const fixture = await render(record());

    expect(
      ['reporting-obligations', 'temporal-coverage', 'organisation'].map((testId) =>
        byTestId(fixture, testId).textContent.trim(),
      ),
    ).toEqual(['—', '—', '—']);
  });

  it('links to the Metadata Factsheet and the record in the catalogue', async () => {
    const fixture = await render(record());

    expect(byTestId(fixture, 'record-factsheet').getAttribute('href')).toBe(
      '/catalogue/srv/api/records/urban-atlas/formatters/xsl-view?output=pdf&language=eng&approved=true',
    );
    expect(byTestId(fixture, 'record-catalogue').getAttribute('href')).toBe(
      '/catalogue/srv/eng/catalog.search#/metadata/urban-atlas',
    );
  });
});
