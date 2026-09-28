import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Message } from '@openng/optimus-ui/message';
import { OgcApiRecordsRecordGeoJSONDto } from 'gn-api-client';
import {
  AVAILABLE_IN_OPTIONS,
  CREATION_YEAR_OPTIONS,
  DateFilterDropdown,
  DateRange,
  DEFAULT_PAGE_SIZE,
  FilterChip,
  FilterDropdown,
  FilterOption,
  FilterSelection,
  LanguageSwitcher,
  RecordCard,
  RESOURCE_TYPE_OPTIONS,
  SCALES_RANGES,
  SearchBarWithChips,
  SearchParams,
  SearchService,
  SORT_OPTIONS,
  SortDropdown,
  SortKey,
} from 'gn-library';

/** The filters this page offers. Drives the state, the option lists and the chips. */
const FILTER_KEYS = [
  'resourceType',
  'organization',
  'format',
  'availableIn',
  'keywords',
  'updated',
  'scales',
  'creationYear',
  'spatialRepresentationType',
] as const;

type FilterKey = (typeof FILTER_KEYS)[number];

interface FilterState {
  included: WritableSignal<string[]>;
  excluded: WritableSignal<string[]>;
}

/** Page buttons the paginator shows at once. */
const PAGE_WINDOW = 7;

