FROM node:lts AS frontend-build-env
ENV NODE_ENV=production

WORKDIR /build

COPY ./client/. .

RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:lts
ENV NODE_ENV=production

WORKDIR /app

COPY ./server/. .
COPY --from=frontend-build-env /build/dist .

ENTRYPOINT [ "node","./src/server.js" ]