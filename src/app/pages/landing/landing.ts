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
import { SearchPanel, SearchService, SearchStateService } from '@geocat/frontend-library';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';

import { DomainTree } from '../../domain-tree/domain-tree';
import { Footer } from '../../footer/footer';
import { Header } from '../../header/header';

/**
 * The landing panel needs facet options and counts but shows no results, so it asks for the
 * smallest page the API will serve and keeps only the facets.
 */
const FACETS_ONLY_PAGE_SIZE = 1;

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

  protected readonly isSignInModalOpen = signal(false);
  protected readonly signInError = signal('');
  protected readonly isSigningIn = signal(false);
  protected signInEmail = '';
  protected signInPassword = '';

  ngOnInit(): void {
    this.refreshFacets();
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
