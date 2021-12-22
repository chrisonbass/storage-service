# !/bin/sh

docker stop str
docker image rm storage-service
docker build --tag storage-service .