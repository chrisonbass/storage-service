FROM node:16.0.0

ARG DEBUG_PORT=9229
ARG INTERNAL_PORT=3000
ARG EXTERNAL_PORT=3000

COPY ./app /app

WORKDIR /app

RUN npm install -g express mocha file-type nodemon;
    # npm install -g mocha; \
    # npm install -g couchbase; \

ENV DEBUG_PORT=${DEBUG_PORT}
ENV INTERNAL_PORT=${INTERNAL_PORT}
ENV EXTERNAL_PORT=${EXTERNAL_PORT}}

# ENTRYPOINT [ "npm", "run", "debug" ]

# docker build --tag storage-service .
# docker run -v ~/personal/storage-service/app:/app --rm -dit --name str storage-service