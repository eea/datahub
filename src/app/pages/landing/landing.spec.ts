import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RecordsService } from '@geocat/frontend-api-client';
import { COLLECTION_ID, SearchService } from '@geocat/frontend-library';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import en from '../../../../i18n/en.json';
import fr from '../../../../i18n/fr.json';
import nl from '../../../../i18n/nl.json';
import { BusinessDomainService } from '../../domain-tree/business-domain.service';
import { Landing, roundedCount } from './landing';

describe('Landing', () => {
  const search = () => of({ records: [], total: 0, failed: false, facets: {} });
  const getRecords = vi.fn((..._args: unknown[]) =>
    of({
      facets: {
        resourceType: {
          buckets: [
            { value: 'dataset', count: 2425 },
            { value: 'nonGeographicDataset', count: 578 },
            { value: 'series', count: 322 },
            { value: 'featureCatalog', count: 94 },
          ],
        },
      },
    }),
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: SearchService, useValue: { search } },
        { provide: BusinessDomainService, useValue: { domains: () => of([]) } },
        { provide: COLLECTION_ID, useValue: 'main' },
        { provide: RecordsService, useValue: { getRecords } },
      ],
    }).compileComponents();
  });

  it('counts resource types from the resourceType facet', () => {
    const fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();

    const section: HTMLElement = fixture.nativeElement.querySelector(
      'section[aria-labelledby="stats-title"]',
    );
    const values = [...section.querySelectorAll('app-stat-card')].map((card) =>
      card.querySelector('p')?.textContent?.trim(),
    );
    expect(values).toEqual(['320+', '2400+', '570+', '94']);
    expect(getRecords.mock.calls[0][14]).toBe('resourceType');
  });

  it.each([
    [0, '0'],
    [94, '94'],
    [100, '100+'],
    [322, '320+'],
    [2425, '2400+'],
    [12999, '12000+'],
  ])('rounds %i down to %s', (count, shown) => {
    expect(roundedCount(count)).toBe(shown);
  });

  it('shows all topics as a tree', () => {
    const fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();

    const section: HTMLElement = fixture.nativeElement.querySelector(
      'section[aria-labelledby="all-topics-title"]',
    );
    expect(section.querySelector('#all-topics-title')?.textContent?.trim()).toBe(
      'find.landing.topics.title',
    );
    expect(section.querySelector('app-domain-tree')).not.toBeNull();
  });

  it.each([
    ['en', en],
    ['fr', fr],
    ['nl', nl],
  ])('shows the intro paragraph in %s', (lang, translations) => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation(lang, translations);
    translate.use(lang);
    const fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(translations.find.landing.intro);
  });
});
