import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';

import {
  EEA_WEBSITE_ACTIONS,
  EeaWebsiteAction,
  EeaWebsiteLinks,
} from '../eea-website/eea-website-links';
import { Footer } from './footer';

const HIDDEN = ['sitemap', 'login'];
const SITE_PAGES: Record<string, string> = {
  privacy: '/en/privacy/',
  accessibility: '/en/accessibility',
};
const SYSTEM_STATUS_URL = 'https://status.eea.europa.eu/';
const isHidden = ({ id }: { id: string }) => HIDDEN.includes(id);
const href = ({ id, url }: EeaWebsiteAction) => SITE_PAGES[id] ?? url;

describe('Footer', () => {
  const footer = signal(EEA_WEBSITE_ACTIONS);

  function render(): ComponentFixture<Footer> {
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    return fixture;
  }

  function linkText(fixture: ComponentFixture<Footer>, href: string): string | undefined {
    return fixture.nativeElement.querySelector(`a[href="${href}"]`)?.textContent.trim();
  }

  function hrefs(fixture: ComponentFixture<Footer>, text: string): (string | null)[] {
    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('a'));
    return links
      .filter((link) => link.textContent?.trim() === text)
      .map((link) => link.getAttribute('href'));
  }

  beforeEach(async () => {
    footer.set(EEA_WEBSITE_ACTIONS);
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideTranslateService(), { provide: EeaWebsiteLinks, useValue: { footer } }],
    }).compileComponents();
  });

  it('labels the links with our own translation', () => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { find: { footer: { links: { twitter: 'X' } } } });
    translate.use('en');
    const twitter = { id: 'twitter', title: 'Twitter', url: 'https://twitter.com/euenvironment' };
    footer.set({ ...EEA_WEBSITE_ACTIONS, contact_actions: [twitter] });

    expect(linkText(render(), twitter.url)).toBe('X');
  });

  it('labels a link the app does not bundle once it has a translation', () => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { find: { footer: { links: { jobs: 'Vacancies' } } } });
    translate.use('en');
    const jobs = { id: 'jobs', title: 'Jobs', url: 'https://www.eea.europa.eu/en/jobs' };
    footer.set({ ...EEA_WEBSITE_ACTIONS, contact_extra_actions: [jobs] });

    expect(linkText(render(), jobs.url)).toBe('Vacancies');
  });

  it('keeps FAQs and Careers without the main contact link', () => {
    const [faqs] = EEA_WEBSITE_ACTIONS.contact_extra_actions;
    footer.set({ ...EEA_WEBSITE_ACTIONS, contact_actions: [] });

    expect(linkText(render(), faqs.url)).toBeDefined();
  });

  it("shows the EEA website's name for a link we have no translation for", () => {
    const jobs = { id: 'jobs', title: 'Jobs', url: 'https://www.eea.europa.eu/en/jobs' };
    footer.set({ ...EEA_WEBSITE_ACTIONS, contact_extra_actions: [jobs] });

    expect(linkText(render(), jobs.url)).toBe('Jobs');
  });

  it('shows the links of every group except Sitemap and Login', () => {
    const fixture = render();

    const missing = Object.values(EEA_WEBSITE_ACTIONS)
      .flat()
      .filter((link) => !isHidden(link))
      .filter((link) => linkText(fixture, href(link)) === undefined);
    expect(missing).toEqual([]);
  });

  it('leaves out Sitemap and Login', () => {
    const fixture = render();
    const hidden = EEA_WEBSITE_ACTIONS.copyright_actions.filter(isHidden);

    expect(hidden.map(({ id }) => id)).toEqual(HIDDEN);
    expect(hidden.map(({ url }) => linkText(fixture, url))).toEqual([undefined, undefined]);
  });

  it("points Privacy statement and Accessibility at this site's own pages", () => {
    const fixture = render();

    expect(hrefs(fixture, 'Privacy statement')).toEqual(['/en/privacy/']);
    expect(hrefs(fixture, 'Accessibility')).toEqual(['/en/accessibility']);
    expect(hrefs(fixture, 'Legal notice')).toEqual(['https://www.eea.europa.eu/en/legal-notice']);
  });

  it.each([
    ['lists it', EEA_WEBSITE_ACTIONS.copyright_actions],
    ['leaves it out', EEA_WEBSITE_ACTIONS.copyright_actions.filter(isHidden)],
  ])('shows System status once when the EEA website %s', (_case, copyright_actions) => {
    footer.set({ ...EEA_WEBSITE_ACTIONS, copyright_actions });

    expect(hrefs(render(), 'System status')).toEqual([SYSTEM_STATUS_URL]);
  });

  it('shows every social link as an icon with its name for screen readers', () => {
    const fixture = render();

    const withoutIcon = EEA_WEBSITE_ACTIONS.social_actions.filter(({ url }) => {
      const link: HTMLAnchorElement = fixture.nativeElement.querySelector(`a[href="${url}"]`);
      return !link.querySelector('svg path[d]') || !link.querySelector('.sr-only');
    });
    expect(withoutIcon).toEqual([]);
  });
});
