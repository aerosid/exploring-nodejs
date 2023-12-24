FROM node:current-bookworm-slim
RUN apt update \
&& apt install -y vim dnsutils openssl curl wget tree git
USER node:node
WORKDIR /home/node