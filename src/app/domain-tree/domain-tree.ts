import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { RECORD_SLUG } from '@geocat/frontend-library';
import { TranslatePipe } from '@ngx-translate/core';
import { TreeNode } from '@openng/optimus-ui/api';
import { Message } from '@openng/optimus-ui/message';
import { TreeTableModule } from '@openng/optimus-ui/treetable';
import { catchError, map, of } from 'rxjs';

import {
  BusinessDomain,
  BusinessDomainService,
  SeriesLink,
  Subdomain,
} from './business-domain.service';

type DomainsState =
  { status: 'loading' } | { status: 'failed' } | { status: 'loaded'; domains: BusinessDomain[] };

type SeriesState = SeriesLink[] | 'loading' | 'failed';

type TreeRow =
  | { kind: 'domain'; label: string }
  | { kind: 'subdomain'; label: string; subdomain: Subdomain }
  | { kind: 'series'; label: string; id: string }
  | { kind: 'message'; label: string };

const ROW_CLASSES: Record<TreeRow['kind'], string> = {
  domain: 'cursor-pointer',
  subdomain: 'cursor-pointer',
  series: 'bg-secondary!',
  message: '',
};

@Component({
  selector: 'app-domain-tree',
  imports: [Message, RouterLink, TranslatePipe, TreeTableModule],
  templateUrl: './domain-tree.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DomainTree {
  private readonly businessDomains = inject(BusinessDomainService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly recordSlug = RECORD_SLUG;

  protected readonly state = toSignal(
    this.businessDomains.domains().pipe(
      map((domains): DomainsState => ({ status: 'loaded', domains })),
      catchError(() => of<DomainsState>({ status: 'failed' })),
    ),
    { initialValue: { status: 'loading' } as DomainsState },
  );

  private readonly expandedKeys = signal<ReadonlySet<string>>(new Set());
  private readonly seriesByPath = signal<ReadonlyMap<string, SeriesState>>(new Map());

  protected readonly nodes = computed<TreeNode<TreeRow>[]>(() => {
    const state = this.state();
    return state.status === 'loaded' ? state.domains.map((domain) => this.domainNode(domain)) : [];
  });

  protected readonly trackByKey = (_index: number, serializedNode: { node: TreeNode<TreeRow> }) =>
    serializedNode.node.key;

  protected rowClass(node: TreeNode<TreeRow>): string {
    return node.data ? ROW_CLASSES[node.data.kind] : '';
  }

  protected toggle(event: MouseEvent, node: TreeNode<TreeRow>): void {
    const kind = node.data?.kind;
    if (kind !== 'domain' && kind !== 'subdomain') return;
    if (event.target instanceof Element && event.target.closest('button')) return;
    if (node.expanded) {
      this.collapse(node);
      return;
    }
    this.expand(node);
  }

  protected expand(node: TreeNode<TreeRow>): void {
    const key = node.key;
    if (!key) return;
    this.expandedKeys.update((keys) => new Set([...keys, key]));
    const row = node.data;
    if (row?.kind === 'subdomain' && this.needsSeries(row.subdomain.path)) {
      this.loadSeries(row.subdomain);
    }
  }

  protected collapse(node: TreeNode<TreeRow>): void {
    this.expandedKeys.update((keys) => new Set([...keys].filter((key) => key !== node.key)));
  }

  private needsSeries(path: string): boolean {
    const series = this.seriesByPath().get(path);
    return series === undefined || series === 'failed';
  }

  private loadSeries(subdomain: Subdomain): void {
    this.setSeries(subdomain.path, 'loading');
    this.businessDomains
      .series(subdomain)
      .pipe(
        map((series): SeriesState => series),
        catchError(() => of<SeriesState>('failed')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((series) => this.setSeries(subdomain.path, series));
  }

  private setSeries(path: string, series: SeriesState): void {
    this.seriesByPath.update((byPath) => new Map([...byPath, [path, series]]));
  }

  private domainNode(domain: BusinessDomain): TreeNode<TreeRow> {
    return {
      key: domain.name,
      data: { kind: 'domain', label: domain.name },
      expanded: this.expandedKeys().has(domain.name),
      children: domain.subdomains.map((subdomain) => this.subdomainNode(subdomain)),
    };
  }

  private subdomainNode(subdomain: Subdomain): TreeNode<TreeRow> {
    return {
      key: subdomain.path,
      data: { kind: 'subdomain', label: subdomain.name, subdomain },
      leaf: false,
      expanded: this.expandedKeys().has(subdomain.path),
      children: this.seriesNodes(subdomain.path),
    };
  }

  private seriesNodes(path: string): TreeNode<TreeRow>[] {
    const series = this.seriesByPath().get(path);
    if (series === 'loading') return [this.messageNode(path, 'find.landing.topics.loading')];
    if (series === 'failed') return [this.messageNode(path, 'find.landing.topics.seriesFailed')];
    return (series ?? []).map(({ id, title }) => ({
      key: `${path}/${id}`,
      data: { kind: 'series', label: title, id },
    }));
  }

  private messageNode(path: string, label: string): TreeNode<TreeRow> {
    return { key: `${path}/message`, data: { kind: 'message', label } };
  }
}
