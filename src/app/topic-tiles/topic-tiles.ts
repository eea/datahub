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
  nature: 'nature',
  health: 'health',
  climate: 'climate',
  'economy-and-resources': 'economyAndResources',
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

/**
 * The EEA website runs on Plone with the Volto frontend, where editors build a page from blocks.
 * The API returns them as `blocks` (block id → content) and `blocks_layout.items` (the ids in page
 * order). A grid block holds its own `blocks` and `blocks_layout`, and so does the page itself, so
 * this type covers the page, the grids and the teasers in them. A teaser is a card linking to
 * another page, under a title the editor can change. For example, from
 * `GET https://www.eea.europa.eu/++api++/en/topics/at-a-glance`:
 *
 * ```json
 * {
 *   "blocks_layout": { "items": ["5a4f…", "a7da…", "51f4…", "2663…"] },
 *   "blocks": {
 *     "5a4f…": { "@type": "title" },
 *     "a7da…": {
 *       "@type": "gridBlock",
 *       "blocks_layout": { "items": ["4d44…", "3b22…", "746a…"] },
 *       "blocks": {
 *         "4d44…": {
 *           "@type": "teaser",
 *           "title": "State of Europe's environment",
 *           "href": [
 *             {
 *               "@id": "https://www.eea.europa.eu/en/topics/at-a-glance/state-of-europes-environment",
 *               "image_field": "image"
 *             }
 *           ]
 *         },
 *         "3b22…": { "@type": "teaser", "title": "Nature", "href": [ … ] },
 *         "746a…": { "@type": "teaser", "title": "Health", "href": [ … ] }
 *       }
 *     },
 *     "51f4…": { "@type": "gridBlock", … },
 *     "2663…": { "@type": "callToActionBlock", … }
 *   }
 * }
 * ```
 */
interface VoltoBlock {
  '@type'?: string;
  title?: string;
  href?: { '@id': string; image_field?: string }[];
  blocks?: Record<string, VoltoBlock>;
  blocks_layout?: { items?: string[] };
}

/** The teasers in page order, from the grids they sit in. */
const teasersIn = (block: VoltoBlock): VoltoBlock[] =>
  block['@type'] === 'teaser'
    ? [block]
    : (block.blocks_layout?.items ?? []).flatMap((id) =>
        block.blocks?.[id] ? teasersIn(block.blocks[id]) : [],
      );

/**
 * Reads the page's teasers rather than its child pages, since editors set the order and titles
 * there. Teasers without a title or an image would leave a blank tile, so they are left out.
 */
export function parseTopicTiles(response: unknown): TopicTile[] {
  const tiles = (response ? teasersIn(response as VoltoBlock) : [])
    .filter((teaser) => teaser.title && teaser.href?.[0]?.image_field)
    .map((teaser) => toTile(teaser.title!, teaser.href![0]['@id']));
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
