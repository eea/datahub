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
import { Router, RouterLink } from '@angular/router';
import { OgcApiRecordsRecordGeoJSONDto } from '@geocat/frontend-api-client';
import { RECORD_SLUG, SearchService, SearchStateService } from '@geocat/frontend-library';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { Carousel } from '@openng/optimus-ui/carousel';

/** Three pages of three cards, as the design's three dots show. */
const POPULAR_COUNT = 9;
const CARDS_PER_PAGE = 3;
/**
 * Records without a thumbnail, or whose thumbnail fails to load, are skipped, so candidates are
 * fetched in pages of this size until there are enough to fill every card.
 */
const FETCH_COUNT = POPULAR_COUNT * 2;
/** Stops looking after this many pages, so a catalogue of mostly imageless series isn't walked. */
const MAX_PAGES = 5;

export interface PopularRecord {
  link: string[];
  title: string;
  views: number;
  image?: string;
}

/**
 * `popularity` is a configured OGC property, not part of the generated record type, and comes
 * back as a one-value array (`[15]`). A bare number is accepted too.
 */
export const toPopularRecord = (record: OgcApiRecordsRecordGeoJSONDto): PopularRecord => {
  const properties = record.properties ?? {};
  const popularity = (properties as Record<string, unknown>)['popularity'];
  return {
    link: ['/', RECORD_SLUG, record.id],
    title: properties.title ?? '',
    views: Number([popularity].flat()[0]) || 0,
    image: properties.thumbnails?.[0]?.url,
  };
};

@Component({
  selector: 'app-popular-records',
  imports: [RouterLink, TranslatePipe, ButtonModule, Carousel],
  templateUrl: './popular-records.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopularRecords implements OnInit {
  private readonly router = inject(Router);
  private readonly searchService = inject(SearchService);
  private readonly searchState = inject(SearchStateService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly CARDS_PER_PAGE = CARDS_PER_PAGE;
  protected readonly responsiveOptions = [{ breakpoint: '767px', numVisible: 1, numScroll: 1 }];
  /** Every series with a thumbnail fetched so far, most popular first. */
  private readonly candidates = signal<PopularRecord[]>([]);
  protected readonly records = computed(() => this.candidates().slice(0, POPULAR_COUNT));

  private fetchedPages = 0;
  private total = 0;
  private loading = false;

  /** The app's SearchService only returns series, so these are the most popular series. */
  ngOnInit(): void {
    this.fillUp();
  }

  /** A thumbnail that fails to load counts as no thumbnail: the next candidate takes its place. */
  protected dropBroken(broken: PopularRecord): void {
    this.candidates.update((records) => records.filter((record) => record !== broken));
    this.fillUp();
  }

  /** Fetches the next page while the cards can't all be filled and the catalogue has more. */
  private fillUp(): void {
    const short = this.candidates().length < POPULAR_COUNT;
    const exhausted =
      this.fetchedPages >= MAX_PAGES ||
      (this.fetchedPages > 0 && this.fetchedPages * FETCH_COUNT >= this.total);
    if (this.loading || !short || exhausted) return;

    this.loading = true;
    this.searchService
      .search({ sort: 'popularity', pageSize: FETCH_COUNT, page: this.fetchedPages + 1 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.loading = false;
        // A failed request reports no total, which also stops further fetching.
        this.fetchedPages++;
        this.total = result.total;
        const withImage = result.records.map(toPopularRecord).filter((record) => record.image);
        this.candidates.update((records) => [...records, ...withImage]);
        this.fillUp();
      });
  }

  /** Opens the results page sorted by Most popular, with whatever else the panel holds. */
  protected seeAll(): void {
    this.searchState.sort.set('popularity');
    this.router.navigate(['/search']);
  }
}
