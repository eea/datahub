import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ImageTile } from '@geocat/frontend-library';
import { TranslatePipe } from '@ngx-translate/core';

export interface TopicTile {
  /** Translation key for the label. */
  key: string;
  url: string;
  image: string;
}

const AT_A_GLANCE = 'https://www.eea.europa.eu/en/topics/at-a-glance';
const DATAHUB = 'https://www.eea.europa.eu/en/datahub';

/**
 * `@@images/image/large` is the stable 800px scale of an EEA website image. The hashed scale URLs
 * the API returns change whenever an editor replaces the image.
 */
const largeImage = (url: string) => `${url}/@@images/image/large`;

const topic = (slug: string, key: string): TopicTile => ({
  key: `find.landing.atAGlance.topics.${key}`,
  url: `${AT_A_GLANCE}/${slug}`,
  image: largeImage(`${AT_A_GLANCE}/${slug}`),
});

/**
 * The tiles EEA picked on Taskman #310773: five topics at a glance, then the two featured data
 * pages with the images the EEA Datahub page shows for them.
 */
export const TOPIC_TILES: readonly TopicTile[] = [
  topic('nature', 'nature'),
  topic('health', 'health'),
  topic('climate', 'climate'),
  topic('economy-and-resources', 'economyAndResources'),
  topic('sustainability', 'sustainability'),
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
  protected readonly tiles = TOPIC_TILES;
}
