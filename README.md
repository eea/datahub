# EEA Datahub

This repository contains the frontend for the EEA Datahub.

## Technology Stack

- Angular `22` (application and libraries)
- TypeScript `6.0`
- Optimus UI `2.0` + Optimus theming
- Tailwind CSS `4.1` + `@openng/optimus-ui-tailwindcss`
- `@ngx-translate` for i18n

## Local Development

### Prerequisites

- Node.js `v22.23.0`
- npm

### GeoCat packages

The GeoNetwork frontend library and API client are installed from GitHub Packages as `@geocat/frontend-library` and `@geocat/frontend-api-client`. The `.npmrc` points the `@geocat` scope at that registry. Set `GITHUB_PACKAGES_AUTH_TOKEN` to a GitHub personal access token (classic) with the `read:packages` scope before installing:

```sh
export GITHUB_PACKAGES_AUTH_TOKEN=<your token>
```

### Use a local build of the library

- Make sure to run `nvm use` and confirm node v22.23.0 is used in the GeoCat frontend repo and this project repo.
- build all packages in your local copy of the GeoCat frontend repo: `npm run build`
- in your local copy of the GeoCat frontend repo navigate to: `dist/gn-library` and run `npm link`. Do the same for `dist/gn-api-client`.
- in your local copy of this repo run: `npm link @geocat/frontend-library @geocat/frontend-api-client`
- confirm your local copy of this project builds without errors

### Setup and Run

```sh
nvm use
npm install --legacy-peer-deps
npm run build
npm run start
```

Note: for installing packages, the `--legacy-peer-deps` option is used to workaround the following npm error: `Cannot read properties of null (reading 'edgesOut')`.

App runs at `http://localhost:4200`.

### Verify the Build

Verify the build by:

- making sure the app builds: `npm run build`
- running the format check: `npm run build:check`

Run both before pushing to confirm the build and formatting are clean.

### Useful Commands

| Command                       | Description                                   |
| ----------------------------- | --------------------------------------------- |
| `npm run start`               | Start dev server at `http://localhost:4200`   |
| `npm run build`               | Full production build                         |
| `npm run build:check`         | Format check                                  |
| `npm run prettier`            | Auto-format all source files                  |
| `npm run format:check`        | Check formatting without modifying files      |
| `npm run test`                | Run unit tests (interactive)                  |

## API Endpoint Configuration

Angular dev server proxy is configured in `proxy.config.js`.

Example:

```js
'/geonetwork': {
  target: 'https://your-geonetwork-host.example.com/',
  secure: true,
  logLevel: 'debug',
  changeOrigin: true,
}
```

Environment base path is configured in `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  geonetworkApiUrl: '/geonetwork',
};
```

Additional environment files (`environment.prod.ts`) are selected through the `production`, build configurations in `angular.json`.

The production build uses `/catalogue`, the GeoNetwork 5 context path in the `sdi-catalogue` Helm chart. At startup the app first reads `config.json`, served by the Docker image, and only falls back to the environment file when it is missing, for example with `ng serve`.

## Docker Image

The `Dockerfile` builds the app and serves it with nginx on port 8080. It is deployed by the `sdi-catalogue` Helm chart, where Apache proxies the site root to it (`datahub.enabled`), while GeoNetwork stays under `/catalogue`.

```sh
docker build --secret id=npm_token,env=GITHUB_PACKAGES_AUTH_TOKEN -t eea-datahub .
docker run --rm -p 8080:8080 eea-datahub
```

The token is passed as a BuildKit secret, taken from `GITHUB_PACKAGES_AUTH_TOKEN` in your environment (see [GeoCat packages](#geocat-packages)), so it is not stored in the image or the build cache.

The container is configured with environment variables, served to the app in `/config.json`:

| Variable             | Default      | Description                                                      |
| -------------------- | ------------ | ---------------------------------------------------------------- |
| `GEONETWORK_API_URL` | `/catalogue` | GeoNetwork 5 base path or URL used by the UI to call its API     |

```sh
docker run --rm -p 8080:8080 -e GEONETWORK_API_URL=/geonetwork eea-datahub
```

Jenkins builds and pushes `eeacms/eea-datahub` on every branch push (see `Jenkinsfile`). Images from `main` are tagged with the first 8 characters of the commit, and other branches with `<branch>-<commit>`. The token comes from the `eea-datahub-github-packages-token` Jenkins credential.

## Theming

Theme tokens are defined in `src/app/app.theme.ts` and layered on Optimus Aura.
Global font defaults are defined in `src/styles.css`.
