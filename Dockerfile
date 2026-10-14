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

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/eea-datahub/browser /usr/share/nginx/html

EXPOSE 8080
