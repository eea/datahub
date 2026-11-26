import { TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';

import en from '../../../i18n/en.json';
import { TopicTiles } from './topic-tiles';

const AT_A_GLANCE = 'https://www.eea.europa.eu/en/topics/at-a-glance';
const FEATURED_DATA = 'https://www.eea.europa.eu/en/datahub/featured-data';

describe('TopicTiles', () => {
  const render = () => {
    TestBed.configureTestingModule({ providers: [provideTranslateService()] });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', en);
    translate.use('en');
    const fixture = TestBed.createComponent(TopicTiles);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const links = [...element.querySelectorAll<HTMLAnchorElement>('li a')];
    return { element, links };
  };

  it('titles the block "At a glance:"', () => {
    const { element } = render();

    expect(element.querySelector('h2')?.textContent?.trim()).toBe('At a glance:');
  });

  it('shows the five topics, then Copernicus and Statistical data', () => {
    const { links } = render();

    expect(links.map((link) => [link.textContent?.trim(), link.href])).toEqual([
      ['Nature', `${AT_A_GLANCE}/nature`],
      ['Health', `${AT_A_GLANCE}/health`],
      ['Climate', `${AT_A_GLANCE}/climate`],
      ['Economy and resources', `${AT_A_GLANCE}/economy-and-resources`],
      ['Sustainability', `${AT_A_GLANCE}/sustainability`],
      ['Copernicus', `${FEATURED_DATA}/copernicus-data`],
      ['Statistical data', `${FEATURED_DATA}/statistical-data`],
    ]);
  });

  it("uses each page's stable large image scale", () => {
    const { links } = render();

    expect(links.map((link) => link.querySelector('img')?.src)).toEqual([
      `${AT_A_GLANCE}/nature/@@images/image/large`,
      `${AT_A_GLANCE}/health/@@images/image/large`,
      `${AT_A_GLANCE}/climate/@@images/image/large`,
      `${AT_A_GLANCE}/economy-and-resources/@@images/image/large`,
      `${AT_A_GLANCE}/sustainability/@@images/image/large`,
      'https://www.eea.europa.eu/en/datahub/copernicus-2.jpg/@@images/image/large',
      'https://www.eea.europa.eu/en/datahub/chris-liverani-dbi_my696rk-unsplash.jpg/@@images/image/large',
    ]);
  });
});
