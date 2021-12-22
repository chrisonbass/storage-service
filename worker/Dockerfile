FROM node:15.7.0

COPY ./app /app

RUN apt-get update; \
    apt-get upgrade -y;

RUN apt-get install clamav -y

WORKDIR /app

RUN npm install -g express; \
    npm install -g mocha; \
    npm install -g nodemon;

# ENTRYPOINT [ "npm", "run", "debug" ]