FROM node:15.7.0

ARG DEBUG_PORT=9229
ARG INTERNAL_PORT=3000
ARG EXTERNAL_PORT=3000

COPY ./src /app

RUN apt-get update; \
    apt-get upgrade -y;

RUN apt-get install clamav -y

WORKDIR /app

RUN npm install -g mocha; \
    npm install -g nodemon;

ENV DEBUG_PORT=${DEBUG_PORT}
ENV INTERNAL_PORT=${INTERNAL_PORT}
ENV EXTERNAL_PORT=${EXTERNAL_PORT}}

# ENTRYPOINT [ "nodemon", "worker.js" ]