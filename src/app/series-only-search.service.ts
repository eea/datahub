import { Injectable } from '@angular/core';
import { SearchParams, SearchResult, SearchService } from '@geocat/frontend-library';
import { Observable } from 'rxjs';

import { seriesOnly } from './series-only';

@Injectable()
export class SeriesOnlySearchService extends SearchService {
  override search(params: SearchParams): Observable<SearchResult> {
    return super.search(seriesOnly(params));
  }

  override suggest(params: SearchParams, limit?: number): Observable<string[]> {
    return super.suggest(seriesOnly(params), limit);
  }
}
