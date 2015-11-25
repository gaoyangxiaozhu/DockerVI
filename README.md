# docker-visual

实现可视化操作docker 远程 api

##采用angular实现

##操作
1. 设置docker配置文件**DOCKER_OPTS**选项, 增加远程访问端口以及设置可实现跨域访问，如```-H tcp://0.0.0.0:8080 --api-cors-header='*'```实现docker守护进程监听在本地8080端口
2. 进入build目录，执行```python3 -m http.server ```
3. 在浏览器输入```localhost:8000```即可通过docker remote api访问本地监听在8080端口的docker数据

##仓库目录说明
1. 主目录下的 ```*.jade```和```*.styl```都是源文件，编译生成的```html```和```css```文件都在**build**目录下，**build**目录也是程序的**运行目录**
2. **build**目录下的**assets**目录是原有的第三方文件，
   **css**目录存放的是styl编译生成的css文件，
   **js**目录放的是用于实现控制器、服务和指令的js文件,这些js文件也是整个app的主要核心部分
##功能说明
目前**docker api**可视化只实现了<br>
1. container列表的显示<br>
2. 单个container的删除、运行、停止<br>
3. 单个container内部的 IP、端口、数据卷、日志以及自定义环境变量的查看<br>
4. image列表的显示<br>
5. 单个image的删除<br>
6. 通过image创建container实例<br>
