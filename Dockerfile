FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json .npmrc ./
# The npm_token secret is read by .npmrc to install the @geocat packages
# from GitHub Packages. It is only mounted for this RUN, so it ends up
# in no layer, image metadata or build cache.
RUN --mount=type=secret,id=npm_token,required=true \
    GITHUB_PACKAGES_AUTH_TOKEN="$(cat /run/secrets/npm_token)" \
    npm ci --legacy-peer-deps --ignore-scripts

COPY . .
RUN npx ng build

FROM nginxinc/nginx-unprivileged:1.30-alpine

# GeoNetwork 5 API base path used by the UI, served in /config.json.
# nginx.conf is a template: the image entrypoint runs envsubst on it at
# startup, limited to GEONETWORK_* and NGINX_LOCAL_RESOLVERS so nginx
# variables are left alone.
ENV GEONETWORK_API_URL=/catalogue \
    NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1 \
    NGINX_ENVSUBST_FILTER="^(GEONETWORK_|NGINX_LOCAL_RESOLVERS)"

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/eea-datahub/browser /usr/share/nginx/html

EXPOSE 8080

# source, revision, created and version are added by the Jenkinsfile with
# `docker build --label`.
# url and licenses override the ones inherited from the nginx base image.
# licenses is empty until the project declares a license.
LABEL org.opencontainers.image.title="EEA DataHub" \
      org.opencontainers.image.description="EEA DataHub Angular UI served by nginx" \
      org.opencontainers.image.url="https://github.com/eea/datahub" \
      org.opencontainers.image.licenses=""
