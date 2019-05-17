FROM debian:8
FROM marcbachmann/libvips:latest

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && \
    apt-get -y install gcc mono-mcs && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get update \
    && apt-get install -y build-essential \
    && apt-get install -y curl \
    && apt-get upgrade -y \
    && curl -sL https://deb.nodesource.com/setup_11.x | bash - \
    && apt-get install -y nodejs \
    && apt-get install gcc g++ make

# graphicsmagick
RUN apt-get install -y graphicsmagick graphicsmagick-imagemagick-compat
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

RUN npm install npm -g. && npm install -g node-gyp && npm install sharp --build-from-source

# Bundle app source
COPY . .

EXPOSE 9002

CMD ["node", "index.js"]



