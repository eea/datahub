import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FilterOption, SearchService, SearchStateService } from '@geocat/frontend-library';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';

const EEA_TOPICS = 'eeaTopics';

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
  private readonly router = inject(Router);
  private readonly searchState = inject(SearchStateService);

  private readonly topics = toSignal(
    inject(SearchService)
      .search({ page: 1, pageSize: 1 })
      .pipe(map((result) => (result.failed ? null : (result.facets[EEA_TOPICS] ?? [])))),
  );

  protected readonly loading = computed(() => this.topics() === undefined);
  protected readonly failed = computed(() => this.topics() === null);
  protected readonly letters = computed(() => groupByLetter(this.topics() ?? []));

  protected open(event: MouseEvent, topic: FilterOption): void {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    this.searchState.setQuery('');
    this.searchState.clearFilters();
    this.searchState.setFilter(EEA_TOPICS, { included: [topic.value], excluded: [] });
    this.router.navigate(['/search']);
  }
}
