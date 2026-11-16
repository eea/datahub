import { TreeNode } from '@openng/optimus-ui/api';

import { DatasetFile } from './dataset-files.service';

export type FileRow =
  | { kind: 'folder'; name: string; fileCount: number }
  | { kind: 'file'; name: string; size: number; modified?: number; url: string };

interface PlacedFile {
  segments: string[];
  file: DatasetFile;
}

const byName = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

const level = (
  placed: PlacedFile[],
  parentKey: string,
  expanded: ReadonlySet<string>,
): TreeNode<FileRow>[] => {
  const nested = placed.filter(({ segments }) => segments.length > 1);
  const folders = [...new Set(nested.map(({ segments }) => segments[0]))]
    .sort(byName)
    .map((name): TreeNode<FileRow> => {
      const key = `${parentKey}${name}/`;
      const inside = nested
        .filter(({ segments }) => segments[0] === name)
        .map(({ segments, file }) => ({ segments: segments.slice(1), file }));
      return {
        key,
        data: { kind: 'folder', name, fileCount: inside.length },
        expanded: expanded.has(key),
        children: level(inside, key, expanded),
      };
    });
  const files = placed
    .filter(({ segments }) => segments.length === 1)
    .sort((a, b) => byName(a.segments[0], b.segments[0]))
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
