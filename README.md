#DOCKER 可视化

标签（空格分隔）： Docker


---
实现可视化操作docker 远程 api
可用于swarm集群或单机docker引擎的远程控制管理
##采用angular+django实现


##仓库目录说明
1. **source**文件存放的模板文件和样式文件的源码，其中angular子目录中的```*.jade```为局部的模板文件,其编译生成的```html```文件用作angular的路由控制,实现不同路由下局部刷新，
2. **docker-visual**目录是整个**app**的项目根目录,其各个子目录或者和其他```Django```官网介绍一致,不再过多介绍.

##功能说明
目前**docker api**可视化只实现了
1. container列表的显示<br>
2. 单个container的删除、运行、停止<br>
3. 单个container内部的 IP、端口、数据卷、日志以及自定义环境变量的查看<br>
4. image列表的显示<br>
5. 单个image的删除<br>
6. 通过image创建container实例<br>

##使用说明
```clone```仓库文件到本地,在终端运行**docker-visual**目录下的run.sh文件, 然后在浏览器输入0.0.0.0:18000, 即可与远程进行docker集群的可视化管理
