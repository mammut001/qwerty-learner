FROM node:24 AS build
WORKDIR /app
COPY package.json yarn.lock .yarnrc ./
RUN corepack enable && corepack prepare yarn@1.22.22 --activate && yarn install --frozen-lockfile --ignore-scripts
COPY . .
ARG VITE_STUDY_API_BASE_URL=
ENV VITE_STUDY_API_BASE_URL=$VITE_STUDY_API_BASE_URL
ARG BUILD_COMMIT_SHA
RUN test -n "$BUILD_COMMIT_SHA" || (echo "Pass BUILD_COMMIT_SHA via --build-arg" >&2; exit 1)
ENV BUILD_COMMIT_SHA=$BUILD_COMMIT_SHA
ARG VITE_FIREBASE_AUTH_DOMAIN=
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_UMAMI_WEBSITE_ID=
ENV VITE_UMAMI_WEBSITE_ID=$VITE_UMAMI_WEBSITE_ID
RUN npm run build -- --base=/

FROM nginx:alpine
COPY ./public/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /app
