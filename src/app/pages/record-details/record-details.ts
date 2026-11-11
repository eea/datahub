import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  BASE_PATH,
  OgcApiRecordsRecordGeoJSONDto,
  RecordService,
} from '@geocat/frontend-api-client';
import { COLLECTION_ID, RecordSkeleton, SearchStateService } from '@geocat/frontend-library';
import { TranslatePipe } from '@ngx-translate/core';
import { Message } from '@openng/optimus-ui/message';
import { Observable, of } from 'rxjs';

import { Footer } from '../../footer/footer';
import { Header } from '../../header/header';
import { RecordDatasets } from './record-datasets/record-datasets';
import { RecordMoreInformation } from './record-more-information/record-more-information';

const DESCRIPTION_PREVIEW_LENGTH = 220;

interface RecordDates {
  issued?: string[];
}

@Component({
  selector: 'app-record-details',
  imports: [
    DatePipe,
    RouterLink,
    TranslatePipe,
    Message,
    RecordSkeleton,
    Footer,
    Header,
    RecordDatasets,
    RecordMoreInformation,
  ],
  templateUrl: './record-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordDetails {
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  recordUuid = signal('');
  recordService = inject(RecordService);
  private collectionId = inject(COLLECTION_ID);
  private searchQuery = inject(SearchStateService).query;
  protected readonly rssUrl = `${inject(BASE_PATH)}/rss`;
  protected readonly resultsQueryParams = computed(() => {
    const query = this.searchQuery();
    return query ? { q: query } : {};
  });

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

  record = computed(() =>
    this.recordResource.hasValue() ? this.recordResource.value() : undefined,
  );
  recordStatus = computed(() =>
    this.recordResource.error() ? 'record.view.notFoundOrNotShared' : undefined,
  );

  protected readonly childUuids = computed(
    () => (this.record()?.properties as { childUuid?: string[] } | undefined)?.childUuid ?? [],
  );

  protected readonly published = computed(
    () => (this.record()?.properties as RecordDates | undefined)?.issued?.[0],
  );

  private description = computed(() => this.record()?.properties?.description ?? '');
  protected readonly isDescriptionLong = computed(
    () => this.description().length > DESCRIPTION_PREVIEW_LENGTH,
  );
  protected readonly isDescriptionExpanded = signal(false);
  protected readonly visibleDescription = computed(() =>
    this.isDescriptionLong() && !this.isDescriptionExpanded()
      ? `${this.description().slice(0, DESCRIPTION_PREVIEW_LENGTH).trim()}…`
      : this.description(),
  );
}
