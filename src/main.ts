import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

interface RuntimeConfig {
  geonetworkApiUrl?: string;
}

// The Docker image serves config.json from its environment variables (see
// nginx.conf). Without it, e.g. with ng serve, use the build-time value.
fetch('config.json')
  .then((response) => (response.ok ? response.json() : {}))
  .catch(() => ({}))
  .then((config: RuntimeConfig) =>
    bootstrapApplication(App, appConfig(config.geonetworkApiUrl || environment.geonetworkApiUrl)),
  )
  .catch((err) => console.error(err));
