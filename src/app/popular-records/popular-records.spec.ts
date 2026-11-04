import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { OgcApiRecordsRecordGeoJSONDto } from '@geocat/frontend-api-client';
import {
  RECORD_SLUG,
  SearchParams,
  SearchService,
  SearchStateService,
} from '@geocat/frontend-library';
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
  const ids = (prefix: string, count: number) =>
    Array.from({ length: count }, (_unused, index) => `${prefix}${index}`);

  /** Serves `catalogue` one page at a time, as the items endpoint does. */
  const setup = (catalogue: OgcApiRecordsRecordGeoJSONDto[]) => {
    const search = vi.fn(({ page = 1, pageSize = 10 }: SearchParams) =>
      of({
        records: catalogue.slice((page - 1) * pageSize, page * pageSize),
        total: catalogue.length,
        failed: false,
        facets: {},
      }),
    );
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

  const titles = (fixture: { nativeElement: HTMLElement }) =>
    Array.from(fixture.nativeElement.querySelectorAll('h3'), (h3) => h3.textContent?.trim());

  it('asks for the most popular records', () => {
    const { search } = setup([]);
    expect(search).toHaveBeenCalledWith({ sort: 'popularity', pageSize: 18, page: 1 });
  });

  it('leaves out records without a thumbnail and shows nine', () => {
    const { fixture, search } = setup([withoutImage('none'), ...ids('r', 12).map(withImage)]);
    expect(titles(fixture)).toEqual(ids('r', 9));
    expect(search).toHaveBeenCalledTimes(1);
  });

  it('fetches the next page when the first has too few thumbnails', () => {
    const { fixture, search } = setup([
      ...ids('none', 18).map(withoutImage),
      ...ids('r', 9).map(withImage),
    ]);
    expect(titles(fixture)).toEqual(ids('r', 9));
    expect(search).toHaveBeenCalledTimes(2);
  });

  it('replaces a card whose thumbnail fails to load with the next record', () => {
    const { fixture } = setup(ids('r', 10).map(withImage));
    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(titles(fixture)).toEqual(ids('r', 10).slice(1));
  });

  it('shows fewer cards once the catalogue runs out', () => {
    const { fixture, search } = setup(ids('r', 3).map(withImage));
    expect(titles(fixture)).toEqual(ids('r', 3));
    expect(search).toHaveBeenCalledTimes(1);
  });

  it('stops looking after five pages', () => {
    const { fixture, search } = setup(ids('none', 200).map(withoutImage));
    expect(search).toHaveBeenCalledTimes(5);
    expect(fixture.nativeElement.querySelector('section')).toBeNull();
  });

  it('stays hidden when there is nothing to show', () => {
    const { fixture } = setup([]);
    expect(fixture.nativeElement.querySelector('section')).toBeNull();
  });

  it('opens the results sorted by popularity', () => {
    const { fixture } = setup([withImage('a')]);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.nativeElement.querySelector('button[pButton]').click();

    expect(TestBed.inject(SearchStateService).sort()).toBe('popularity');
    expect(navigate).toHaveBeenCalledWith(['/search']);
  });
});
