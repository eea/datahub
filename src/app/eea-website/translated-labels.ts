import { inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';

export function translatedLabels(key: string): Signal<Record<string, string>> {
  // A missing or not-yet-loaded key comes back as the key string, not an object.
  return toSignal(
    inject(TranslateService)
      .stream(key)
      .pipe(map((labels) => (typeof labels === 'object' ? labels : {}))),
    { initialValue: {} },
  );
}
