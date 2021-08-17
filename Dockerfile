FROM node:12 as builder

WORKDIR /usr/src/app

COPY . .
RUN yarn install

ENTRYPOINT ["./node_modules/.bin/env-cmd" "./node_modules/.bin/react-scripts" "build"]