@Component({
  selector: 'app-search-results',
  imports: [
    TranslatePipe,
    SearchBarWithChips,
    RecordCard,
    FilterDropdown,
    DateFilterDropdown,
    SortDropdown,
    LanguageSwitcher,
    Message,
  ],
  templateUrl: './search-results.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResults implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly searchService = inject(SearchService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly query = signal('');
  protected readonly chips = signal<FilterChip[]>([]);

  protected readonly records = signal<OgcApiRecordsRecordGeoJSONDto[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(false);
  protected readonly failed = signal(false);

  protected readonly currentPage = signal(1);
  protected readonly pageSize = DEFAULT_PAGE_SIZE;
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize)),
  );
  /** Windowed page list for the paginator, shifted back when it would run past the last page. */
  protected readonly pages = computed<number[]>(() => {
    const count = this.pageCount();
    if (count <= PAGE_WINDOW) return Array.from({ length: count }, (_unused, index) => index + 1);
    const start = Math.min(Math.max(1, this.currentPage() - 3), count - PAGE_WINDOW + 1);
    return Array.from({ length: PAGE_WINDOW }, (_unused, index) => start + index);
  });

  /** Extra filters stay hidden behind the All Filters toggle. */
  protected readonly showAllFilters = signal(false);

  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly selectedSort = signal<SortKey>('relevance');

  /** Included and excluded values per filter. The single source of truth for filter state. */
  protected readonly filters = Object.fromEntries(
    FILTER_KEYS.map((key) => [
      key,
      { included: signal<string[]>([]), excluded: signal<string[]>([]) },
    ]),
  ) as Record<FilterKey, FilterState>;

  /**
   * Option lists per filter. Resource Type, Available in, Scales and Creation Year start from
   * the design's fixed lists; the rest start empty and are filled from the API facets. Every
   * list is refreshed on each response (see applyFacets).
   */
  protected readonly options: Record<FilterKey, WritableSignal<FilterOption[]>> = {
    resourceType: signal<FilterOption[]>(RESOURCE_TYPE_OPTIONS),
    organization: signal<FilterOption[]>([]),
    format: signal<FilterOption[]>([]),
    availableIn: signal<FilterOption[]>(AVAILABLE_IN_OPTIONS),
    keywords: signal<FilterOption[]>([]),
    updated: signal<FilterOption[]>([]),
    // Shown without counts: both facets are histograms whose configured bucket interval
    // spans several of the design's ranges, so no per-range count can be derived.
    scales: signal<FilterOption[]>(SCALES_RANGES),
    creationYear: signal<FilterOption[]>(CREATION_YEAR_OPTIONS),
    spatialRepresentationType: signal<FilterOption[]>([]),
  };

  /** Date range as ISO 'YYYY-MM-DD' bounds (either may be undefined) for CQL `createDate`. */
  protected readonly dateFrom = signal<string | undefined>(undefined);
  protected readonly dateTo = signal<string | undefined>(undefined);

  ngOnInit(): void {
    const queryParam = this.route.snapshot.queryParamMap.get('q') ?? '';
    if (queryParam) {
      this.query.set(queryParam);
      this.chips.set([{ id: 'query-1', label: queryParam, type: 'query' }]);
    }
    this.runSearch();
  }

  /** Collect current UI state and fetch a fresh page of results + facet counts. */
  private runSearch(): void {
    this.loading.set(true);
    const params: SearchParams = {
      query: this.query(),
      page: this.currentPage(),
      pageSize: this.pageSize,
      resourceTypes: this.selectionOf('resourceType'),
      keywords: this.selectionOf('keywords'),
      organizations: this.selectionOf('organization'),
      updateFrequencies: this.selectionOf('updated'),
      scales: this.selectionOf('scales'),
      formats: this.selectionOf('format'),
      availableIn: this.selectionOf('availableIn'),
      creationYears: this.selectionOf('creationYear'),
      spatialRepresentationTypes: this.selectionOf('spatialRepresentationType'),
      dateFrom: this.dateFrom(),
      dateTo: this.dateTo(),
      sort: this.selectedSort(),
    };

    this.searchService
      .search(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.records.set(result.records);
        this.total.set(result.total);
        this.failed.set(result.failed);
        this.applyFacets(result.facets);
        this.loading.set(false);
      });
  }

  /** One filter's current included/excluded values, in the shape the service expects. */
  private selectionOf(filterKey: FilterKey): FilterSelection {
    const state = this.filters[filterKey];
    return { included: state.included(), excluded: state.excluded() };
  }

  private applyFacets(facets: Record<string, FilterOption[]>): void {
    // Controlled filters: fixed design list, live counts overlaid (0 where the data has none).
    this.options.resourceType.set(this.withCounts(RESOURCE_TYPE_OPTIONS, facets['resourceType']));
    this.options.availableIn.set(this.availableInWithCounts(facets['availableIn']));
    // Data-driven filters: values and counts straight from the API facets.
    this.options.organization.set(facets['organization'] ?? []);
    this.options.format.set(facets['format'] ?? []);
    this.options.keywords.set(facets['keywords'] ?? []);
    this.options.updated.set(facets['updated'] ?? []);
    this.options.spatialRepresentationType.set(facets['spatialRepresentationType'] ?? []);
  }

  /** Overlay live facet counts (matched by value) onto a fixed design option list. */
  private withCounts(fixed: FilterOption[], live?: FilterOption[]): FilterOption[] {
    const counts = new Map(
      (live ?? []).map((option) => [option.value.toLowerCase(), option.count ?? 0]),
    );
    return fixed.map((option) => ({
      value: option.value,
      label: option.label,
      count: counts.get(option.value.toLowerCase()) ?? 0,
    }));
  }

  /** Available-in design options matched to their API facet value for live counts. */
  private availableInWithCounts(live?: FilterOption[]): FilterOption[] {
    const counts = new Map((live ?? []).map((option) => [option.value, option.count ?? 0]));
    return AVAILABLE_IN_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
      count: counts.get(option.apiValue) ?? 0,
    }));
  }

  protected toggleAllFilters(): void {
    this.showAllFilters.update((shown) => !shown);
  }

  protected goHome(): void {
    this.router.navigate(['/home']);
  }

  protected onSearch(event: { query: string; chips: FilterChip[] }): void {
    this.query.set(event.query);
    this.syncQueryChip(event.query);
    this.currentPage.set(1);
    this.runSearch();
  }

  protected onSortChange(value: string): void {
    this.selectedSort.set(value as SortKey);
    this.currentPage.set(1);
    this.runSearch();
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.pageCount() || page === this.currentPage()) return;
    this.currentPage.set(page);
    this.runSearch();
  }

  protected prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  private syncQueryChip(query: string): void {
    const withoutQuery = this.chips().filter((chip) => chip.type !== 'query');
    this.chips.set(
      query ? [{ id: 'query-1', label: query, type: 'query' }, ...withoutQuery] : withoutQuery,
    );
  }

  protected onChipRemove(chipId: string): void {
    const chip = this.chips().find((chip) => chip.id === chipId);
    if (!chip) return;
    this.chips.update((chips) => chips.filter((chip) => chip.id !== chipId));
    if (chip.type === 'query') {
      this.query.set('');
    } else if (this.isFilterKey(chip.filterType) && chip.value) {
      this.removeFilterValue(chip.filterType, chip.value, chip.type === 'excluded');
    }
    this.currentPage.set(1);
    this.runSearch();
  }

  private removeFilterValue(filterKey: FilterKey, value: string, isExcluded: boolean): void {
    const side = isExcluded ? this.filters[filterKey].excluded : this.filters[filterKey].included;
    side.update((values) => values.filter((item) => item !== value));
  }

  protected onFilterChange(filterKey: FilterKey, selection: FilterSelection): void {
    this.filters[filterKey].included.set(selection.included);
    this.filters[filterKey].excluded.set(selection.excluded);

    const options = this.options[filterKey]();
    const label = (value: string) =>
      options.find((option) => option.value === value)?.label ?? value;
    this.chips.set([
      ...this.chips().filter((chip) => chip.filterType !== filterKey),
      ...selection.included.map((value) => ({
        id: `${filterKey}-inc-${value}`,
        label: label(value),
        type: 'filter' as const,
        filterType: filterKey,
        value,
      })),
      ...selection.excluded.map((value) => ({
        id: `${filterKey}-exc-${value}`,
        label: label(value),
        type: 'excluded' as const,
        filterType: filterKey,
        value,
      })),
    ]);
    this.currentPage.set(1);
    this.runSearch();
  }

  protected onDateRangeChange(range: DateRange | null): void {
    this.dateFrom.set(this.toRangeStart(range?.startYear, range?.startMonth));
    this.dateTo.set(this.toRangeEnd(range?.endYear, range?.endMonth));
    this.currentPage.set(1);
    this.runSearch();
  }

  /** First day of the start month as 'YYYY-MM-DD' (undefined when no start is picked). */
  private toRangeStart(year?: number, month?: number): string | undefined {
    if (year === undefined || month === undefined) return undefined;
    return `${year}-${this.pad(month + 1)}-01`;
  }

  /** Last day of the end month as 'YYYY-MM-DD' (undefined when no end is picked). */
  private toRangeEnd(year?: number, month?: number): string | undefined {
    if (year === undefined || month === undefined) return undefined;
    const lastDay = new Date(year, month + 1, 0).getDate();
    return `${year}-${this.pad(month + 1)}-${this.pad(lastDay)}`;
  }

  private pad(value: number): string {
    return String(value).padStart(2, '0');
  }

  private isFilterKey(value: string | undefined): value is FilterKey {
    return !!value && FILTER_KEYS.includes(value as FilterKey);
  }
}
