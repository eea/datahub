import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecordsService } from '@geocat/frontend-api-client';
import {
  COLLECTION_ID,
  SearchPanel,
  SearchService,
  SearchStateService,
  StatCard,
} from '@geocat/frontend-library';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';

import { DomainTree } from '../../domain-tree/domain-tree';
import { Footer } from '../../footer/footer';
import { Header } from '../../header/header';
import { Share } from '../../share/share';
import { TopicTiles } from '../../topic-tiles/topic-tiles';

/**
 * The landing panel needs facet options and counts but shows no results, so it asks for the
 * smallest page the API will serve and keeps only the facets.
 */
const FACETS_ONLY_PAGE_SIZE = 1;

/** The resource types the "in numbers" block counts, in display order. */
const STAT_TYPES = [
  { resourceType: 'series', labelKey: 'find.landing.stats.series' },
  { resourceType: 'dataset', labelKey: 'find.landing.stats.datasets' },
  { resourceType: 'nonGeographicDataset', labelKey: 'find.landing.stats.tabularDatasets' },
  { resourceType: 'featureCatalog', labelKey: 'find.landing.stats.featureCatalogs' },
];

/** Counts are shown rounded down to two significant digits: 2425 -> "2400+", 94 -> "94". */
export const roundedCount = (count: number): string => {
  if (count < 100) return String(count);
  const step = 10 ** (String(count).length - 2);
  return `${Math.floor(count / step) * step}+`;
};

@Component({
  selector: 'app-landing',
  imports: [
    FormsModule,
    SearchPanel,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TranslatePipe,
    DomainTree,
    Footer,
    Header,
    Share,
    TopicTiles,
    StatCard,
  ],
  templateUrl: './landing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing implements OnInit {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly searchService = inject(SearchService);
  private readonly searchState = inject(SearchStateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recordsApi = inject(RecordsService);
  private readonly collectionId = inject(COLLECTION_ID);

  protected readonly showAllTopics = signal(false);
  protected readonly isSignInModalOpen = signal(false);
  protected readonly signInError = signal('');
  protected readonly isSigningIn = signal(false);
  protected signInEmail = '';
  protected signInPassword = '';

  protected readonly stats = signal<{ value: string; labelKey: string }[]>([]);

  ngOnInit(): void {
    this.refreshFacets();
    this.loadStats();
  }

  /**
   * Counts for the whole catalogue, so this goes straight to the items endpoint: the app's
   * SearchService narrows every search to series. The `resourceType` facet carries the counts.
   */
  private loadStats(): void {
    this.recordsApi
      .getRecords(
        this.collectionId,
        undefined, // bbox
        undefined, // datetime
        String(FACETS_ONLY_PAGE_SIZE), // limit
        undefined, // offset
        undefined, // q
        undefined, // type
        undefined, // externalIds
        undefined, // ids
        undefined, // sortby
        undefined, // filter
        undefined, // filter-lang
        undefined, // filter-crs
        undefined, // profile
        'resourceType', // facets
        'body',
        false,
        { httpHeaderAccept: 'application/json' },
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const buckets: { value?: string; count?: number }[] =
            response['facets']?.resourceType?.buckets ?? [];
          // A type the facet doesn't report is left out rather than shown as "0"; with no
          // counts at all the block stays hidden.
          this.stats.set(
            STAT_TYPES.flatMap(({ resourceType, labelKey }) => {
              const count = buckets.find((b) => b.value === resourceType)?.count;
              return count ? [{ value: roundedCount(count), labelKey }] : [];
            }),
          );
        },
        // No numbers is better than wrong ones: the block stays hidden.
        error: () => this.stats.set([]),
      });
  }

  /** The panel already holds the query and filters, so the results page just has to open. */
  protected onSearch(): void {
    const query = this.searchState.query();
    this.router.navigate(['/search'], { queryParams: query ? { q: query } : {} });
  }

  /** Filters stay here until the user searches; only their counts need to be brought up to date. */
  protected onFiltersChange(): void {
    this.refreshFacets();
  }

  private refreshFacets(): void {
    this.searchService
      .search(this.searchState.toParams(1, FACETS_ONLY_PAGE_SIZE))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result.failed) this.searchState.applyFacets(result.facets);
      });
  }

  protected openSignInModal(): void {
    this.signInError.set('');
    this.isSignInModalOpen.set(true);
  }

  protected closeSignInModal(): void {
    this.isSignInModalOpen.set(false);
    this.isSigningIn.set(false);
    this.signInError.set('');
  }

  protected onSignInModalVisibilityChange(visible: boolean): void {
    if (visible) {
      this.isSignInModalOpen.set(true);
      return;
    }

    this.closeSignInModal();
  }

  protected async onSignInSubmit(): Promise<void> {
    this.signInError.set('');
    this.isSigningIn.set(true);

    const result = await this.authenticatePlaceholder(this.signInEmail, this.signInPassword);
    this.isSigningIn.set(false);

    if (result.success) {
      this.closeSignInModal();
      return;
    }

    this.signInError.set(
      result.message ?? this.translate.instant('find.landing.signInModal.errorGeneric'),
    );
  }

  private async authenticatePlaceholder(
    email: string,
    password: string,
  ): Promise<{ success: boolean; message?: string }> {
    // Placeholder auth flow until backend integration is wired.
    await new Promise((resolve) => {
      setTimeout(resolve, 600);
    });

    if (!email || !password) {
      return {
        success: false,
        message: this.translate.instant('find.landing.signInModal.errorMissingFields'),
      };
    }

    if (password === 'demo123') {
      return { success: true };
    }

    return {
      success: false,
      message: this.translate.instant('find.landing.signInModal.errorInvalidCredentials'),
    };
  }
}
