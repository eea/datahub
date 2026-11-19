import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BASE_PATH } from '@geocat/frontend-api-client';
import { firstValueFrom } from 'rxjs';

import { DatasetFilesService } from './dataset-files.service';

describe('DatasetFilesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BASE_PATH, useValue: '/catalogue' },
      ],
    });
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('reads the files of a dataset from its attachments', async () => {
    const files = firstValueFrom(TestBed.inject(DatasetFilesService).files('a'));
    const request = TestBed.inject(HttpTestingController).expectOne(
      '/catalogue/srv/api/records/a/attachments',
    );

    expect(request.request.headers.get('Accept')).toBe('application/json');
    request.flush([
      {
        approved: true,
        filename: 'GPKG/a.gpkg',
        lastModification: 1794405502000,
        mimeType: 'application/x-geopackage',
        size: 4153344,
        url: 'https://host/catalogue/srv/api/records/a/attachments/GPKG/a.gpkg',
        visibility: 'PUBLIC',
      },
    ]);

    expect(await files).toEqual([
      {
        path: 'GPKG/a.gpkg',
        size: 4153344,
        modified: 1794405502000,
        url: 'https://host/catalogue/srv/api/records/a/attachments/GPKG/a.gpkg',
      },
    ]);
  });
});
