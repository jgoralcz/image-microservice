FROM joshgor01/ubuntu_node_opencv:latest

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

COPY --chown=node:node assets/ /usr/node/assets
COPY --chown=node:node package*.json /usr/node/

WORKDIR /usr/node

RUN mkdir logs && chown -R node:node logs

RUN apt-get install autoconf -y
RUN apt-get install dh-autoreconf -y

RUN npm install opencv
RUN npm install sharp@0.28.3
RUN npm install canvas@2.6.1
RUN npm install gifencoder && npm install gif-encoder-2 && npm install gif-frames
RUN npm install smartcrop-gm && npm install gm
RUN npm install git+https://github.com/jgoralcz/gif-resize.git

RUN npm install

COPY --chown=node:node config.json /usr/node/
COPY --chown=node:node src/ /usr/node/src/

WORKDIR /usr/node/src
USER node

EXPOSE 8443

CMD ["npm", "start"]



