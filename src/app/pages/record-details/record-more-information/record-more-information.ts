import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BASE_PATH, OgcApiRecordsRecordGeoJSONDto } from '@geocat/frontend-api-client';
import { TranslatePipe } from '@ngx-translate/core';

import { catalogueRecordUrl, factsheetUrl } from '../gn4-links';
import { formatYearRange, RecordTime, yearRange } from '../year-range';

const REPORTING_OBLIGATIONS_SCHEME = 'rod-eionet-europa-eu';

interface ReportingObligation {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-record-more-information',
  imports: [TranslatePipe],
  templateUrl: './record-more-information.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordMoreInformation {
  readonly record = input.required<OgcApiRecordsRecordGeoJSONDto>();

  private readonly basePath = inject(BASE_PATH);

  protected readonly reportingObligations = computed<ReportingObligation[]>(() =>
    (this.record().properties.themes ?? [])
      .filter((theme) => theme.scheme.endsWith(REPORTING_OBLIGATIONS_SCHEME))
      .flatMap((theme) => theme.concepts)
      .map((concept) => ({ label: concept.title ?? concept.id, url: concept.url })),
  );

  protected readonly temporalCoverage = computed(() => {
    const years = yearRange(this.record().time as RecordTime | undefined);
    return years && formatYearRange(years);
  });

  protected readonly organisations = computed(() =>
    [...new Set(this.record().properties.orgForResource ?? [])].join(', '),
  );

  protected readonly factsheetUrl = computed(() => factsheetUrl(this.basePath, this.record().id));
  protected readonly catalogueUrl = computed(() =>
    catalogueRecordUrl(this.basePath, this.record().id),
  );
}
