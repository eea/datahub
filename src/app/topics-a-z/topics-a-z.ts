import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FilterOption, SearchService } from '@geocat/frontend-library';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';

import { EeaTopicsSearch } from '../eea-topics-search';
import { EEA_TOPICS } from '../search-filters';

export interface TopicLetter {
  letter: string;
  topics: FilterOption[];
}

const letterOf = (label: string) =>
  label.normalize('NFD').replace(/\p{M}/gu, '').charAt(0).toUpperCase();

export function groupByLetter(options: FilterOption[]): TopicLetter[] {
  const sorted = [...options].sort((a, b) =>
    a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }),
  );
  return sorted.reduce<TopicLetter[]>((letters, topic) => {
    const letter = letterOf(topic.label);
    const last = letters.at(-1);
    return last?.letter === letter
      ? [...letters.slice(0, -1), { letter, topics: [...last.topics, topic] }]
      : [...letters, { letter, topics: [topic] }];
  }, []);
}

@Component({
  selector: 'app-topics-a-z',
  imports: [TranslatePipe],
  templateUrl: './topics-a-z.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicsAZ {
  private readonly eeaTopicsSearch = inject(EeaTopicsSearch);

  private readonly topics = toSignal(
    inject(SearchService)
      .search({ page: 1, pageSize: 1 })
      .pipe(map((result) => (result.failed ? null : (result.facets[EEA_TOPICS] ?? [])))),
  );

  protected readonly loading = computed(() => this.topics() === undefined);
  protected readonly failed = computed(() => this.topics() === null);
  protected readonly letters = computed(() => groupByLetter(this.topics() ?? []));

  protected open(event: MouseEvent, topic: FilterOption): void {
    this.eeaTopicsSearch.open(event, [topic.value]);
  }
}
