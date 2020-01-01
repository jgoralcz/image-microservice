FROM joshgor01/ubuntu_node_opencv:latest

COPY package*.json ./

RUN npm install git+https://git@github.com/jgoralcz/node-opencv.git --force \
  && npm install sharp && npm install --save smartcrop-sharp \
  && npm install canvas && npm install gif-encoder-2 && \
  npm install gifencoder && npm install gif-frames && \
  npm install

COPY . .

EXPOSE 9002

CMD ["node", "./src/server.js", "10"]



