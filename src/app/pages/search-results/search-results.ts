import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { OgcApiRecordsRecordGeoJSONDto } from '@geocat/frontend-api-client';
import {
  DEFAULT_PAGE_SIZE,
  RecordCard,
  SearchPanel,
  SearchService,
  SearchStateService,
} from '@geocat/frontend-library';
import { TranslatePipe } from '@ngx-translate/core';
import { Message } from '@openng/optimus-ui/message';

import { Footer } from '../../footer/footer';
import { Header } from '../../header/header';
import { seriesOnly } from '../../series-only';

/** Page buttons the paginator shows at once. */
const PAGE_WINDOW = 7;

@Component({
  selector: 'app-search-results',
  imports: [TranslatePipe, SearchPanel, RecordCard, Message, Footer, Header],
  templateUrl: './search-results.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResults implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly searchService = inject(SearchService);
  private readonly searchState = inject(SearchStateService);
  private readonly destroyRef = inject(DestroyRef);

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

  ngOnInit(): void {
    // A `q` in the URL wins, so a shared link searches for what it says. Everything else the
    // panel shows — filters, sort, date range — is whatever the shared state already holds,
    // which is how a search started on the landing page arrives here intact.
    const queryParam = this.route.snapshot.queryParamMap.get('q') ?? '';
    if (queryParam !== this.searchState.query()) {
      this.searchState.setQuery(queryParam);
    }
    this.runSearch();
  }

  /** Collect current search state and fetch a fresh page of results + facet counts. */
  private runSearch(): void {
    this.loading.set(true);
    this.searchService
      .search(seriesOnly(this.searchState.toParams(this.currentPage(), this.pageSize)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.records.set(result.records);
        this.total.set(result.total);
        this.failed.set(result.failed);
        this.searchState.applyFacets(result.facets);
        this.loading.set(false);
      });
  }

  protected goHome(): void {
    this.router.navigate(['/home']);
  }

  /** The panel changed the search: back to the first page and fetch again. */
  protected onSearchChange(): void {
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
}
