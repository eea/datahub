import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_PATH } from '@geocat/frontend-api-client';
import { map, Observable } from 'rxjs';

import { attachmentsUrl } from '../gn4-links';

export interface DatasetFile {
  path: string;
  size: number;
  modified?: number;
  url: string;
}

interface AttachmentDto {
  filename: string;
  size: number;
  lastModification?: number;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class DatasetFilesService {
  private readonly http = inject(HttpClient);
  private readonly basePath = inject(BASE_PATH);

  files(datasetId: string): Observable<DatasetFile[]> {
    return this.http
      .get<AttachmentDto[]>(attachmentsUrl(this.basePath, datasetId), {
        headers: { Accept: 'application/json' },
      })
      .pipe(
        map((attachments) =>
          attachments.map(({ filename, size, lastModification, url }) => ({
            path: filename,
            size,
            modified: lastModification,
            url,
          })),
        ),
      );
  }
}
