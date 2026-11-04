import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { ImageTile } from '@geocat/frontend-library';
import { TranslatePipe } from '@ngx-translate/core';

export interface TopicTile {
  /** The EEA website's English title, shown when the topic has no translation key. */
  title: string;
  /** Translation key for the label. The EEA website only publishes these pages in English. */
  key?: string;
  url: string;
  image: string;
}

const AT_A_GLANCE = 'https://www.eea.europa.eu/en/topics/at-a-glance';

/** Translation keys by page slug. A topic the EEA adds later keeps its English title until added. */
const TOPIC_KEYS: Record<string, string> = {
  'state-of-europes-environment': 'europesEnvironment',
  climate: 'climate',
  'economy-and-resources': 'economyAndResources',
  health: 'health',
  nature: 'nature',
  sustainability: 'sustainability',
};

/**
 * `@@images/image/large` is the page's stable 800px scale. The hashed scale URLs the API returns
 * change whenever an editor replaces the image.
 */
const toTile = (title: string, url: string): TopicTile => {
  const key = TOPIC_KEYS[url.split('/').pop()!];
  return {
    title,
    key: key && `find.landing.atAGlance.topics.${key}`,
    url,
    image: `${url}/@@images/image/large`,
  };
};

/**
 * Shown until the EEA website answers, and kept if it doesn't. It follows the live order, so the
 * tiles don't move when the answer arrives.
 */
export const TOPIC_TILES: TopicTile[] = Object.keys(TOPIC_KEYS).map((slug) =>
  toTile(slug, `${AT_A_GLANCE}/${slug}`),
);

interface AtAGlanceItem {
  '@id': string;
  title: string;
  image_field?: string;
}

/** Pages without an image would leave a blank tile, so they are left out. */
export function parseTopicTiles(response: unknown): TopicTile[] {
  const items = (response as { items?: AtAGlanceItem[] } | null)?.items;
  const tiles = Array.isArray(items)
    ? items.filter((item) => item.image_field).map((item) => toTile(item.title, item['@id']))
    : [];
  if (!tiles.length) {
    throw new Error('The EEA website returned no topics at a glance');
  }
  return tiles;
}

@Component({
  selector: 'app-topic-tiles',
  imports: [ImageTile, TranslatePipe],
  templateUrl: './topic-tiles.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicTiles {
  private readonly live = httpResource(() => 'eea-website/at-a-glance', {
    parse: parseTopicTiles,
  });

  protected readonly tiles = computed(() =>
    this.live.hasValue() ? this.live.value() : TOPIC_TILES,
  );
}
