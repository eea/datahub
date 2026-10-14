FROM node:22.23.0-alpine AS build

# Read by .npmrc to install the @geocat packages from GitHub Packages.
# Only lives in this stage, the final image does not contain it.
ARG GITHUB_PACKAGES_AUTH_TOKEN

WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --legacy-peer-deps --ignore-scripts

COPY . .
RUN npx ng build

FROM nginxinc/nginx-unprivileged:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/eea-datahub/browser /usr/share/nginx/html

EXPOSE 8080
