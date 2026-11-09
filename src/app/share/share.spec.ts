import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { Share } from './share';

describe('Share', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Share],
      providers: [provideTranslateService()],
    }).compileComponents();
  });

  afterEach(() => history.replaceState(null, '', '/'));

  it('shares the page the visitor is on to Facebook, X and LinkedIn in a new tab', async () => {
    history.replaceState(null, '', '/search?q=air quality');
    const fixture = TestBed.createComponent(Share);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('[data-testid="share-button"]').click();
    fixture.detectChanges();
    await fixture.whenStable();

    const page = encodeURIComponent(`${location.origin}/search?q=air%20quality`);
    const links = Array.from<HTMLAnchorElement>(document.querySelectorAll('.p-popover a'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      `https://www.facebook.com/sharer/sharer.php?u=${page}`,
      `https://x.com/intent/post?url=${page}`,
      `https://www.linkedin.com/sharing/share-offsite/?url=${page}`,
    ]);
    expect(links.map((link) => link.target)).toEqual(['_blank', '_blank', '_blank']);
  });

  it('tells assistive technology whether the share popover is open', async () => {
    const fixture = TestBed.createComponent(Share);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('[data-testid="share-button"]');

    expect(button.getAttribute('aria-expanded')).toBe('false');

    button.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(button.getAttribute('aria-expanded')).toBe('true');
  });
});
