import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';

import { parseTopicTiles, TOPIC_TILES, TopicTiles } from './topic-tiles';

const NATURE = 'https://www.eea.europa.eu/en/topics/at-a-glance/nature';
const AT_A_GLANCE_URL = 'eea-website/at-a-glance';
const OCEANS = 'https://www.eea.europa.eu/en/topics/at-a-glance/oceans';

const teaser = (title: string, url: string, image_field?: string) => ({
  '@type': 'teaser',
  title,
  href: [{ '@id': url, image_field }],
});

/** A page with its teasers in grids, as the EEA website lays it out. */
const page = (...grids: object[][]) => ({
  blocks: {
    title: { '@type': 'title' },
    ...Object.fromEntries(
      grids.map((teasers, i) => [
        `grid${i}`,
        {
          '@type': 'gridBlock',
          blocks: Object.fromEntries(teasers.map((block, j) => [`teaser${j}`, block])),
          blocks_layout: { items: teasers.map((_, j) => `teaser${j}`) },
        },
      ]),
    ),
  },
  blocks_layout: { items: ['title', ...grids.map((_, i) => `grid${i}`)] },
});

describe('parseTopicTiles', () => {
  it('builds a tile from each teaser that has an image, in page order', () => {
    expect(
      parseTopicTiles(
        page(
          [teaser('Nature', NATURE, 'image'), teaser('Draft', `${NATURE}-draft`)],
          [teaser('Oceans', OCEANS, 'image')],
        ),
      ),
    ).toEqual([
      {
        title: 'Nature',
        key: 'find.landing.atAGlance.topics.nature',
        url: NATURE,
        image: `${NATURE}/@@images/image/large`,
      },
      { title: 'Oceans', key: undefined, url: OCEANS, image: `${OCEANS}/@@images/image/large` },
    ]);
  });

  it('rejects an answer without usable teasers', () => {
    expect(() => parseTopicTiles(null)).toThrow();
    expect(() => parseTopicTiles({})).toThrow();
    expect(() => parseTopicTiles(page([teaser('Nature', NATURE)]))).toThrow();
  });
});

describe('TopicTiles', () => {
  const setup = () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideTranslateService()],
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('fr', {
      find: { landing: { atAGlance: { topics: { nature: 'Nature (fr)' } } } },
    });
    translate.use('fr');
    const fixture = TestBed.createComponent(TopicTiles);
    fixture.detectChanges();
    const answer = async (
      flush: (request: ReturnType<HttpTestingController['expectOne']>) => void,
    ) => {
      flush(TestBed.inject(HttpTestingController).expectOne(AT_A_GLANCE_URL));
      await TestBed.inject(ApplicationRef).whenStable();
      fixture.detectChanges();
    };
    const links = (): HTMLAnchorElement[] => [...fixture.nativeElement.querySelectorAll('li a')];
    return { answer, links };
  };

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('shows the topics the EEA website returns, translating the ones it knows', async () => {
    const { answer, links } = setup();
    await answer((request) =>
      request.flush(page([teaser('Nature', NATURE, 'image'), teaser('Oceans', OCEANS, 'image')])),
    );

    expect(links().map((link) => [link.textContent?.trim(), link.href])).toEqual([
      ['Nature (fr)', NATURE],
      ['Oceans', OCEANS],
    ]);
    expect(links()[0].querySelector('img')?.src).toBe(`${NATURE}/@@images/image/large`);
  });

  it('keeps the bundled topics when the EEA website does not answer', async () => {
    const { answer, links } = setup();
    await answer((request) => request.flush(null, { status: 502, statusText: 'Bad Gateway' }));

    expect(links().map((link) => link.href)).toEqual(TOPIC_TILES.map((tile) => tile.url));
  });
});
