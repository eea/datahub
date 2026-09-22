import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Card } from '@openng/optimus-ui/card';
import { Message } from '@openng/optimus-ui/message';
import { OgcApiRecordsRecordGeoJSONDto, RecordService } from 'gn-api-client';
import { Header, RecordFieldTitle, RecordSkeleton } from 'gn-library';
import { Observable, of } from 'rxjs';

const COLLECTION_ID = '3bef299d-cf82-4033-871b-875f6936b2e2';

@Component({
  selector: 'app-record-details',
  imports: [Header, TranslatePipe, Message, Card, RecordFieldTitle, RecordSkeleton],
  templateUrl: './record-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordDetails {
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  recordUuid = signal('');
  recordService = inject(RecordService);

  constructor() {
    this.activatedRoute.params.subscribe((params) => this.recordUuid.set(params['uuid']));
  }

  recordResource = rxResource({
    params: () => ({ uuid: this.recordUuid() }),
    stream: ({ params }) => {
      const uuid = params['uuid'];

      if (!uuid) return of(undefined);

      return this.recordService.getRecord(
        COLLECTION_ID,
        this.recordUuid(),
      ) as Observable<OgcApiRecordsRecordGeoJSONDto>;
    },
  });

  record = computed(() => this.recordResource.value());
  recordStatus = computed(() =>
    this.recordResource.error() ? 'record.view.notFoundOrNotShared' : undefined,
  );
}
