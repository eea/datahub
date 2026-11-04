import { DEFAULT_SPACE } from '@geocat/frontend-library';

export const factsheetUrl = (basePath: string, id: string): string =>
  `${basePath}/${DEFAULT_SPACE}/api/records/${id}/formatters/xsl-view?output=pdf&language=eng&approved=true`;

export const catalogueRecordUrl = (basePath: string, id: string): string =>
  `${basePath}/${DEFAULT_SPACE}/eng/catalog.search#/metadata/${id}`;
