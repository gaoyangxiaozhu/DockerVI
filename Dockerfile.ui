FROM node:5.12.0

MAINTAINER from BUPT by gaoyangyang (gyycoder@gmail.com)

COPY . /gyyzyp/docker_swarm/ui
WORKDIR /gyyzyp/docker_swarm/ui

#install node-gyp
RUN npm i -g node-gyp

#install nodemon
RUN npm install -g nodemon

#install app dependency using package.json
RUN npm install --production

EXPOSE 8100
EXPOSE 9090

CMD ["nodemon"]
