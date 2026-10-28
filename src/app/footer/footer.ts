import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';

import { EeaWebsiteAction, EeaWebsiteLinks } from '../eea-website/eea-website-links';

const SOCIAL_ICONS: Record<string, string> = {
  twitter: 'pi-twitter',
  facebook: 'pi-facebook',
  linkedin: 'pi-linkedin',
  youtube: 'pi-youtube',
  instagram: 'pi-instagram',
};

@Component({
  selector: 'app-footer',
  imports: [TranslatePipe],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly links = inject(EeaWebsiteLinks).footer;
  protected readonly socialIcons = SOCIAL_ICONS;

  // A missing or not-yet-loaded key comes back as the key string, not an object.
  private readonly labels = toSignal(
    inject(TranslateService)
      .stream('find.footer.links')
      .pipe(map((labels) => (typeof labels === 'object' ? labels : {}))),
    { initialValue: {} as Record<string, string> },
  );

  protected readonly contacts = computed(() => {
    const [main, ...others] = this.links().contact_actions;
    return { main, others };
  });

  protected label(link: EeaWebsiteAction): string {
    return this.labels()[link.id] ?? link.title;
  }
}
