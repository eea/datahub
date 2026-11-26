import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { ActiveFilterGroup, ActiveFilterValue, SearchStateService } from '@geocat/frontend-library';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-active-filters-panel',
  imports: [TranslatePipe],
  templateUrl: './active-filters-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ActiveFiltersPanel {
  private readonly state = inject(SearchStateService);

  readonly filtersChange = output<void>();

  protected readonly expanded = signal(true);
  protected readonly groups = computed(() =>
    this.state.activeFilterGroups().filter((group) => group.values.length > 0),
  );

  protected toggle(): void {
    this.expanded.update((expanded) => !expanded);
  }

  protected remove(group: ActiveFilterGroup, value: ActiveFilterValue): void {
    this.state.removeFilter({ key: group.key, value: value.value, excluded: !!value.excluded });
    this.filtersChange.emit();
  }

  protected clearAll(): void {
    this.state.clearFilters();
    this.filtersChange.emit();
  }
}
