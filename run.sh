#!/bin/bash
set -e
set -x
# image user:group (node:node, 1000:1000) is synchronized with WSL user ubuntu:ubuntu.
docker run \
--detach \
--rm \
--name nodejs \
--network host \
--user 1000:1000  \
--volume /etc/timezone:/etc/timezone:ro \
--volume /etc/localtime:/etc/localtime:ro \
--volume /home/ubuntu/.bashrc:/home/node/.bashrc:ro \
--volume /home/ubuntu/.profile:/home/node/.profile:ro \
--volume /home/ubuntu/.git-credentials:/home/node/.git-credentials:ro \
--volume /home/ubuntu/.gitconfig:/home/node/.gitconfig:ro \
--volume /home/ubuntu/vscode/exploring-nodejs:/home/node \
--workdir /home/node \
node-dev:24DEC2023 tail -f /dev/null
sleep 3s
docker exec -it nodejs bash