import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideApi } from '@geocat/frontend-api-client';
import { COLLECTION_ID, DEFAULT_LANGUAGE, SearchService } from '@geocat/frontend-library';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideOptimus } from '@openng/optimus-ui/config';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import AppTheme from './app.theme';
import { SeriesOnlySearchService } from './series-only-search.service';

export const appConfig = (geonetworkApiUrl: string): ApplicationConfig => ({
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withXhr(), withInterceptors(environment.httpInterceptors)),
    provideApi(geonetworkApiUrl),
    { provide: COLLECTION_ID, useValue: environment.collectionId },
    { provide: SearchService, useClass: SeriesOnlySearchService },
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
