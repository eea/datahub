import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { OgcApiRecordsRecordGeoJSONDto } from '@geocat/frontend-api-client';
import { RECORD_SLUG, SearchService, SearchStateService } from '@geocat/frontend-library';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { PopularRecords, toPopularRecord } from './popular-records';

const record = (id: string, properties: object) =>
  ({ id, properties }) as unknown as OgcApiRecordsRecordGeoJSONDto;

describe('toPopularRecord', () => {
  it('reads the views from the one-value popularity array', () => {
    const popular = toPopularRecord(
      record('a', { title: 'Air', popularity: [15], thumbnails: [{ url: 'a.png' }] }),
    );
    expect(popular).toEqual({
      link: ['/', RECORD_SLUG, 'a'],
      title: 'Air',
      views: 15,
      image: 'a.png',
    });
  });

  it('accepts a bare number and falls back to 0 views and no image', () => {
    expect(toPopularRecord(record('b', { popularity: 3 })).views).toBe(3);
    expect(toPopularRecord(record('c', {}))).toMatchObject({ views: 0, image: undefined });
  });
});

describe('PopularRecords', () => {
  const withImage = (id: string) => record(id, { title: id, thumbnails: [{ url: `${id}.png` }] });
  const withoutImage = (id: string) => record(id, { title: id });

  const setup = (records: OgcApiRecordsRecordGeoJSONDto[]) => {
    const search = vi.fn(() => of({ records, total: records.length, failed: false, facets: {} }));
    TestBed.configureTestingModule({
      imports: [PopularRecords],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: SearchService, useValue: { search } },
      ],
    });
    const fixture = TestBed.createComponent(PopularRecords);
    fixture.detectChanges();
    return { fixture, search };
  };

  const cards = (fixture: { nativeElement: HTMLElement }) =>
    Array.from(fixture.nativeElement.querySelectorAll('a'), (card) => ({
      title: card.querySelector('h3')?.textContent?.trim(),
      image: card.querySelector(':scope > img')?.getAttribute('src') ?? null,
    }));

  it('asks for the nine most popular records', () => {
    const { search } = setup([]);
    expect(search).toHaveBeenCalledWith({ sort: 'popularity', pageSize: 9 });
  });

  it('keeps a series without a thumbnail in its place, with an empty image slot', () => {
    const { fixture } = setup([withImage('a'), withoutImage('b'), withImage('c')]);
    expect(cards(fixture)).toEqual([
      { title: 'a', image: 'a.png' },
      { title: 'b', image: null },
      { title: 'c', image: 'c.png' },
    ]);
  });

  it('empties the image slot when the thumbnail fails to load', () => {
    const { fixture } = setup([withImage('a'), withImage('b')]);
    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(cards(fixture)).toEqual([
      { title: 'a', image: null },
      { title: 'b', image: 'b.png' },
    ]);
  });

  it('stays hidden when there is nothing to show', () => {
    const { fixture } = setup([]);
    expect(fixture.nativeElement.querySelector('section')).toBeNull();
  });

  it('opens the results sorted by popularity', () => {
    const { fixture } = setup([withImage('a')]);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.nativeElement.querySelector('[data-testid="see-popular-records"]').click();

    expect(TestBed.inject(SearchStateService).sort()).toBe('popularity');
    expect(navigate).toHaveBeenCalledWith(['/search']);
  });
});
