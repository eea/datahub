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
    translate.setTranslation('fr', { find: { footer: { links: { about: 'À propos de nous' } } } });
    translate.use('fr');
    const about = {
      id: 'about',
      title: 'About us',
      url: 'https://www.eea.europa.eu/en/who-we-are',
    };
    footer.set({ ...EEA_WEBSITE_ACTIONS, contact_actions: [about] });

    expect(linkText(render(), about.url)).toBe('À propos de nous');
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
});
