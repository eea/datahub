import { TreeNode } from '@openng/optimus-ui/api';

import { FileRow, fileTree } from './dataset-file-tree';
import { DatasetFile } from './dataset-files.service';

describe('fileTree', () => {
  const file = (path: string): DatasetFile => ({ path, size: 1, url: `https://host/${path}` });

  const outline = (nodes: TreeNode<FileRow>[]): unknown[] =>
    nodes.map((node) =>
      node.data?.kind === 'folder'
        ? { [`${node.data.name} (${node.data.fileCount})`]: outline(node.children ?? []) }
        : node.data?.name,
    );

  it('puts folders first, then files, both by name', () => {
    const tree = fileTree(
      [file('README.md'), file('GPKG/b.gpkg'), file('file10.zip'), file('file2.zip')],
      new Set(),
    );

    expect(outline(tree)).toEqual([
      { 'GPKG (1)': ['b.gpkg'] },
      'file2.zip',
      'file10.zip',
      'README.md',
    ]);
  });

  it('nests folders and counts every file inside them', () => {
    const tree = fileTree(
      [file('GDB/a.gdb/x.atx'), file('GDB/a.gdb/y.atx'), file('GDB/readme.txt')],
      new Set(),
    );

    expect(outline(tree)).toEqual([
      { 'GDB (3)': [{ 'a.gdb (2)': ['x.atx', 'y.atx'] }, 'readme.txt'] },
    ]);
  });

  it('keeps folders whose names differ only in case apart', () => {
    const tree = fileTree([file('gdb/a.atx'), file('GDB/b.atx'), file('gdb/c.atx')], new Set());

    expect(outline(tree)).toEqual([{ 'GDB (1)': ['b.atx'] }, { 'gdb (2)': ['a.atx', 'c.atx'] }]);
  });

  it('keeps folders collapsed unless their key is expanded', () => {
    const tree = fileTree([file('GDB/a.gdb/x.atx'), file('GPKG/b.gpkg')], new Set(['GDB/']));

    expect(tree.map(({ key, expanded }) => ({ key, expanded }))).toEqual([
      { key: 'GDB/', expanded: true },
      { key: 'GPKG/', expanded: false },
    ]);
    expect(tree[0].children?.[0]).toMatchObject({ key: 'GDB/a.gdb/', expanded: false });
  });

  it('keys a file by its full path', () => {
    const [folder] = fileTree([file('GPKG/b.gpkg')], new Set());

    expect(folder.children?.[0]).toMatchObject({
      key: 'GPKG/b.gpkg',
      leaf: true,
      data: { kind: 'file', name: 'b.gpkg', url: 'https://host/GPKG/b.gpkg' },
    });
  });
});
