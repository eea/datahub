import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  inject,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Popover } from '@openng/optimus-ui/popover';

const SHARE_TARGETS = [
  {
    label: 'find.share.facebook',
    icon: 'pi-facebook',
    url: 'https://www.facebook.com/sharer/sharer.php?u=',
  },
  { label: 'find.share.twitter', icon: 'pi-twitter', url: 'https://twitter.com/intent/tweet?url=' },
  {
    label: 'find.share.linkedin',
    icon: 'pi-linkedin',
    url: 'https://www.linkedin.com/sharing/share-offsite/?url=',
  },
];

@Component({
  selector: 'app-share',
  imports: [TranslatePipe, Popover],
  templateUrl: './share.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Share {
  private readonly location = inject(DOCUMENT).location;
  private readonly pageUrl = signal('');

  protected readonly links = computed(() =>
    SHARE_TARGETS.map(({ label, icon, url }) => ({
      label,
      icon,
      href: url + encodeURIComponent(this.pageUrl()),
    })),
  );

  protected toggle(popover: Popover, event: Event): void {
    this.pageUrl.set(this.location.href);
    popover.toggle(event);
  }
}
