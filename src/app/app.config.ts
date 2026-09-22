import { provideHttpClient, withXhr } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideOptimus } from '@openng/optimus-ui/config';
import { provideApi } from 'gn-api-client';
import { DEFAULT_LANGUAGE } from 'gn-library';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import AppTheme from './app.theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withXhr()),
    provideApi(environment.geonetworkApiUrl),
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
};
