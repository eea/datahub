import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';

import { parseTopicTiles, TOPIC_TILES, TopicTiles } from './topic-tiles';

const NATURE = 'https://www.eea.europa.eu/en/topics/at-a-glance/nature';
const URL = 'eea-website/at-a-glance';
const OCEANS = 'https://www.eea.europa.eu/en/topics/at-a-glance/oceans';

describe('parseTopicTiles', () => {
  it('builds a tile from each page that has an image', () => {
    expect(
      parseTopicTiles({
        items: [
          { '@id': NATURE, title: 'Nature', image_field: 'image' },
          { '@id': `${NATURE}-draft`, title: 'Draft' },
        ],
      }),
    ).toEqual([
      {
        title: 'Nature',
        key: 'find.landing.atAGlance.topics.nature',
        url: NATURE,
        image: `${NATURE}/@@images/image/large`,
      },
    ]);
  });

  it('rejects an answer without usable pages', () => {
    expect(() => parseTopicTiles({})).toThrow();
    expect(() => parseTopicTiles({ items: [{ '@id': NATURE, title: 'Nature' }] })).toThrow();
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
      flush(TestBed.inject(HttpTestingController).expectOne(URL));
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
      request.flush({
        items: [
          { '@id': NATURE, title: 'Nature', image_field: 'image' },
          { '@id': OCEANS, title: 'Oceans', image_field: 'image' },
        ],
      }),
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
