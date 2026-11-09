import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RecordsService } from '@geocat/frontend-api-client';
import { COLLECTION_ID, SearchService } from '@geocat/frontend-library';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { Observable, of, throwError } from 'rxjs';

import en from '../../../../i18n/en.json';
import fr from '../../../../i18n/fr.json';
import nl from '../../../../i18n/nl.json';
import { BusinessDomainService } from '../../domain-tree/business-domain.service';
import { Landing, roundedCount } from './landing';

describe('Landing', () => {
  const search = () => of({ records: [], total: 0, failed: false, facets: {} });
  const facets = (buckets: { value: string; count: number }[]) => ({
    facets: { resourceType: { buckets } },
  });
  const getRecords = vi.fn((..._args: unknown[]): Observable<unknown> => of({}));

  const statsSection = (fixture: ComponentFixture<Landing>): HTMLElement | null =>
    fixture.nativeElement.querySelector('section[aria-labelledby="stats-title"]');

  const statValues = (fixture: ComponentFixture<Landing>) =>
    [...(statsSection(fixture)?.querySelectorAll('app-stat-card') ?? [])].map((card) =>
      card.querySelector('p')?.textContent?.trim(),
    );

  beforeEach(async () => {
    getRecords.mockReset();
    getRecords.mockReturnValue(
      of(
        facets([
          { value: 'dataset', count: 2425 },
          { value: 'nonGeographicDataset', count: 578 },
          { value: 'series', count: 322 },
          { value: 'featureCatalog', count: 94 },
        ]),
      ),
    );

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

    expect(statValues(fixture)).toEqual(['320+', '2400+', '570+', '94']);
    const [collection, , , limit, , , , , , , , , , , facetNames] = getRecords.mock.calls[0];
    expect({ collection, limit, facetNames }).toEqual({
      collection: 'main',
      limit: '1',
      facetNames: 'resourceType',
    });
  });

  it('leaves out a type the facet does not report', () => {
    getRecords.mockReturnValue(of(facets([{ value: 'series', count: 322 }])));
    const fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();

    expect(statValues(fixture)).toEqual(['320+']);
  });

  it.each([
    ['the facet is missing', () => of({})],
    ['the facet has no buckets', () => of(facets([]))],
    ['the request fails', () => throwError(() => new Error('502'))],
  ])('hides the block when %s', (_case, response) => {
    getRecords.mockReturnValue(response());
    const fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();

    expect(statsSection(fixture)).toBeNull();
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

  it('shows and hides all topics as a tree', () => {
    const fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const toggle = element.querySelector<HTMLButtonElement>('button[aria-controls="all-topics"]')!;
    const tree = () => element.querySelector('#all-topics app-domain-tree');

    expect(tree()).toBeNull();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.textContent?.trim()).toBe('find.landing.topics.showAll');

    toggle.click();
    fixture.detectChanges();
    expect(tree()).not.toBeNull();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.textContent?.trim()).toBe('find.landing.topics.hideAll');

    toggle.click();
    fixture.detectChanges();
    expect(tree()).toBeNull();
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
