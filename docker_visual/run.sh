#!/bin/bash
NAME=docker_visual
docker build -t $NAME .
docker rm -f $NAME 2>/dev/null
docker run -d --name $NAME -p 18000:8000 $NAME
