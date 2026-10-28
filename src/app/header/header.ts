import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MenuItem } from '@openng/optimus-ui/api';
import { Menu } from '@openng/optimus-ui/menu';
import { map, Observable } from 'rxjs';

import { EeaWebsiteLinks, EeaWebsiteNavigationItem } from '../eea-website/eea-website-links';

const INFORMATION_SYSTEMS = [
  { id: 'eea', url: 'https://www.eea.europa.eu' },
  { id: 'wiseMarine', url: 'https://water.europa.eu/marine' },
  { id: 'wiseFreshwater', url: 'https://water.europa.eu/freshwater' },
  { id: 'bise', url: 'https://biodiversity.europa.eu' },
  { id: 'fise', url: 'https://forest.eea.europa.eu/' },
  { id: 'climateHealth', url: 'https://climate-adapt.eea.europa.eu/en/observatory' },
  { id: 'climateAdapt', url: 'https://climate-adapt.eea.europa.eu/' },
  { id: 'industrialEmissions', url: 'https://industry.eea.europa.eu' },
  { id: 'climateEnergy', url: 'https://climate-energy.eea.europa.eu' },
  { id: 'copernicusLand', url: 'https://land.copernicus.eu/en' },
  { id: 'copernicusInSitu', url: 'https://insitu.copernicus.eu' },
  { id: 'circularity', url: 'https://www.eea.europa.eu/en/circularity' },
];

const HIDDEN_NAVIGATION = new Set(['about']);

const SYSTEM_KEY_PREFIX = 'find.header.informationSystems.';
const SYSTEM_KEYS = INFORMATION_SYSTEMS.map(({ id }) => SYSTEM_KEY_PREFIX + id);

function slug(item: EeaWebsiteNavigationItem): string {
  return item['@id'].split('/').filter(Boolean).at(-1) ?? '';
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslatePipe, Menu],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly translate = inject(TranslateService);
  private readonly links = inject(EeaWebsiteLinks).header;

  private readonly systemLabels = toSignal(
    this.translate.stream(SYSTEM_KEYS) as Observable<Record<string, string>>,
    { initialValue: {} as Record<string, string> },
  );

  private readonly navigationLabels = toSignal(
    this.translate
      .stream('find.header.navigation')
      .pipe(map((labels) => (typeof labels === 'object' ? labels : {}))),
    { initialValue: {} as Record<string, string> },
  );

  protected readonly officialSiteInfoOpen = signal(false);

  protected readonly informationSystems = computed<MenuItem[]>(() =>
    INFORMATION_SYSTEMS.map(({ id, url }) => ({
      label: this.systemLabels()[SYSTEM_KEY_PREFIX + id],
      url,
      target: '_blank',
    })),
  );

  protected readonly navigation = computed(() =>
    this.links()
      .filter((item) => !HIDDEN_NAVIGATION.has(slug(item)))
      .map((item) => ({
        label: this.label(item),
        url: item['@id'],
        items: (item.items ?? []).map((child) => ({ label: this.label(child), url: child['@id'] })),
      })),
  );

  protected toggleOfficialSiteInfo(): void {
    this.officialSiteInfoOpen.update((open) => !open);
  }

  private label(item: EeaWebsiteNavigationItem): string {
    return this.navigationLabels()[slug(item)] ?? item.title;
  }
}
