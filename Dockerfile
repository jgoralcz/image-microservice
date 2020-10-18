FROM joshgor01/ubuntu_node_opencv:latest
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install opencv
RUN npm install sharp
RUN npm install canvas
RUN npm install gifencoder && npm install gif-encoder-2 && npm install gif-frames
RUN npm install smartcrop-gm && npm install gm
RUN apt-get install autoconf -y
RUN apt-get install dh-autoreconf -y
RUN npm install imagemin imagemin-mozjpeg imagemin-giflossy imagemin-pngquant

RUN npm install

COPY . .

EXPOSE 9002

CMD ["npm", "start"]



