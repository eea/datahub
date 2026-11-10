import { provideHttpClient, withXhr } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideApi } from '@geocat/frontend-api-client';
import {
  COLLECTION_ID,
  DEFAULT_LANGUAGE,
  SEARCH_FILTERS,
  SEARCH_SCOPE,
  SEARCH_SORT_OPTIONS,
} from '@geocat/frontend-library';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideOptimus } from '@openng/optimus-ui/config';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import AppTheme from './app.theme';
import { SEARCH_FILTERS_LIST } from './search-filters';
import { SEARCH_SORT_OPTIONS_LIST } from './search-sort-options';

export const appConfig = (geonetworkApiUrl: string): ApplicationConfig => ({
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withXhr()),
    provideApi(geonetworkApiUrl),
    { provide: COLLECTION_ID, useValue: environment.collectionId },
    { provide: SEARCH_SCOPE, useValue: { resourceType: ['series'] } },
    { provide: SEARCH_FILTERS, useValue: SEARCH_FILTERS_LIST },
    { provide: SEARCH_SORT_OPTIONS, useValue: SEARCH_SORT_OPTIONS_LIST },
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: 'i18n/', suffix: '.json' }),
      fallbackLang: DEFAULT_LANGUAGE,
      lang: DEFAULT_LANGUAGE,
    }),
    provideOptimus({
      theme: {
        preset: AppTheme,
        options: {
          darkModeSelector: false,
        },
      },
      ripple: true,
    }),
  ],
});
