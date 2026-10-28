import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';

import { EEA_WEBSITE_ACTIONS, EeaWebsiteLinks } from '../eea-website/eea-website-links';
import { Footer } from './footer';

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

  it('shows the links of every group', () => {
    const fixture = render();

    const missing = Object.values(EEA_WEBSITE_ACTIONS)
      .flat()
      .filter(({ url }) => linkText(fixture, url) === undefined);
    expect(missing).toEqual([]);
  });

  it('shows Bluesky as an icon with its name for screen readers', () => {
    const bluesky: HTMLAnchorElement = render().nativeElement.querySelector(
      'a[href="https://bsky.app/profile/eea.europa.eu"]',
    );

    expect(bluesky.querySelector('svg')).not.toBeNull();
    expect(bluesky.querySelector('.sr-only')).not.toBeNull();
  });
});
