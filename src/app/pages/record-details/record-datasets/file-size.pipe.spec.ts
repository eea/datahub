import { formatFileSize } from './file-size.pipe';

describe('formatFileSize', () => {
  it.each([
    [0, '0 B'],
    [110, '110 B'],
    [1096, '1 KB'],
    [839_680, '820 KB'],
    [4_153_344, '4 MB'],
    [50_541_363, '48.2 MB'],
    [996_225_024, '950.1 MB'],
    [2_684_354_560, '2.5 GB'],
  ])('shows %i bytes as %s', (bytes, expected) => {
    expect(formatFileSize(bytes, 'en-US')).toBe(expected);
  });
});
