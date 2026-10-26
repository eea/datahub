import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SearchService } from '@geocat/frontend-library';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { Landing } from './landing';

describe('Landing', () => {
  const search = vi.fn(() => of({ records: [], total: 0, failed: false, facets: {} }));

  beforeEach(async () => {
    search.mockClear();
    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: SearchService, useValue: { search } },
      ],
    }).compileComponents();
  });

  it('asks for the facets of series only', () => {
    TestBed.createComponent(Landing).detectChanges();

    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({ resourceTypes: { included: ['series'] } }),
    );
  });
});
