FROM joshgor01/image-microservice:beta

COPY --chown=node:node assets/ /usr/node/assets
COPY --chown=node:node config.json /usr/node/src
COPY --chown=node:node src/ /usr/node/src
COPY --chown=node:node package*.json /usr/node/src

WORKDIR /usr/node

EXPOSE 8443

# Change memory allocator to avoid "leaks"
# ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.1

CMD ["npm", "start"]
