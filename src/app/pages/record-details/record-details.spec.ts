import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BASE_PATH, RecordService } from '@geocat/frontend-api-client';
import { COLLECTION_ID } from '@geocat/frontend-library';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { EEA_WEBSITE_ACTIONS, EeaWebsiteLinks } from '../../eea-website/eea-website-links';
import { RecordDetails } from './record-details';

describe('RecordDetails', () => {
  const uuid = 'e006507d-15c8-49e6-959c-53b61facd873';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordDetails],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: ActivatedRoute, useValue: { params: of({ uuid }) } },
        { provide: RecordService, useValue: { getRecord: () => of({ id: uuid }) } },
        { provide: COLLECTION_ID, useValue: 'collection' },
        { provide: BASE_PATH, useValue: '/catalogue' },
        { provide: EeaWebsiteLinks, useValue: { footer: signal(EEA_WEBSITE_ACTIONS) } },
      ],
    }).compileComponents();
  });

  it('links to the record in the GN4 catalogue', async () => {
    const fixture = TestBed.createComponent(RecordDetails);
    await fixture.whenStable();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector(
      '[data-testid="gn4-record-link"]',
    );
    expect(link.getAttribute('href')).toBe(`/catalogue/srv/eng/catalog.search#/metadata/${uuid}`);
  });
});
