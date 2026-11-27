import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SearchStateService } from '@geocat/frontend-library';

import { EEA_TOPICS } from './search-filters';

@Injectable({ providedIn: 'root' })
export class EeaTopicsSearch {
  private readonly router = inject(Router);
  private readonly searchState = inject(SearchStateService);

  open(event: MouseEvent, eeaTopics: readonly string[]): void {
    const newTab = event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey;
    if (newTab) return;
    event.preventDefault();
    this.searchState.setQuery('');
    this.searchState.clearFilters();
    this.searchState.setFilter(EEA_TOPICS, { included: [...eeaTopics], excluded: [] });
    this.router.navigate(['/search']);
  }
}
