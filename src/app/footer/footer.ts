import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { EeaWebsiteAction, EeaWebsiteLinks } from '../eea-website/eea-website-links';
import { translatedLabels } from '../eea-website/translated-labels';

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

  private readonly labels = translatedLabels('find.footer.links');

  protected readonly contacts = computed(() => {
    const [main, ...others] = this.links().contact_actions;
    return { main, others };
  });

  protected label(link: EeaWebsiteAction): string {
    return this.labels()[link.id] ?? link.title;
  }
}
