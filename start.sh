# !/bin/sh

docker run -v ~/dev/personal/storage-service/app:/app -p 8000:3000 -p 8001:9229 --network=todo-app-network --rm -dit --name str storage-service