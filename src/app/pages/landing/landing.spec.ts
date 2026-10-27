import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SearchService } from '@geocat/frontend-library';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import en from '../../../../i18n/en.json';
import fr from '../../../../i18n/fr.json';
import nl from '../../../../i18n/nl.json';
import { Landing } from './landing';

describe('Landing', () => {
  const search = () => of({ records: [], total: 0, failed: false, facets: {} });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: SearchService, useValue: { search } },
      ],
    }).compileComponents();
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
