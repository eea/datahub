import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { TreeNode } from '@openng/optimus-ui/api';
import { Skeleton } from '@openng/optimus-ui/skeleton';
import { TreeTableModule } from '@openng/optimus-ui/treetable';

import { EMPTY_VALUE } from '../empty-value';
import { RECORD_DATE_FORMAT } from '../record-date-format';
import { FileRow, fileTree } from './dataset-file-tree';
import { DatasetFilesService } from './dataset-files.service';
import { FileSizePipe } from './file-size.pipe';
import { Dataset } from './series-datasets.service';

const TABLE_TOKENS = { headerCell: { background: 'transparent' } };

@Component({
  selector: 'app-dataset-files',
  imports: [DatePipe, TranslatePipe, Skeleton, TreeTableModule, FileSizePipe],
  templateUrl: './dataset-files.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetFiles {
  readonly dataset = input.required<Dataset>();

  private readonly filesApi = inject(DatasetFilesService);

  protected readonly dateFormat = RECORD_DATE_FORMAT;
  protected readonly emptyValue = EMPTY_VALUE;
  protected readonly tableTokens = TABLE_TOKENS;

  protected readonly filesResource = rxResource({
    params: () => ({ id: this.dataset().id }),
    stream: ({ params }) => this.filesApi.files(params.id),
  });

  private readonly files = computed(() => {
    const overviews = this.dataset().overviews;
    return this.filesResource.hasValue()
      ? this.filesResource.value().filter((file) => !overviews.includes(file.url))
      : [];
  });

  protected readonly tableOpen = signal(true);
  private readonly expandedFolders = signal<ReadonlySet<string>>(new Set());

  protected readonly nodes = computed(() => fileTree(this.files(), this.expandedFolders()));

  protected readonly trackByKey = (_index: number, serializedNode: { node: TreeNode<FileRow> }) =>
    serializedNode.node.key;

  protected toggleTable(): void {
    this.tableOpen.update((open) => !open);
  }

  protected toggleFolder(event: MouseEvent, node: TreeNode<FileRow>): void {
    if (node.data?.kind !== 'folder') return;
    if (event.target instanceof Element && event.target.closest('button')) return;
    if (node.expanded) {
      this.collapse(node);
      return;
    }
    this.expand(node);
  }

  protected expand(node: TreeNode<FileRow>): void {
    const key = node.key;
    if (!key) return;
    this.expandedFolders.update((keys) => new Set([...keys, key]));
  }

  protected collapse(node: TreeNode<FileRow>): void {
    this.expandedFolders.update((keys) => new Set([...keys].filter((key) => key !== node.key)));
  }
}
