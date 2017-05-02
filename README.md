# DockerVI
# *Important: This Project only supports docker v1.10 - v1.11 version and now is deprecated*

标签（空格分隔）： Docker

---
![docker][1]
> Project DockerVI is inspired by the idea of realize the Visible Management for **[Docker Swarm][2]** by using Docker Swarm Remote API . The goal is to provide a beauty and power pure client side implementation,  make  it is effortless to connect and manage docker swarm.


### Current implementation features
* **Role Based Access Control(RBAC)**
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
+ **Demo for show searching image  using name**
    - ![cluster](http://o9dop9y2w.bkt.clouddn.com/searchImage.png)

+  **Demo for show the real-time resource usages in Container**
    - ![real-time resource state](http://o9dop9y2w.bkt.clouddn.com/realTimeResourceUsage.png)

+ **Demo for show low-information in container**
    - ![information](http://o9dop9y2w.bkt.clouddn.com/detail.png)

+ **Demo for show the create container using image**
    - ![createContainer](http://o9dop9y2w.bkt.clouddn.com/containerCreate.png)

+ **Demo for show deleting container**
    - ![deleteContainer](http://o9dop9y2w.bkt.clouddn.com/deleteContainer.png)
+  **Demo for show Role Based Access Control**
    - ![user-manage](http://o9dop9y2w.bkt.clouddn.com/users.png)
+
   - ![login](http://o9dop9y2w.bkt.clouddn.com/login.png)



### Getting Started
DockerVI is self-contained and can be easily deployed via [docker-compose][7](Quick-Start steps below).
It mainly consists of four Container Services:

1. **ui:** The core part of this project , used for realizing the visual operation of the docker swarm.
2. **monitor:** Real-time access  the usage of resources in the Container in docker swarm cluster.
3. **mysql:** store the resource-usage data for every Container in docker swarm cluster.
4. **mongo** store users related information for authentication and authorization.
**System requirements:**  
DockerVI need works with docker 1.10+ and docker-compose 1.6.0+ and 8100,9090 port can be available.

1. Get the source code:

    ```sh
    $ git clone https://github.com/gaoyangxiaozhu/DockerVI.git
    ```
2. Edit the file **Deploy/config.js** and **monitor/config.js**, make necessary configuration changes such as hostname for deploy project and swarm address.

3. Install DockerVI with the following commands(Need networking for installing the dependencies). Note that the docker-compose process can take a while.
    ```sh
    $ cd Deploy
    $ ./prepare.sh #important

    $ docker-compose up
    ```

If everything worked properly, you should be able to open a browser to manage your docker swarm using
    `http:<deployed host ip>:8100`

**Notice:** Program does not support the low version of the IE browser, If you use IE to access, please upgrade to IE10+.

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
* Authority management
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
  [8]: http://o9dop9y2w.bkt.clouddn.com/detail.png
  [9]: http://o9dop9y2w.bkt.clouddn.com/users.png
  [10]:http://o9dop9y2w.bkt.clouddn.com/login.png
