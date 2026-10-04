FROM node:24 AS build
WORKDIR /app
COPY package.json yarn.lock .yarnrc ./
RUN corepack enable && corepack prepare yarn@1.22.22 --activate && yarn install --frozen-lockfile --ignore-scripts
COPY . .
RUN npm run build -- --base=/

FROM nginx:alpine
COPY ./public/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /app
