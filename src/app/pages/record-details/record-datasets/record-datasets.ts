import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { Message } from '@openng/optimus-ui/message';

import { DatasetPeriods } from './dataset-periods';
import { SeriesDatasetsService } from './series-datasets.service';

@Component({
  selector: 'app-record-datasets',
  imports: [TranslatePipe, Message, DatasetPeriods],
  templateUrl: './record-datasets.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordDatasets {
  readonly childUuids = input.required<string[]>();

  private readonly datasetsApi = inject(SeriesDatasetsService);

  protected readonly datasetsResource = rxResource({
    params: () => ({ ids: this.childUuids() }),
    stream: ({ params }) => this.datasetsApi.datasets(params.ids),
  });

  private readonly datasets = computed(() =>
    this.datasetsResource.hasValue() ? this.datasetsResource.value() : [],
  );
  protected readonly currentDatasets = computed(() =>
    this.datasets().filter((dataset) => !dataset.superseded),
  );
  protected readonly supersededDatasets = computed(() =>
    this.datasets().filter((dataset) => dataset.superseded),
  );
}
