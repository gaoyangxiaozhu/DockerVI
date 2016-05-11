#!/bin/bash
if [ ! $1 ]; then
		echo "usage: $0 name"
		exit
	fi
NAME=$1
docker rm -f $NAME 2>/dev/null
docker run  --name $NAME --hostname $NAME --restart=always -p 32777:27017  -v `pwd`/session:/data/db  -d mongo
