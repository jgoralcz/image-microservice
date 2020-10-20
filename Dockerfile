FROM joshgor01/ubuntu_node_opencv:latest

COPY package*.json ./

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

COPY --chown=node:node assets/ /usr/node/assets
COPY --chown=node:node package*.json /usr/node/
COPY --chown=node:node src/ /usr/node/src/
COPY --chown=node:node config.json /usr/node/

WORKDIR /usr/node

RUN mkdir logs && chown -R node:node logs

RUN npm install opencv
RUN npm install sharp
RUN npm install canvas
RUN npm install gifencoder && npm install gif-encoder-2 && npm install gif-frames
RUN npm install smartcrop-gm && npm install gm
RUN apt-get install autoconf -y
RUN apt-get install dh-autoreconf -y

RUN npm install

WORKDIR /usr/node/src
USER node

EXPOSE 8443

CMD ["npm", "start"]



