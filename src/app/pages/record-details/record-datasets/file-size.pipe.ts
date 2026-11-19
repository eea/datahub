import { formatNumber } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];
const STEP = 1024;
const FIRST_UNIT_WITH_DECIMALS = 2;

export const formatFileSize = (bytes: number, locale: string): string => {
  const exponent = Math.min(
    Math.max(Math.floor(Math.log(bytes) / Math.log(STEP)), 0),
    UNITS.length - 1,
  );
  const digits = exponent >= FIRST_UNIT_WITH_DECIMALS ? '1.0-1' : '1.0-0';
  return `${formatNumber(bytes / STEP ** exponent, locale, digits)} ${UNITS[exponent]}`;
};

@Pipe({ name: 'fileSize' })
export class FileSizePipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(bytes: number): string {
    return formatFileSize(bytes, this.locale);
  }
}
