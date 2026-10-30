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

    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    await fixture.whenStable();

    const page = encodeURIComponent(`${location.origin}/search?q=air%20quality`);
    const links = Array.from<HTMLAnchorElement>(document.querySelectorAll('.p-popover a'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      `https://www.facebook.com/sharer/sharer.php?u=${page}`,
      `https://twitter.com/intent/tweet?url=${page}`,
      `https://www.linkedin.com/sharing/share-offsite/?url=${page}`,
    ]);
    expect(links.map((link) => link.target)).toEqual(['_blank', '_blank', '_blank']);
  });
});
