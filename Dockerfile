FROM node:12

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# graphicsmagick
RUN apt-get update -y && apt-get install -y graphicsmagick graphicsmagick-imagemagick-compat
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

RUN npm install sharp && npm install

# Bundle app source
COPY . .

EXPOSE 9002

CMD ["node", "index.js"]



