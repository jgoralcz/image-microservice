FROM joshgor01/ubuntu_node_opencv:latest

COPY package*.json ./

RUN npm install git+https://git@github.com/jgoralcz/node-opencv.git --force
RUN npm install sharp
RUN npm install canvas && npm install gif-encoder-2
RUN npm install gifencoder
RUN npm install gif-frames
RUN npm install smartcrop-gm && npm install gm
RUN apt-get install autoconf -y
RUN apt-get install dh-autoreconf -y
RUN npm install imagemin imagemin-mozjpeg imagemin-giflossy
RUN npm install

COPY . .

EXPOSE 9002

CMD ["node", "./src/server.js", "10"]



