# DockerVI

标签（空格分隔）： Docker

---
![docker][1]
> Project DockerVI is inspired by the idea of realize the Visible Management for **[Docker Swarm][2]** by using Docker Swarm Remote API . The goal is to provide a beauty and power pure client side implementation,  make  it is effortless to connect and manage docker swarm.


### Current implementation features
* **Display the overall survey of cluster**.
* **Container:**
    * show Container list in swarm cluste.
    * Create, Running, Stop, Delete Container.
    * Look up the low-level information on the container.
    * View the real-time resource usage in Container.
    * View the stdout and stderr logs from the Container.
* **Image:**
    * show Image list in swarm cluste.
    * Search, Pull, Delete Image.
    * Create Container using Image.
* **Volume:**
    * show Volume list in swarm cluste.
    * Create, Delete Volume.
    * Search volume by using volume name or  node name in docker swarm cluster;
    * Look up the low-level detail information about volume.

### Some pictures for Demo
1. **Demo for show searching image  using name**
![cluster][3]
<br/>
2. **Demo for show the real-time resource usages in Container**
![real-time resource state][4]
<br/>
3. **Demo for show the create container using image**
![此处输入图片的描述][5]
<br/>
4. **Demo for show deleting container**
![此处输入图片的描述][6]
<br/>


### Getting Started
DockerVI is self-contained and can be easily deployed via [docker-compose][7](Quick-Start steps below).
It mainly consists of three Container Services:
1. **ui:** The core part of this project , used for realizing the visual operation of the docker swarm.
2. **monitor:** Real-time access  the usage of resources in the Container in docker swarm cluster.
3. **mysql:** store the resource-usage data for every Container in docker swarm cluster.

**System requirements:**  
DockerVI need works with docker 1.10+ and docker-compose 1.6.0+.

1. Get the source code:

    ```sh
    $ git clone https://github.com/gaoyangxiaozhu/DockerVI.git
    ```
2. Edit the file **Deploy/config.js**, make necessary configuration changes such as hostname for deploy project and swarm address.

3. Install DockerVI with the following commands. Note that the docker-compose process can take a while.
    ```sh
    $ cd Deploy
    $ ./prepare.sh

    $ docker-compose up
    ```

If everything worked properly, you should be able to open a browser to manage your docker swarm using
    `http:<deployed host ip>:8100`



### Stack
* [Angular](https://github.com/angular/angular.js)
* [nodeJs](https://nodejs.org/en/)
* [Express](https://github.com/expressjs/express/)
* [socket.io](https://github.com/socketio/socket.io/)
*  [Bootstrap](http://getbootstrap.com/)
* [Jade](http://jade-lang.com/)
* [Compass](http://compass-style.org/)
* [Docker compose](https://docs.docker.com/compose/overview/)


### Todo:
* Full remote swarm api support
* using websocket technology for entering the container to carry out the command operation  in browser-end
* Unit tests


### License
The DockerVI code is licensed under the MIT license.


  [1]: http://o9dop9y2w.bkt.clouddn.com/docker.png
  [2]: https://docs.docker.com/engine/swarm/
  [3]: http://o9dop9y2w.bkt.clouddn.com/searchImage.png
  [4]: http://o9dop9y2w.bkt.clouddn.com/realTimeResourceUsage.png
  [5]: http://o9dop9y2w.bkt.clouddn.com/containerCreate.png
  [6]: http://o9dop9y2w.bkt.clouddn.com/deleteContainer.png
  [7]: https://docs.docker.com/compose/overview/
