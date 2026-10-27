import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RECORD_SLUG } from '@geocat/frontend-library';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { BusinessDomain, BusinessDomainService } from './business-domain.service';
import { DomainTree } from './domain-tree';

const DOMAINS: BusinessDomain[] = [
  { name: 'Air', subdomains: [{ name: 'Noise', path: 'Air^Noise', seriesCount: 1 }] },
  {
    name: 'Water',
    subdomains: [{ name: 'Snow & Ice', path: 'Water^Snow & Ice', seriesCount: 2 }],
  },
];

describe('DomainTree', () => {
  const domains = vi.fn();
  const series = vi.fn();

  beforeEach(async () => {
    domains.mockReset();
    series.mockReset();
    await TestBed.configureTestingModule({
      imports: [DomainTree],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: BusinessDomainService, useValue: { domains, series } },
      ],
    }).compileComponents();
  });

  const render = (): ComponentFixture<DomainTree> => {
    const fixture = TestBed.createComponent(DomainTree);
    fixture.detectChanges();
    return fixture;
  };

  const rows = (fixture: ComponentFixture<DomainTree>): HTMLTableRowElement[] => [
    ...fixture.nativeElement.querySelectorAll('tbody tr'),
  ];

  const rowTexts = (fixture: ComponentFixture<DomainTree>): string[] =>
    rows(fixture).map((row) => row.textContent?.trim() ?? '');

  const toggle = async (fixture: ComponentFixture<DomainTree>, label: string): Promise<void> => {
    const row = rows(fixture).find((candidate) => candidate.textContent?.trim() === label);
    row?.querySelector<HTMLButtonElement>('p-treetable-toggler button')?.click();
    fixture.detectChanges();
    await fixture.whenStable();
  };

  it('shows the domains first, with their subdomains folded away', () => {
    domains.mockReturnValue(of(DOMAINS));

    expect(rowTexts(render())).toEqual(['Air', 'Water']);
  });

  it('unfolds a domain into its subdomains', async () => {
    domains.mockReturnValue(of(DOMAINS));
    const fixture = render();

    await toggle(fixture, 'Water');

    expect(rowTexts(fixture)).toEqual(['Air', 'Water', 'Snow & Ice']);
    expect(series).not.toHaveBeenCalled();
  });

  it('unfolds and folds a domain when its name is clicked', async () => {
    domains.mockReturnValue(of(DOMAINS));
    const fixture = render();
    const clickName = async (label: string): Promise<void> => {
      const names: HTMLSpanElement[] = [...fixture.nativeElement.querySelectorAll('tbody span')];
      names.find((name) => name.textContent?.trim() === label)?.click();
      fixture.detectChanges();
      await fixture.whenStable();
    };

    await clickName('Water');
    expect(rowTexts(fixture)).toEqual(['Air', 'Water', 'Snow & Ice']);

    await clickName('Water');
    expect(rowTexts(fixture)).toEqual(['Air', 'Water']);
  });

  it('loads the series of a subdomain when it unfolds, each linking to its record', async () => {
    domains.mockReturnValue(of(DOMAINS));
    series.mockReturnValue(
      of([
        { id: 'lake-ice', title: 'Lake ice phenology' },
        { id: 'snow-cover', title: 'Snow cover extent' },
      ]),
    );
    const fixture = render();

    await toggle(fixture, 'Water');
    await toggle(fixture, 'Snow & Ice');

    expect(series).toHaveBeenCalledWith(DOMAINS[1].subdomains[0]);
    const links: HTMLAnchorElement[] = [...fixture.nativeElement.querySelectorAll('tbody a')];
    expect(links.map((link) => [link.textContent?.trim(), link.getAttribute('href')])).toEqual([
      ['Lake ice phenology', `/${RECORD_SLUG}/lake-ice`],
      ['Snow cover extent', `/${RECORD_SLUG}/snow-cover`],
    ]);
  });

  it('loads the series of a subdomain only once', async () => {
    domains.mockReturnValue(of(DOMAINS));
    series.mockReturnValue(of([{ id: 'noise-maps', title: 'Noise maps' }]));
    const fixture = render();

    await toggle(fixture, 'Air');
    await toggle(fixture, 'Noise');
    await toggle(fixture, 'Noise');
    await toggle(fixture, 'Noise');

    expect(series).toHaveBeenCalledTimes(1);
    expect(rowTexts(fixture)).toEqual(['Air', 'Noise', 'Noise maps', 'Water']);
  });

  it('says so under the subdomain when its series cannot be loaded', async () => {
    domains.mockReturnValue(of(DOMAINS));
    series.mockReturnValue(throwError(() => new Error('down')));
    const fixture = render();

    await toggle(fixture, 'Air');
    await toggle(fixture, 'Noise');

    expect(rowTexts(fixture)).toEqual([
      'Air',
      'Noise',
      'find.landing.topics.seriesFailed',
      'Water',
    ]);
  });

  it('says so when there are no domains', () => {
    domains.mockReturnValue(of([]));

    expect(rowTexts(render())).toEqual(['find.landing.topics.empty']);
  });

  it('says so when the domains cannot be loaded', () => {
    domains.mockReturnValue(throwError(() => new Error('down')));

    const fixture = render();

    expect(fixture.nativeElement.querySelector('p-treetable')).toBeNull();
    expect(fixture.nativeElement.querySelector('p-message')?.textContent).toContain(
      'find.landing.topics.failed',
    );
  });
});
