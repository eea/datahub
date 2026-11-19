import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { Observable, of, Subject, throwError } from 'rxjs';

import { DatasetFiles } from './dataset-files';
import { DatasetFile, DatasetFilesService } from './dataset-files.service';
import { Dataset } from './series-datasets.service';

describe('DatasetFiles', () => {
  const files = vi.fn<(id: string) => Observable<DatasetFile[]>>();

  const dataset: Dataset = {
    id: 'a',
    title: 'Dataset a',
    formats: [],
    downloads: [{ href: 'https://sdi/data/a', isDoi: false }],
    links: [],
    overviews: ['https://host/a/overview.png'],
    factsheetUrl: '/catalogue/srv/api/records/a/formatters/xsl-view?output=pdf',
    superseded: false,
  };

  const file = (path: string, size = 4096, modified?: number): DatasetFile => ({
    path,
    size,
    modified,
    url: `https://host/a/${path}`,
  });

  async function render(item = dataset): Promise<ComponentFixture<DatasetFiles>> {
    const fixture = TestBed.createComponent(DatasetFiles);
    fixture.componentRef.setInput('dataset', item);
    await fixture.whenStable();
    return fixture;
  }

  const all = (fixture: ComponentFixture<DatasetFiles>, testId: string): HTMLElement[] => [
    ...fixture.nativeElement.querySelectorAll(`[data-testid="${testId}"]`),
  ];

  const texts = (fixture: ComponentFixture<DatasetFiles>, testId: string) =>
    all(fixture, testId).map((element) => element.textContent?.trim());

  const folderRow = (fixture: ComponentFixture<DatasetFiles>, name: string) =>
    all(fixture, 'dataset-file-row').find(
      (row) => row.querySelector('[data-testid="dataset-folder"]')?.textContent?.trim() === name,
    );

  beforeEach(async () => {
    files.mockReset();
    await TestBed.configureTestingModule({
      imports: [DatasetFiles],
      providers: [provideTranslateService(), { provide: DatasetFilesService, useValue: { files } }],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      find: {
        recordDetails: {
          datasets: {
            directDownload: 'Direct download',
            files: { fileCount: '{{count}} files', oneFile: '1 file' },
          },
        },
      },
    });
    translate.use('en');
  });

  it('asks for the files of its dataset', async () => {
    files.mockReturnValue(of([]));

    await render();

    expect(files).toHaveBeenCalledExactlyOnceWith('a');
  });

  it('shows a placeholder while the files load', async () => {
    files.mockReturnValue(new Subject<DatasetFile[]>());

    const fixture = TestBed.createComponent(DatasetFiles);
    fixture.componentRef.setInput('dataset', dataset);
    fixture.detectChanges();

    expect(all(fixture, 'dataset-files-loading')).toHaveLength(1);
    expect(all(fixture, 'dataset-files')).toHaveLength(0);
    expect(all(fixture, 'dataset-download')).toHaveLength(0);
  });

  it('lists folders collapsed with their file count, then the files', async () => {
    files.mockReturnValue(
      of([
        file('GPKG/a.gpkg'),
        file('GPKG/b.gpkg'),
        file('GDB/x.atx'),
        file('README.md', 4096, Date.UTC(2024, 1, 10, 12)),
      ]),
    );

    const fixture = await render();

    expect(texts(fixture, 'dataset-folder')).toEqual(['GDB', 'GPKG']);
    expect(texts(fixture, 'dataset-file')).toEqual(['README.md']);
    expect(texts(fixture, 'dataset-file-size')).toEqual(['1 file', '2 files', '4 KB']);
    expect(fixture.nativeElement.textContent).toContain('10 Feb 2024');
  });

  it('downloads a file from its own link', async () => {
    files.mockReturnValue(of([file('README.md')]));

    const fixture = await render();
    const [link] = all(fixture, 'dataset-file');

    expect(link.getAttribute('href')).toBe('https://host/a/README.md');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('opens a folder when its row is clicked', async () => {
    files.mockReturnValue(of([file('GPKG/a.gpkg'), file('GPKG/b.gpkg')]));
    const fixture = await render();

    folderRow(fixture, 'GPKG')?.click();
    await fixture.whenStable();

    expect(texts(fixture, 'dataset-file')).toEqual(['a.gpkg', 'b.gpkg']);

    folderRow(fixture, 'GPKG')?.click();
    await fixture.whenStable();

    expect(texts(fixture, 'dataset-file')).toEqual([]);
  });

  it('hides and shows the files and the download links from the header', async () => {
    files.mockReturnValue(of([file('README.md')]));
    const fixture = await render();
    const [toggle] = all(fixture, 'dataset-files-toggle');

    toggle.click();
    await fixture.whenStable();

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(all(fixture, 'dataset-file')).toHaveLength(0);
    expect(all(fixture, 'dataset-download')).toHaveLength(0);

    toggle.click();
    await fixture.whenStable();

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(texts(fixture, 'dataset-file')).toEqual(['README.md']);
    expect(texts(fixture, 'dataset-download')).toEqual(['Direct download']);
  });

  it('names the table with a heading and hides the icon column from screen readers', async () => {
    files.mockReturnValue(of([file('README.md')]));
    const fixture = await render();
    const [toggle] = all(fixture, 'dataset-files-toggle');
    const headers: HTMLElement[] = [...fixture.nativeElement.querySelectorAll('th')];

    expect(toggle.closest('[role="heading"]')?.getAttribute('aria-level')).toBe('3');
    expect(headers.filter((header) => header.getAttribute('aria-hidden') !== 'true')).toHaveLength(
      3,
    );
  });

  it('leaves out the overview image of the record', async () => {
    files.mockReturnValue(of([file('overview.png'), file('README.md')]));

    const fixture = await render();

    expect(texts(fixture, 'dataset-file')).toEqual(['README.md']);
  });

  it('recognises the overview image when its link carries a query', async () => {
    files.mockReturnValue(of([file('overview.png'), file('README.md')]));

    const fixture = await render({
      ...dataset,
      overviews: ['https://host/a/overview.png?approved=true'],
    });

    expect(texts(fixture, 'dataset-file')).toEqual(['README.md']);
  });

  it('lists the download links under the files without a second heading', async () => {
    files.mockReturnValue(of([file('README.md')]));

    const fixture = await render();

    expect(texts(fixture, 'dataset-file')).toEqual(['README.md']);
    expect(texts(fixture, 'dataset-download')).toEqual(['Direct download']);
    expect(all(fixture, 'dataset-download-heading')).toHaveLength(0);
  });

  it('falls back to the download links when the dataset has no files', async () => {
    files.mockReturnValue(of([file('overview.png')]));

    const fixture = await render();

    expect(all(fixture, 'dataset-files')).toHaveLength(0);
    expect(all(fixture, 'dataset-download-heading')).toHaveLength(1);
    expect(texts(fixture, 'dataset-download')).toEqual(['Direct download']);
  });

  it('falls back to the download links when the files cannot be loaded', async () => {
    files.mockReturnValue(throwError(() => new Error('500')));

    const fixture = await render();

    expect(all(fixture, 'dataset-files')).toHaveLength(0);
    expect(texts(fixture, 'dataset-download')).toEqual(['Direct download']);
  });
});
