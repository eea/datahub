import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { LanguageSwitcher, SearchBar, SearchRequest } from 'gn-library';

@Component({
  selector: 'app-landing',
  imports: [
    FormsModule,
    SearchBar,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TranslatePipe,
    LanguageSwitcher,
  ],
  templateUrl: './landing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  protected readonly isSignInModalOpen = signal(false);
  protected readonly signInError = signal('');
  protected readonly isSigningIn = signal(false);
  protected signInEmail = '';
  protected signInPassword = '';

  protected onSearch(request: SearchRequest): void {
    this.router.navigate(['/search'], {
      queryParams: request.query ? { q: request.query } : {},
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
