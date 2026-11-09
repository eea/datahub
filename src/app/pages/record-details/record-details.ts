import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BASE_PATH,
  OgcApiRecordsRecordGeoJSONDto,
  RecordService,
} from '@geocat/frontend-api-client';
import {
  COLLECTION_ID,
  DEFAULT_SPACE,
  RecordFieldTitle,
  RecordSkeleton,
} from '@geocat/frontend-library';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { Card } from '@openng/optimus-ui/card';
import { Message } from '@openng/optimus-ui/message';
import { Observable, of } from 'rxjs';

import { Footer } from '../../footer/footer';
import { Header } from '../../header/header';
import { Share } from '../../share/share';

@Component({
  selector: 'app-record-details',
  imports: [
    TranslatePipe,
    Message,
    Card,
    ButtonDirective,
    RecordFieldTitle,
    RecordSkeleton,
    Footer,
    Header,
    Share,
  ],
  templateUrl: './record-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordDetails {
  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  recordUuid = signal('');
  recordService = inject(RecordService);
  private collectionId = inject(COLLECTION_ID);
  private basePath = inject(BASE_PATH);

  constructor() {
    this.activatedRoute.params.subscribe((params) => this.recordUuid.set(params['uuid']));
  }

  recordResource = rxResource({
    params: () => ({ uuid: this.recordUuid() }),
    stream: ({ params }) => {
      const uuid = params['uuid'];

      if (!uuid) return of(undefined);

      return this.recordService.getRecord(
        this.collectionId,
        this.recordUuid(),
      ) as Observable<OgcApiRecordsRecordGeoJSONDto>;
    },
  });

  record = computed(() => this.recordResource.value());
  recordStatus = computed(() =>
    this.recordResource.error() ? 'record.view.notFoundOrNotShared' : undefined,
  );
  gn4RecordUrl = computed(
    () => `${this.basePath}/${DEFAULT_SPACE}/eng/catalog.search#/metadata/${this.recordUuid()}`,
  );

  protected goHome(): void {
    this.router.navigate(['/home']);
  }
}
