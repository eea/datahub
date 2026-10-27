import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SearchService } from '@geocat/frontend-library';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { BusinessDomainService } from '../../domain-tree/business-domain.service';
import { Landing } from './landing';

describe('Landing', () => {
  const search = vi.fn(() => of({ records: [], total: 0, failed: false, facets: {} }));

  beforeEach(async () => {
    search.mockClear();
    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: SearchService, useValue: { search } },
        { provide: BusinessDomainService, useValue: { domains: () => of([]) } },
      ],
    }).compileComponents();
  });

  it('shows all topics as a tree', () => {
    const fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();

    const section: HTMLElement = fixture.nativeElement.querySelector(
      'section[aria-labelledby="all-topics-title"]',
    );
    expect(section.querySelector('h2')?.textContent?.trim()).toBe('find.landing.topics.title');
    expect(section.querySelector('app-domain-tree')).not.toBeNull();
  });

  it('asks for the facets of series only', () => {
    TestBed.createComponent(Landing).detectChanges();

    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({ resourceTypes: { included: ['series'] } }),
    );
  });
});
