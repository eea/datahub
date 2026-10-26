import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';

import { EEA_WEBSITE_ACTIONS } from '../eea-website/eea-website-links';
import { Footer } from './footer';

describe('Footer', () => {
  async function render(
    answer: (request: ReturnType<HttpTestingController['expectOne']>) => void,
  ): Promise<ComponentFixture<Footer>> {
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    answer(TestBed.inject(HttpTestingController).expectOne('eea-website/@actions'));
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  function linkText(fixture: ComponentFixture<Footer>, href: string): string | undefined {
    return fixture.nativeElement.querySelector(`a[href="${href}"]`)?.textContent.trim();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideTranslateService()],
    }).compileComponents();
  });

  it('labels the links the EEA website returns with our own translation', async () => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('fr', { find: { footer: { links: { about: 'À propos de nous' } } } });
    translate.use('fr');
    const about = {
      id: 'about',
      title: 'About us',
      url: 'https://www.eea.europa.eu/en/who-we-are',
    };

    const fixture = await render((request) =>
      request.flush({ ...EEA_WEBSITE_ACTIONS, contact_actions: [about] }),
    );

    expect(linkText(fixture, about.url)).toBe('À propos de nous');
  });

  it("shows the EEA website's name for a link we have no translation for", async () => {
    const jobs = { id: 'jobs', title: 'Jobs', url: 'https://www.eea.europa.eu/en/jobs' };

    const fixture = await render((request) =>
      request.flush({ ...EEA_WEBSITE_ACTIONS, contact_extra_actions: [jobs] }),
    );

    expect(linkText(fixture, jobs.url)).toBe('Jobs');
  });

  it('shows the bundled links when the EEA website does not answer', async () => {
    const fixture = await render((request) =>
      request.flush(null, { status: 502, statusText: 'Bad Gateway' }),
    );

    const bundled = Object.values(EEA_WEBSITE_ACTIONS).flat();
    expect(bundled.filter(({ url }) => linkText(fixture, url) === undefined)).toEqual([]);
  });
});
