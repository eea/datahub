import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MenuItem } from '@openng/optimus-ui/api';
import { Menu } from '@openng/optimus-ui/menu';

import { EeaWebsiteLinks, EeaWebsiteNavigationItem } from '../eea-website/eea-website-links';
import { translatedLabels } from '../eea-website/translated-labels';

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
  private readonly links = inject(EeaWebsiteLinks).header;

  private readonly systemLabels = translatedLabels('find.header.informationSystems');
  private readonly navigationLabels = translatedLabels('find.header.navigation');

  protected readonly officialSiteInfoOpen = signal(false);

  protected readonly informationSystems = computed<MenuItem[]>(() =>
    INFORMATION_SYSTEMS.map(({ id, url }) => ({
      label: this.systemLabels()[id],
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
