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

  function menuLinks(fixture: ComponentFixture<Header>): string[] {
    return Array.from<HTMLAnchorElement>(
      fixture.nativeElement.querySelectorAll('#header-menu a'),
    ).map((link) => link.getAttribute('href') ?? '');
  }

  function featuredDataButton(fixture: ComponentFixture<Header>): HTMLElement {
    return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('nav button')).find(
      (button) => button.textContent?.trim() === 'Our featured data',
    )!;
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

  it('opens a panel with the Featured data overview and its pages', async () => {
    const fixture = render();

    await click(fixture, featuredDataButton(fixture));

    expect(menuLinks(fixture)).toEqual([
      'https://www.eea.europa.eu/en/datahub/featured-data',
      'https://www.eea.europa.eu/en/datahub/featured-data/copernicus-data',
      'https://www.eea.europa.eu/en/datahub/featured-data/statistical-data',
    ]);
  });

  it('closes the Featured data panel on Escape', async () => {
    const fixture = render();
    await click(fixture, featuredDataButton(fixture));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(menuLinks(fixture)).toEqual([]);
  });

  it('links the search button to the search page', () => {
    const search = render().nativeElement.querySelector('a[aria-label="find.common.search"]');

    expect(search.getAttribute('href')).toBe('/search');
  });

  it('explains how to recognise an official EU website', async () => {
    const fixture = render();
    const button = fixture.nativeElement.querySelector('button[aria-haspopup="dialog"]');

    expect(button.getAttribute('aria-expanded')).toBe('false');

    await click(fixture, button);

    expect(button.getAttribute('aria-expanded')).toBe('true');
    const popover = document.querySelector('.p-popover');
    expect(popover?.textContent).toContain('find.header.official.domain');
    expect(popover?.classList).toContain('text-header-top');
  });

  it('lists the information systems in the top bar size', async () => {
    const fixture = render();
    const button = fixture.nativeElement.querySelector('button[aria-haspopup="menu"]');

    expect(button.getAttribute('aria-expanded')).toBe('false');

    await click(fixture, button);

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(document.querySelector('.p-menu')?.classList).toContain('text-header-top');
  });
});
