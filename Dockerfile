FROM node:8 as builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN yarn install

COPY . .
RUN yarn build

FROM debian:buster-slim
ENV VERSION_PCRE pcre-8.43
ENV VERSION_ZLIB zlib-1.2.11
ENV VERSION_OPENSSL openssl-1.1.1c
ENV VERSION_NGINX nginx-1.17.3


ENV OPGP_PCRE=45F68D54BBE23FB3039B46E59766E084FB0F43D8
ENV OPGP_ZLIB=5ED46A6721D365587791E2AA783FCD8E58BCAFBA
ENV OGPG_OPENSSL=7953AC1FBC3DC8B3B292393ED5E9E43F7DF9EE8C
ENV OGPG_NGINX=B0F4253373F8F6F510D42178520A9993A1C052F8

ENV SOURCE_PCRE=https://ftp.pcre.org/pub/pcre/
ENV SOURCE_ZLIB=https://zlib.net/
ENV SOURCE_OPENSSL=https://www.openssl.org/source/
ENV SOURCE_NGINX=https://nginx.org/download/

# Set where OpenSSL and NGINX will be built
ENV BPATH /usr/local/src/nginx

# Set variable so ngx_brotli static module can be compiled into nginx by itself
ENV NGX_BROTLI_STATIC_MODULE_ONLY=1

RUN \
    BUILD_DEPS='build-essential ca-certificates curl dirmngr git gnupg libssl-dev' && \
    set -x && \
    DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y --no-install-recommends \
      $BUILD_DEPS && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir $BPATH && \
    cd $BPATH && \
    curl -fSL $SOURCE_PCRE$VERSION_PCRE.tar.gz -o pcre.tar.gz && \
    tar xzf pcre.tar.gz && \
    curl -fSL $SOURCE_ZLIB$VERSION_ZLIB.tar.gz -o zlib.tar.gz && \
    tar xzf zlib.tar.gz && \
    curl -fSL $SOURCE_OPENSSL$VERSION_OPENSSL.tar.gz -o openssl.tar.gz && \
    curl --ipv4 -fSL $SOURCE_OPENSSL$VERSION_OPENSSL.tar.gz.asc -o openssl.tar.gz.asc && \
    export GNUPGHOME="$(mktemp -d)" && \
    ( gpg --no-tty --keyserver ipv4.pool.sks-keyservers.net --recv-keys "$OGPG_OPENSSL" "$OPGP_PCRE" "$OPGP_ZLIB" \
    || gpg --no-tty --keyserver ha.pool.sks-keyservers.net --recv-keys "$OGPG_OPENSSL" "$OPGP_PCRE" "$OPGP_ZLIB") && \
    gpg --batch --verify openssl.tar.gz.asc openssl.tar.gz && \
    tar xzf openssl.tar.gz && \
    git clone https://github.com/google/ngx_brotli --depth=1 && \
    cd ngx_brotli && \
    git submodule update --init && \
    cd .. && \
    addgroup --system nginx && \
    adduser --disabled-password --system --home /var/cache/nginx --shell /sbin/nologin --group nginx && \
    curl -fSL $SOURCE_NGINX$VERSION_NGINX.tar.gz -o nginx.tar.gz && \
    curl -fSL $SOURCE_NGINX$VERSION_NGINX.tar.gz.asc -o nginx.tar.gz.asc && \
    ( gpg --no-tty --keyserver ipv4.pool.sks-keyservers.net --recv-keys "$OGPG_NGINX"  \
    || gpg --no-tty --keyserver ha.pool.sks-keyservers.net --recv-keys "$OGPG_NGINX") && \
    gpg --batch --verify nginx.tar.gz.asc nginx.tar.gz && \
    tar xzf nginx.tar.gz && \
    cd $BPATH/$VERSION_NGINX && \
    ./configure \
    --prefix=/etc/nginx \
    --sbin-path=/usr/sbin/nginx \
   --with-cc-opt='-O3 -fPIE -fstack-protector-strong -Wformat -Werror=format-security' \
    --with-ld-opt='-Wl,-Bsymbolic-functions -Wl,-z,relro' \
    --with-pcre=$BPATH/$VERSION_PCRE \
    --with-zlib=$BPATH/$VERSION_ZLIB \
    --with-openssl-opt="no-weak-ssl-ciphers no-ssl3 no-shared enable-ec_nistp_64_gcc_128 -DOPENSSL_NO_HEARTBEATS -fstack-protector-strong" \
    --with-openssl=$BPATH/$VERSION_OPENSSL \
    --modules-path=/usr/lib/nginx/modules \
    --conf-path=/etc/nginx/nginx.conf \
    --error-log-path=/var/log/nginx/error.log \
    --http-log-path=/var/log/nginx/access.log \
    --pid-path=/var/run/nginx.pid \
    --lock-path=/var/run/nginx.lock \
    --http-client-body-temp-path=/var/cache/nginx/client_temp \
    --http-proxy-temp-path=/var/cache/nginx/proxy_temp \
    --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp \
    --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp \
    --http-scgi-temp-path=/var/cache/nginx/scgi_temp \
    --user=nginx \
    --group=nginx \
    --with-file-aio \
    --with-http_auth_request_module \
    --with-http_gunzip_module \
    --with-http_gzip_static_module \
    --with-http_mp4_module \
    --with-http_realip_module \
    --with-http_secure_link_module \
    --with-http_slice_module \
    --with-http_ssl_module \
    --with-http_stub_status_module \
    --with-http_sub_module \
    --with-http_v2_module \
    --with-pcre-jit \
    --with-stream \
    --with-stream_ssl_module \
    --with-threads \
    --without-http_empty_gif_module \
    --without-http_geo_module \
    --without-http_split_clients_module \
    --without-http_ssi_module \
    --without-mail_imap_module \
    --without-mail_pop3_module \
    --without-mail_smtp_module \
    --add-module=$BPATH/ngx_brotli && \
    make && \
    make install && \
    rm -rf /etc/nginx/html/ && \
    mkdir /etc/nginx/conf.d/ && \
    mkdir -p /etc/nginx/sites-available/ && \
    mkdir -p /etc/nginx/sites-enabled/ && \
    mkdir -p /usr/share/nginx/html/ && \
    install -m644 html/index.html /usr/share/nginx/html/ && \
    install -m644 html/50x.html /usr/share/nginx/html/ && \
    strip /usr/sbin/nginx* && \
    apt-get purge -y --auto-remove $BUILD_DEPS && \
    rm -fr /tmp/* /var/tmp/* "$BPATH" "$GNUPGHOME" && \
    \
    # Forward request and error logs to docker log collector
    ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

#rm -rf /etc/nginx/sites-enabled/default
COPY nginx.conf /etc/nginx/nginx.conf

COPY nginx.default.conf /etc/nginx/sites-available/default.conf
RUN ln -s /etc/nginx/sites-available/default.conf /etc/nginx/sites-enabled/default.conf

COPY --from=builder /usr/src/app/build /usr/share/nginx/html



EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
