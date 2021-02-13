FROM node:lts-alpine AS frontend-build-env

WORKDIR /build

COPY ./client/. .

RUN yarn install --frozen-lockfile && \ 
    yarn build

FROM node:lts-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY ./server/. .

RUN yarn install --frozen-lockfile

COPY --from=frontend-build-env /build/dist ./dist

ENTRYPOINT [ "yarn","start" ]