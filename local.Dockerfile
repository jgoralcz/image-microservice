FROM joshgor01/image-microservice:beta

COPY --chown=node:node config.json /usr/node/src
COPY --chown=node:node src/ /usr/node/src
COPY --chown=node:node package*.json /usr/node/src

WORKDIR /usr/node

EXPOSE 8443

CMD ["npm", "start"]
