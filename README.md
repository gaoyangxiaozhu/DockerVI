# docker-visual

实现可视化操作docker 远程 api

##操作
1. 设置docker配置文件**DOCKER_OPTS**选项, 增加远程访问端口以及设置可实现跨域访问，如```-H tcp://0.0.0.0:8080 --api-cors-header='*'```实现docker守护进程监听在本地8080端口
2. 进入build目录，执行```python3 -m http.server ```
3. 在浏览器输入```localhost:8000```即可通过docker remote api访问本地监听在8080端口的docker数据
4. **注意** 由于一些js和字体及css文件使用的google提供的资源，需要开启外网

