import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  EEA_WEBSITE_ACTIONS,
  EEA_WEBSITE_NAVIGATION,
  EeaWebsiteActions,
  EeaWebsiteLinks,
} from './eea-website-links';

const ACTIONS_URL = 'eea-website/@actions';
const NAVIGATION_URL = 'eea-website/@navigation?expand.navigation.depth=2';
const BAD_GATEWAY = { status: 502, statusText: 'Bad Gateway' };

describe('EeaWebsiteLinks', () => {
  async function answer(answers: Record<string, () => void>): Promise<void> {
    Object.values(answers).forEach((flush) => flush());
    await TestBed.inject(ApplicationRef).whenStable();
  }

  function request(url: string) {
    return TestBed.inject(HttpTestingController).expectOne(url);
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

    await answer({
      actions: () => request(ACTIONS_URL).flush(live),
      navigation: () => request(NAVIGATION_URL).flush({ items: EEA_WEBSITE_NAVIGATION }),
    });

    expect(TestBed.inject(EeaWebsiteLinks).footer()).toEqual(live);
  });

  it('keeps the bundled footer links when the EEA website does not answer', async () => {
    await answer({
      actions: () => request(ACTIONS_URL).flush(null, BAD_GATEWAY),
      navigation: () => request(NAVIGATION_URL).flush(null, BAD_GATEWAY),
    });

    expect(TestBed.inject(EeaWebsiteLinks).footer()).toBe(EEA_WEBSITE_ACTIONS);
  });

  it('keeps the bundled footer links when the EEA website leaves out a link group', async () => {
    const withoutSocial = Object.fromEntries(
      Object.entries(EEA_WEBSITE_ACTIONS).filter(([group]) => group !== 'social_actions'),
    );

    await answer({
      actions: () => request(ACTIONS_URL).flush(withoutSocial),
      navigation: () => request(NAVIGATION_URL).flush({ items: EEA_WEBSITE_NAVIGATION }),
    });

    expect(TestBed.inject(EeaWebsiteLinks).footer()).toBe(EEA_WEBSITE_ACTIONS);
  });

  it('serves the navigation the EEA website returns', async () => {
    const live = [{ '@id': 'https://www.eea.europa.eu/en/datahub/news', title: 'News' }];

    await answer({
      actions: () => request(ACTIONS_URL).flush(EEA_WEBSITE_ACTIONS),
      navigation: () => request(NAVIGATION_URL).flush({ items: live }),
    });

    expect(TestBed.inject(EeaWebsiteLinks).header()).toEqual(live);
  });

  it('keeps the bundled navigation when the EEA website does not answer', async () => {
    await answer({
      actions: () => request(ACTIONS_URL).flush(EEA_WEBSITE_ACTIONS),
      navigation: () => request(NAVIGATION_URL).flush(null, BAD_GATEWAY),
    });

    expect(TestBed.inject(EeaWebsiteLinks).header()).toBe(EEA_WEBSITE_NAVIGATION);
  });

  it('keeps the bundled navigation when the EEA website returns no items', async () => {
    await answer({
      actions: () => request(ACTIONS_URL).flush(EEA_WEBSITE_ACTIONS),
      navigation: () => request(NAVIGATION_URL).flush({}),
    });

    expect(TestBed.inject(EeaWebsiteLinks).header()).toBe(EEA_WEBSITE_NAVIGATION);
  });
});
