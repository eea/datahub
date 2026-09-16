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

### Link GeoNetwork frontend API client and library
- Make sure to run `nvm use` and confirm node v22.23.0 is used in the GeoCat frontend repo and this project repo.
- build all packages in your local copy of the GeoCat frontend repo: `npm run build`
- in your local copy of the GeoCat frontend repo navigate to: `dist/gn-library` and run `npm link`. Do the same for `dist/gn-api-client`. This should create two symlinks - gn-api-client and gn-library - in `<user-home-dir>/.nvm/versions/node/v22.23.0/lib/node_modules`.
- in your local copy of this repo run: `npm link gn-library gn-api-client`
- confirm your local copy of this project builds without errors

### Setup and Run

```sh
nvm use
npm install
npm run build
npm run start
```

App runs at `http://localhost:4200`.

### Verify the Build

CI runs `npm run build` followed by the format check:

```sh
npm run build:check
```

Run both before pushing to confirm the build and formatting are clean.

### Useful Commands

| Command                       | Description                                   |
| ----------------------------- | --------------------------------------------- |
| `npm run start`               | Start dev server at `http://localhost:4200`   |
| `npm run build`               | Full production build (all libraries + app)   |
| `npm run build:check`         | CI gate: format check                         |
| `npm run prettier`            | Auto-format all source files                  |
| `npm run format:check`        | Check formatting without modifying files      |
| `npm run test`                | Run library unit tests (interactive)          |

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
  backgroundUrl: 'https://your-host.example.com/background.svg',
};
```

Additional environment files (`environment.prod.ts`) are selected through the `production`, build configurations in `angular.json`.

## Theming

Theme tokens are defined in `src/app/app.theme.ts` and layered on Optimus Aura.
Global font defaults are defined in `src/styles.css`.
