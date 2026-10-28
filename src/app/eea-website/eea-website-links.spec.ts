import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { EEA_WEBSITE_ACTIONS, EeaWebsiteActions, EeaWebsiteLinks } from './eea-website-links';

describe('EeaWebsiteLinks', () => {
  async function answer(body: object | null, status = 200): Promise<void> {
    TestBed.inject(HttpTestingController)
      .expectOne('eea-website/@actions')
      .flush(body, { status, statusText: status === 200 ? 'OK' : 'Bad Gateway' });
    await TestBed.inject(ApplicationRef).whenStable();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(EeaWebsiteLinks);
    TestBed.tick();
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('serves the footer links the EEA website returns', async () => {
    const live: EeaWebsiteActions = {
      ...EEA_WEBSITE_ACTIONS,
      footer_actions: [
        { id: 'privacy', title: 'Privacy', url: 'https://www.eea.europa.eu/en/new-privacy' },
      ],
    };

    await answer(live);

    expect(TestBed.inject(EeaWebsiteLinks).footer()).toEqual(live);
  });

  it('keeps the bundled links when the EEA website does not answer', async () => {
    await answer(null, 502);

    expect(TestBed.inject(EeaWebsiteLinks).footer()).toBe(EEA_WEBSITE_ACTIONS);
  });

  it('keeps the bundled links when the EEA website leaves out a link group', async () => {
    const withoutSocial = Object.fromEntries(
      Object.entries(EEA_WEBSITE_ACTIONS).filter(([group]) => group !== 'social_actions'),
    );

    await answer(withoutSocial);

    expect(TestBed.inject(EeaWebsiteLinks).footer()).toBe(EEA_WEBSITE_ACTIONS);
  });
});
