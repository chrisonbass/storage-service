FROM node:16.0.0

COPY ./app /app

WORKDIR /app

RUN npm install -g express mocha file-type nodemon;
    # npm install -g mocha; \
    # npm install -g couchbase; \

# ENTRYPOINT [ "npm", "run", "debug" ]

# docker build --tag storage-service .
# docker run -v ~/personal/storage-service/app:/app --rm -dit --name str storage-service