import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { NEVER, Observable, of, throwError } from 'rxjs';

import { RecordDatasets } from './record-datasets';
import { Dataset, SeriesDatasetsService } from './series-datasets.service';

describe('RecordDatasets', () => {
  const datasets = vi.fn<(ids: string[]) => Observable<Dataset[]>>();

  const dataset = (id: string, superseded = false): Dataset => ({
    id,
    title: `Dataset ${id}`,
    formats: [],
    startYear: 2020,
    endYear: 2022,
    downloads: [],
    links: [],
    factsheetUrl: `/catalogue/srv/api/records/${id}/formatters/xsl-view?output=pdf`,
    superseded,
  });

  async function render(): Promise<ComponentFixture<RecordDatasets>> {
    const fixture = TestBed.createComponent(RecordDatasets);
    fixture.componentRef.setInput('childUuids', ['a', 'b']);
    await fixture.whenStable();
    return fixture;
  }

  const datasetIds = (fixture: ComponentFixture<RecordDatasets>, block: string): string[] =>
    [
      ...fixture.nativeElement.querySelectorAll(`[data-testid="${block}"] [data-testid="dataset"]`),
    ].map((panel: HTMLElement) => panel.id);

  const byTestId = (fixture: ComponentFixture<RecordDatasets>, testId: string) =>
    fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);

  beforeEach(async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      },
    );
    datasets.mockReset();
    await TestBed.configureTestingModule({
      imports: [RecordDatasets],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: ActivatedRoute, useValue: { fragment: of(null), snapshot: { fragment: null } } },
        { provide: SeriesDatasetsService, useValue: { datasets } },
      ],
    }).compileComponents();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('shows a placeholder while the datasets load', () => {
    datasets.mockReturnValue(NEVER);
    const fixture = TestBed.createComponent(RecordDatasets);
    fixture.componentRef.setInput('childUuids', ['a', 'b']);
    fixture.detectChanges();

    expect(byTestId(fixture, 'datasets-loading')).not.toBeNull();
    expect(byTestId(fixture, 'record-datasets')).toBeNull();
  });

  it('lists superseded datasets in a block of their own', async () => {
    datasets.mockReturnValue(of([dataset('current'), dataset('old', true)]));
    const fixture = await render();

    expect(datasetIds(fixture, 'record-datasets')).toEqual(['current']);
    expect(datasetIds(fixture, 'superseded-datasets')).toEqual(['old']);
  });

  it('shows no superseded block when every dataset is current', async () => {
    datasets.mockReturnValue(of([dataset('current')]));
    const fixture = await render();

    expect(byTestId(fixture, 'record-datasets')).not.toBeNull();
    expect(byTestId(fixture, 'superseded-datasets')).toBeNull();
  });

  it('shows only the superseded block when no dataset is current', async () => {
    datasets.mockReturnValue(of([dataset('old', true)]));
    const fixture = await render();

    expect(byTestId(fixture, 'record-datasets')).toBeNull();
    expect(datasetIds(fixture, 'superseded-datasets')).toEqual(['old']);
  });

  it('says so when the datasets could not be loaded', async () => {
    datasets.mockReturnValue(throwError(() => new Error('500')));
    const fixture = await render();

    expect(fixture.nativeElement.querySelector('p-message')).not.toBeNull();
    expect(byTestId(fixture, 'record-datasets')).toBeNull();
  });
});
