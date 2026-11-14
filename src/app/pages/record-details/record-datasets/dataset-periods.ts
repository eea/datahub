import { DatePipe } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  signal,
  untracked,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
} from '@openng/optimus-ui/accordion';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@openng/optimus-ui/tabs';
import { Tag } from '@openng/optimus-ui/tag';

import { RECORD_DATE_FORMAT } from '../record-date-format';
import { Dataset } from './series-datasets.service';

const OTHER_PERIOD = 'other';

interface DatasetPeriod {
  key: string;
  years?: string;
  datasets: Dataset[];
}

const periodKey = (dataset: Dataset): string =>
  dataset.startYear === undefined ? OTHER_PERIOD : `${dataset.startYear}-${dataset.endYear}`;

const periodYears = (dataset: Dataset): string | undefined =>
  dataset.startYear === undefined
    ? undefined
    : dataset.startYear === dataset.endYear
      ? `${dataset.startYear}`
      : `${dataset.startYear}–${dataset.endYear}`;

const byNewestPeriod = (a: DatasetPeriod, b: DatasetPeriod): number => {
  const [first, second] = [a.datasets[0], b.datasets[0]];
  if (first.startYear === undefined) return 1;
  if (second.startYear === undefined) return -1;
  return (second.endYear ?? 0) - (first.endYear ?? 0) || second.startYear - first.startYear;
};

const byNewestPublished = (a: Dataset, b: Dataset): number =>
  (b.published ?? '').localeCompare(a.published ?? '') || a.title.localeCompare(b.title);

const groupByPeriod = (datasets: Dataset[]): DatasetPeriod[] =>
  [...new Set(datasets.map(periodKey))]
    .map((key) => {
      const inPeriod = datasets.filter((dataset) => periodKey(dataset) === key);
      return {
        key,
        years: periodYears(inPeriod[0]),
        datasets: [...inPeriod].sort(byNewestPublished),
      };
    })
    .sort(byNewestPeriod);

@Component({
  selector: 'app-dataset-periods',
  imports: [
    DatePipe,
    TranslatePipe,
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tag,
  ],
  templateUrl: './dataset-periods.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetPeriods {
  readonly datasets = input.required<Dataset[]>();

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);
  protected readonly dateFormat = RECORD_DATE_FORMAT;

  protected readonly periods = computed(() => groupByPeriod(this.datasets()));

  private readonly selectedPeriod = signal<string | undefined>(undefined);
  protected readonly activePeriod = computed(() => {
    const periods = this.periods();
    const selected = this.selectedPeriod();
    return periods.some((period) => period.key === selected) ? selected : periods[0]?.key;
  });

  protected readonly openDatasets = signal<string[]>([]);

  constructor() {
    const id = this.route.snapshot.fragment;
    const showLinkedDataset = effect(() => {
      const period = this.periods().find((candidate) =>
        candidate.datasets.some((dataset) => dataset.id === id),
      );
      if (!id || !period) return;

      showLinkedDataset.destroy();
      untracked(() => {
        this.selectedPeriod.set(period.key);
        this.openDatasets.update((open) => [...new Set([...open, id])]);
      });
      afterNextRender(() => document.getElementById(id)?.scrollIntoView(), {
        injector: this.injector,
      });
    });
  }

  protected selectPeriod(key: string | number | undefined): void {
    this.selectedPeriod.set(key === undefined ? undefined : String(key));
  }

  protected setOpenDatasets(value: string | number | (string | number)[] | null | undefined): void {
    const open = (Array.isArray(value) ? value : value == null ? [] : [value]).map(String);
    const opened = open.find((id) => !this.openDatasets().includes(id));
    this.openDatasets.set(open);
    if (opened) {
      this.router.navigate([], {
        relativeTo: this.route,
        fragment: opened,
        queryParamsHandling: 'preserve',
        replaceUrl: true,
      });
    }
  }
}
