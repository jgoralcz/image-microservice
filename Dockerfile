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
RUN rm -rf /var/lib/apt/lists/*

#RUN npm install sharp && npm install canvas && npm install pm2 -g && npm install
RUN npm install sharp && npm install canvas && npm install

# Bundle app source
COPY . .

EXPOSE 9002

#CMD ["pm2-runtime", "index.js", "-i", "max"]
CMD ["node", "index.js"]



