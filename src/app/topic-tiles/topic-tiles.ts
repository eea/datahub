import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ImageTile } from '@geocat/frontend-library';
import { TranslatePipe } from '@ngx-translate/core';

import { EeaTopicsSearch } from '../eea-topics-search';

interface TopicTile {
  key: string;
  url: string;
  image: string;
  eeaTopics?: readonly string[];
}

const AT_A_GLANCE = 'https://www.eea.europa.eu/en/topics/at-a-glance';
const DATAHUB = 'https://www.eea.europa.eu/en/datahub';

/**
 * `@@images/image/large` is the stable 800px scale of an EEA website image. The hashed scale URLs
 * the API returns change whenever an editor replaces the image.
 */
const largeImage = (url: string) => `${url}/@@images/image/large`;

const topic = (slug: string, key: string, eeaTopics: readonly string[]): TopicTile => {
  const url = `${AT_A_GLANCE}/${slug}`;
  return { key: `find.landing.atAGlance.topics.${key}`, url, image: largeImage(url), eeaTopics };
};

const TOPIC_TILES: readonly TopicTile[] = [
  topic('nature', 'nature', [
    'Agriculture and food system',
    'Bathing water quality',
    'Biodiversity: state of habitats and species',
    'Fisheries and aquaculture',
    'Forests and forestry',
    'Land use',
    'Nature protection and restoration',
    'Seas and coasts',
    'Soil',
    'Water',
  ]),
  topic('health', 'health', [
    'Air pollution',
    'Chemicals',
    'Climate change impacts, risks and adaptation',
    'Environmental health impacts',
    'Noise',
    'Pollution',
    'Environmental inequalities',
  ]),
  topic('climate', 'climate', [
    'Climate change impacts, risks and adaptation',
    'Agriculture and food system',
    'Buildings and construction',
    'Climate change mitigation: reducing emissions',
    'Energy',
    'Energy efficiency',
    'Extreme weather: floods, droughts, heatwaves',
    'Forests and forestry',
    'Land use',
    'Renewable energy',
    'Road transport',
    'Sustainable finance',
    'Transport and mobility',
  ]),
  topic('economy-and-resources', 'economyAndResources', [
    'Circular economy',
    'Climate change mitigation: reducing emissions',
    'Fisheries and aquaculture',
    'Industry',
    'Plastics',
    'Production and consumption',
    'Renewable energy',
    'Resource use and materials',
    'Waste and recycling',
  ]),
  topic('sustainability', 'sustainability', [
    'Agriculture and food system',
    'Energy',
    'Production and consumption',
    'Sustainability challenges',
    'Sustainability solutions',
    'Sustainable finance',
    'Transport and mobility',
    'Urban sustainability',
  ]),
  {
    key: 'find.landing.atAGlance.topics.copernicus',
    url: `${DATAHUB}/featured-data/copernicus-data`,
    image: largeImage(`${DATAHUB}/copernicus-2.jpg`),
  },
  {
    key: 'find.landing.atAGlance.topics.statisticalData',
    url: `${DATAHUB}/featured-data/statistical-data`,
    image: largeImage(`${DATAHUB}/chris-liverani-dbi_my696rk-unsplash.jpg`),
  },
];

@Component({
  selector: 'app-topic-tiles',
  imports: [ImageTile, TranslatePipe],
  templateUrl: './topic-tiles.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicTiles {
  private readonly eeaTopicsSearch = inject(EeaTopicsSearch);

  protected readonly tiles = TOPIC_TILES;

  protected open(event: MouseEvent, tile: TopicTile): void {
    if (tile.eeaTopics) this.eeaTopicsSearch.open(event, tile.eeaTopics);
  }
}
