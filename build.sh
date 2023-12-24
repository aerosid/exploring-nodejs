#!/bin/bash
set -e 
set -x
docker build --network host  -t node-dev:24DEC2023 .