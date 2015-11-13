# docker-visual

实现可视化操作docker 远程 api

##操作
1. 设置docker配置文件**DOCKER_OPTS**选项, 增加远程访问端口以及设置可实现跨域访问，如```-H tcp://0.0.0.0:8080 --api-cors-header='*'```实现docker守护进程监听在本地8080端口
2. 进入build目录，执行```python3 -m http.server ```
3. 在浏览器输入```localhost:8000```即可通过docker remote api访问本地监听在8080端口的docker数据
4. **注意** 由于一些js和字体及css文件使用的google提供的资源，需要开启外网

## TODO

- [ ] 显示统一使用中文；
- [ ] `删除` 放到最后一列;
- [ ] 容器列表的属性为`名称、镜像、状态、主机、创建时间`;
- [ ] 镜像列表的熟性为`名称，id，大小,标签（标签可能很多，注意显示)`;
- [ ] 增加资源列表, 具体属性可以使用`docker info`,查看，以下是demo：
```
Containers: 11
Images: 12
Role: primary
Strategy: spread
Filters: health, port, dependency, affinity, constraint
Nodes: 3
 master: 192.168.122.217:2375
  └ Containers: 9
  └ Reserved CPUs: 0 / 1
  └ Reserved Memory: 0 B / 1.019 GiB
  └ Labels: executiondriver=native-0.2, kernelversion=3.13.0-24-generic, operatingsystem=Ubuntu 14.04 LTS, storagedriver=aufs
 node1: 192.168.122.215:2375
  └ Containers: 1
  └ Reserved CPUs: 0 / 1
  └ Reserved Memory: 0 B / 1.019 GiB
  └ Labels: executiondriver=native-0.2, kernelversion=3.13.0-24-generic, operatingsystem=Ubuntu 14.04 LTS, storagedriver=aufs
 node2: 192.168.122.216:2375
  └ Containers: 1
  └ Reserved CPUs: 0 / 1
  └ Reserved Memory: 0 B / 1.019 GiB
  └ Labels: executiondriver=native-0.2, kernelversion=3.13.0-24-generic, operatingsystem=Ubuntu 14.04 LTS, storagedriver=aufs
CPUs: 3
Total Memory: 3.058 GiB
Name: d880c68eae01
```
- [ ] 增加容器细节页面，可以查看某个容器的信息，包括`端口、日志、命令、状态`等，可以参考道客云或者灵雀云的界面;
- [ ] 增加新建实例大小模版，比如`small(16MB RAM 1CPU),medium(256MB RAM 1CPU),large(512MB RAM 2CPU)`,这个模块docker没有支持我们可以自己创建定义，参考openstack `flavor`
- [ ] network
- [ ] volume

