import { formatDate } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  LOCALE_ID,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { OgcApiRecordsRecordGeoJSONDto } from '@geocat/frontend-api-client';
import { RECORD_SLUG } from '@geocat/frontend-library';
import { TranslatePipe } from '@ngx-translate/core';
import { Tag } from '@openng/optimus-ui/tag';

import { RECORD_DATE_FORMAT } from '../../record-details/record-date-format';

const NEW_FOR_DAYS = 30;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

interface EeaRecordProperties {
  issued?: string[];
  eeaTopics?: string[];
}

interface CardDetail {
  key: 'organisation' | 'published' | 'topic' | 'formats';
  text: string;
}

@Component({
  selector: 'app-result-card',
  imports: [RouterLink, TranslatePipe, Tag],
  templateUrl: './result-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultCard {
  readonly record = input.required<OgcApiRecordsRecordGeoJSONDto>();

  private readonly locale = inject(LOCALE_ID);

  private readonly properties = computed(
    () =>
      this.record().properties as OgcApiRecordsRecordGeoJSONDto['properties'] & EeaRecordProperties,
  );

  protected readonly detailsLink = computed(() => ['/', RECORD_SLUG, this.record().id]);

  protected readonly title = computed(() => this.properties().title ?? '');

  protected readonly description = computed(() => this.properties().description ?? '');

  private readonly published = computed(() => this.properties().issued?.[0]);

  protected readonly isNew = computed(() => {
    const published = Date.parse(this.published() ?? '');
    return published >= Date.now() - NEW_FOR_DAYS * DAY_IN_MS;
  });

  protected readonly details = computed<CardDetail[]>(() => {
    const published = this.published();
    const properties = this.properties();
    const details: CardDetail[] = [
      { key: 'organisation', text: properties.orgForResource?.[0] ?? '' },
      {
        key: 'published',
        text: published ? formatDate(published, RECORD_DATE_FORMAT, this.locale) : '',
      },
      { key: 'topic', text: properties.eeaTopics?.[0] ?? '' },
      {
        key: 'formats',
        text: [...new Set((properties.formats ?? []).flatMap((format) => format.name ?? []))].join(
          ', ',
        ),
      },
    ];
    return details.filter((detail) => detail.text);
  });
}
