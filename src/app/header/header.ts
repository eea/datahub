import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@geocat/frontend-library';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MenuItem } from '@openng/optimus-ui/api';
import { Menu } from '@openng/optimus-ui/menu';
import { map, Observable } from 'rxjs';

import {
  EEA_WEBSITE_NAVIGATION,
  EeaWebsiteLinks,
  EeaWebsiteNavigationItem,
} from '../eea-website/eea-website-links';

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
const NAVIGATION_KEY_PREFIX = 'find.header.navigation.';

function slug(item: EeaWebsiteNavigationItem): string {
  return item['@id'].split('/').filter(Boolean).at(-1) ?? '';
}

const LABEL_KEYS = [
  ...INFORMATION_SYSTEMS.map(({ id }) => SYSTEM_KEY_PREFIX + id),
  ...EEA_WEBSITE_NAVIGATION.flatMap((item) => [item, ...(item.items ?? [])])
    .filter((item) => !HIDDEN_NAVIGATION.has(slug(item)))
    .map((item) => NAVIGATION_KEY_PREFIX + slug(item)),
];

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslatePipe, Menu],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly translate = inject(TranslateService);
  private readonly links = inject(EeaWebsiteLinks).header;

  private readonly labels = toSignal(
    this.translate.stream(LABEL_KEYS) as Observable<Record<string, string>>,
    { initialValue: {} as Record<string, string> },
  );

  protected readonly language = toSignal(
    this.translate.onLangChange.pipe(map(({ lang }) => lang)),
    {
      initialValue: this.translate.getCurrentLang() || DEFAULT_LANGUAGE,
    },
  );

  protected readonly officialSiteInfoOpen = signal(false);

  protected readonly languages: MenuItem[] = SUPPORTED_LANGUAGES.map(({ code, label }) => ({
    label,
    command: () => this.translate.use(code),
  }));

  protected readonly informationSystems = computed<MenuItem[]>(() =>
    INFORMATION_SYSTEMS.map(({ id, url }) => ({
      label: this.labels()[SYSTEM_KEY_PREFIX + id],
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
    return this.labels()[NAVIGATION_KEY_PREFIX + slug(item)] ?? item.title;
  }
}
