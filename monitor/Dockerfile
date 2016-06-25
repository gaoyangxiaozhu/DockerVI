#设置集成镜像
FROM node:5.11.1

#作者信息
MAINTAINER from BUPT by gaoyangyang (gyycoder@gmail.com)

RUN mkdir -p /monitor

ADD package.json /monitor/

WORKDIR /monitor
RUN npm install --production

ADD . /monitor/
