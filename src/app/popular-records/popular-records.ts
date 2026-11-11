import {
  ChangeDetectionStrategy,
  Component,
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
  protected readonly records = signal<PopularRecord[]>([]);

  /** The app's SearchService only returns series, so these are the most popular series. */
  ngOnInit(): void {
    this.searchService
      .search({ sort: 'popularity', pageSize: POPULAR_COUNT })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => this.records.set(result.records.map(toPopularRecord)));
  }

  /** A thumbnail that fails to load counts as no thumbnail: the card keeps its place. */
  protected dropImage(broken: PopularRecord): void {
    this.records.update((records) =>
      records.map((record) => (record === broken ? { ...record, image: undefined } : record)),
    );
  }

  /** Opens the results page sorted by Most popular, with whatever else the panel holds. */
  protected seeAll(): void {
    this.searchState.sort.set('popularity');
    this.router.navigate(['/search']);
  }
}
