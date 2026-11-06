import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SearchService } from '@geocat/frontend-library';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import en from '../../../../i18n/en.json';
import fr from '../../../../i18n/fr.json';
import nl from '../../../../i18n/nl.json';
import { BusinessDomainService } from '../../domain-tree/business-domain.service';
import { Landing } from './landing';

describe('Landing', () => {
  const search = () => of({ records: [], total: 0, failed: false, facets: {} });

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
      ],
    }).compileComponents();
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
