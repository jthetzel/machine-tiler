FROM ubuntu:17.10

RUN apt-get update -y \
    && apt-get install -y software-properties-common python-software-properties || true \
    && add-apt-repository -y ppa:ubuntu-toolchain-r/test \
    && apt-get update -y \
    && apt-get install -y curl libstdc++-5-dev

RUN curl https://nodejs.org/dist/v6.11.1/node-v6.11.1-linux-x64.tar.gz | tar zxC /usr/local --strip-components=1

RUN mkdir ~/mason \
    && curl -sSfL https://github.com/mapbox/mason/archive/v0.18.0.tar.gz | tar --gunzip --extract --strip-components=1 --exclude="*md" --exclude="test*" --directory=~/mason \
    && ~/mason/mason install tippecanoe 1.27.6 \
    && cp $(~/mason/mason prefix tippecanoe 1.27.6)/bin/* /usr/local/bin/

WORKDIR /usr/local/src/machine-tiler
ADD . /usr/local/src/machine-tiler

RUN cd /usr/local/src/machine-tiler && npm install

CMD ["./worker.js"]

