import { TreeNode } from '@openng/optimus-ui/api';

import { DatasetFile } from './dataset-files.service';

export type FileRow =
  | { kind: 'folder'; name: string; fileCount: number }
  | { kind: 'file'; name: string; size: number; modified?: number; url: string };

interface PlacedFile {
  segments: string[];
  file: DatasetFile;
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

const byName = (a: string, b: string): number =>
  collator.compare(a, b) || Number(a > b) - Number(a < b);

const level = (
  placed: PlacedFile[],
  parentKey: string,
  expanded: ReadonlySet<string>,
): TreeNode<FileRow>[] => {
  const sorted = [...placed].sort((a, b) => byName(a.segments[0], b.segments[0]));
  const nested = sorted.filter(({ segments }) => segments.length > 1);
  const folderStarts = nested.flatMap(({ segments: [name] }, index) =>
    index > 0 && nested[index - 1].segments[0] === name ? [] : [index],
  );
  const folders = folderStarts.map((start, index): TreeNode<FileRow> => {
    const name = nested[start].segments[0];
    const key = `${parentKey}${name}/`;
    const inside = nested
      .slice(start, folderStarts[index + 1])
      .map(({ segments: [, ...rest], file }) => ({ segments: rest, file }));
    return {
      key,
      data: { kind: 'folder', name, fileCount: inside.length },
      expanded: expanded.has(key),
      children: level(inside, key, expanded),
    };
  });
  const files = sorted
    .filter(({ segments }) => segments.length === 1)
    .map(({ segments: [name], file }): TreeNode<FileRow> => ({
      key: file.path,
      data: { kind: 'file', name, size: file.size, modified: file.modified, url: file.url },
      leaf: true,
    }));
  return [...folders, ...files];
};

export const fileTree = (
  files: DatasetFile[],
  expanded: ReadonlySet<string>,
): TreeNode<FileRow>[] =>
  level(
    files.map((file) => ({ segments: file.path.split('/').filter(Boolean), file })),
    '',
    expanded,
  );
