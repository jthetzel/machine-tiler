FROM ubuntu:18.04

RUN apt-get update -y \
    && apt-get install -y software-properties-common || true \
    && add-apt-repository -y ppa:ubuntu-toolchain-r/test \
    && apt-get update -y \
    && apt-get install -y curl libstdc++-5-dev wget

RUN wget https://s3.amazonaws.com/watchbot-binaries/linux/v4.10.0/watchbot -O /usr/local/bin/watchbot
RUN chmod +x /usr/local/bin/watchbot

RUN curl https://nodejs.org/dist/v8.11.3/node-v8.11.3-linux-x64.tar.gz | tar zxC /usr/local --strip-components=1

RUN mkdir ./mason \
    && curl -sSfL https://github.com/mapbox/mason/archive/v0.18.0.tar.gz | tar --gunzip --extract --strip-components=1 --exclude="*md" --exclude="test*" --directory=./mason \
    && ./mason/mason install tippecanoe 1.27.6 \
    && cp $(./mason/mason prefix tippecanoe 1.27.6)/bin/* /usr/local/bin/

WORKDIR /usr/local/src/machine-tiler
ADD . /usr/local/src/machine-tiler

RUN cd /usr/local/src/machine-tiler && npm install

