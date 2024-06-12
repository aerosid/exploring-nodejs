#!/bin/bash
set -e
set -x
# image user:group (postgresml:postgresml, 1000:1000) is synchronized with WSL user ubuntu:ubuntu.
docker run \
--rm \
--interactive \
--tty \
--network host \
--name postgresml \
--volume data:/var/lib/postgresql \
ghcr.io/postgresml/postgresml:2.7.3 \
sudo -u postgresml psql -d postgresml