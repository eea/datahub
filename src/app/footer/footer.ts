import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import {
  EEA_WEBSITE_ACTIONS,
  EeaWebsiteAction,
  EeaWebsiteLinks,
} from '../eea-website/eea-website-links';

const LABEL_KEY_PREFIX = 'find.footer.links.';

const LABEL_KEYS = Object.values(EEA_WEBSITE_ACTIONS)
  .flat()
  .map(({ id }) => LABEL_KEY_PREFIX + id);

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

  private readonly labels = toSignal(
    inject(TranslateService).stream(LABEL_KEYS) as Observable<Record<string, string>>,
    { initialValue: {} as Record<string, string> },
  );

  protected readonly contacts = computed(() => {
    const [main, ...others] = this.links().contact_actions;
    return { main, others };
  });

  protected label(link: EeaWebsiteAction): string {
    return this.labels()[LABEL_KEY_PREFIX + link.id] ?? link.title;
  }
}
