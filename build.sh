#!/bin/bash
set -e 
set -x
docker build --network host -f Dockerfile -t node:24DEC2023 .
