FROM node:12

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# node canvas
RUN apt-get update && apt-get install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++
# graphicsmagick (jimp)
RUN apt-get update -y && apt-get install -y graphicsmagick graphicsmagick-imagemagick-compat
RUN apt-get clean

# the following is taken from: https://github.com/lovell/sharp/issues/955
RUN apt-get update && apt-get install --force-yes -yy \
  libjemalloc1 \
  && rm -rf /var/lib/apt/lists/*

# Change memory allocator to avoid leaks
ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.1

RUN npm install sharp && npm install canvas && npm install gif-encoder-2 && npm install gif-frames && npm install
#RUN npm install sharp && npm install canvas && npm install pm2 -g && npm install

# Bundle app source
COPY . .

EXPOSE 9002

CMD ["node", "./src/server.js", "10"]



