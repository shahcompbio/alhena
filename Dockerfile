FROM node:12 as builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN yarn install

COPY . .

RUN yarn install
RUN ./node_modules/.bin/env-cmd -f ".spectrum.prod.env" ./node_modules/.bin/react-scripts build

FROM ubuntu
  RUN apt-get update && apt-get install -y nginx
  RUN ln -sf /dev/stdout /var/log/nginx/access.log
  RUN ln -sf /dev/stderr /var/log/nginx/error.log
  RUN rm -rf /etc/nginx/sites-enabled/default

  COPY --from=builder /usr/src/app/build /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/conf.d/default.conf

  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
