import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';

import { EEA_WEBSITE_NAVIGATION, EeaWebsiteLinks } from '../eea-website/eea-website-links';
import { Header } from './header';

describe('Header', () => {
  const header = signal(EEA_WEBSITE_NAVIGATION);

  function render(): ComponentFixture<Header> {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    return fixture;
  }

  function navigationTexts(fixture: ComponentFixture<Header>): string[] {
    return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('nav li')).map(
      (item) => item.textContent?.trim() ?? '',
    );
  }

  function menuLinks(): HTMLAnchorElement[] {
    return Array.from(document.querySelectorAll<HTMLAnchorElement>('.p-menu a'));
  }

  async function click(fixture: ComponentFixture<Header>, element: HTMLElement): Promise<void> {
    element.click();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    header.set(EEA_WEBSITE_NAVIGATION);
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: EeaWebsiteLinks, useValue: { header } },
      ],
    }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      find: {
        header: {
          navigation: {
            'featured-data': 'Our featured data',
            'eea-data-policy': 'Our data policy',
          },
        },
      },
    });
    translate.use('en');
  });

  it("labels the EEA website's navigation with our own translation, without About", () => {
    expect(navigationTexts(render())).toEqual(['Our featured data', 'Our data policy']);
  });

  it("shows the EEA website's name for a page we have no translation for", () => {
    header.set([
      ...EEA_WEBSITE_NAVIGATION,
      { '@id': 'https://www.eea.europa.eu/en/datahub/news', title: 'News' },
    ]);

    expect(navigationTexts(render())).toEqual(['Our featured data', 'Our data policy', 'News']);
  });

  it('labels a page the app does not bundle once it has a translation', () => {
    TestBed.inject(TranslateService).setTranslation(
      'en',
      { find: { header: { navigation: { news: 'Our news' } } } },
      true,
    );
    header.set([
      ...EEA_WEBSITE_NAVIGATION,
      { '@id': 'https://www.eea.europa.eu/en/datahub/news', title: 'News' },
    ]);

    expect(navigationTexts(render())).toEqual(['Our featured data', 'Our data policy', 'Our news']);
  });

  it('lists the Featured data pages in its menu', async () => {
    const fixture = render();

    await click(fixture, fixture.nativeElement.querySelector('nav button'));

    expect(menuLinks().map((link) => link.getAttribute('href'))).toEqual([
      'https://www.eea.europa.eu/en/datahub/featured-data/copernicus-data',
      'https://www.eea.europa.eu/en/datahub/featured-data/statistical-data',
    ]);
  });

  it('explains how to recognise an official EU website', async () => {
    const fixture = render();
    const howDoYouKnow: HTMLElement = fixture.nativeElement.querySelector(
      'button[aria-controls="official-site-info"]',
    );

    await click(fixture, howDoYouKnow);

    expect(howDoYouKnow.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('#official-site-info')).not.toBeNull();
  });
});
