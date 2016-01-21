/**
@ngDoc dockerApp
@author gaoyangyang
@description
* angualr app for customer can operate docker remote api using visual interface
*/
var app = angular.module('dockerApp', ['ngRoute', 'pager', 'slider', 'angular.filter']);
app.directive('myTipDirective', function(){
    return {
        restrict: 'A',
        link:  function(scope, element, attrs){
            // $(element).tooltip();
            // 为了使用jquery.ui中的dialog功能 导致加载的full.min.js 和 custom.min.js产生了冲突
            // 使用tooltip API显示title信息 会出问题 目前先禁止使用tooltip 默认使用浏览器的title提示吧
            // 找解决方法
        }
    }
});
app.directive('detailsTab', function(){
    return {
        restrict: 'C',
        link:  function(scope, element, attrs){
            var cpuMorris=null;
            var memoryMorris = null;
            var networkMorris = null;
            var resourceItem = $(element).find('li.resource');

            // 点击myTab 显示对应的面板
            // nav show
            function nav_selected(){
                that = $(this);
                // 显示对应的面板
                tabId = that.find('a').data('href');
                $(tabId).addClass('active')
                .siblings().removeClass('active');
            }
            $(document).on('click', '#detailsTab li', function(e){
                e.preventDefault();
                that = $(this);
                nav_selected.call(that);
            });

            scope.$watchCollection('[graphData,]', function(){
                if(scope.graphData){
                    buildGraph(scope.graphData['data']);
                }
            });
            buildGraph = function(data){
                if(resourceItem.hasClass('active')){
                    cpuMorris=null;
                    memoryMorris = null;
                    networkMorris = null;
                    $('#cpuchart, #memorychart, #networkchart').children().remove();
                    buildCpuGraph(data);
                    buildMemoryGraph(data);
                    buildNetworkGraph(data);
                }else{
                    scope.showGraphForResourceFlag=false;
                }
            }
            buildMemoryGraph = function(graphData){
                var memoryData = [];
                if(!memoryMorris){
                    for(index in graphData){
                        var item={
                            'time': graphData[index]['collect_time'],
                            'memory_percent': graphData[index]['memory_percent']
                        };
                        memoryData.push(item);
                    }
                    memoryMorris=new Morris.Line({
                        // ID of the element in which to draw the chart.
                        element: 'memorychart',
                        // Chart data records -- each entry in this array corresponds to a point on
                        // the chart.
                        data: memoryData,
                        // The name of the data record attribute that contains x-values.
                        xkey: 'time',
                        // A list of names of data record attributes that contain y-values.
                        ykeys: ['memory_percent'],
                        // Labels for the ykeys -- will be displayed when you hover over the
                        // chart.
                        labels:['内存利用率'],
                        yLabelFormat: function (y) { return y.toString() + '%'; },

                    });
                }
            }
            buildCpuGraph = function(graphData){
                //TODO 测试用　
                var cpuData = [];
                if(!cpuMorris){
                    for(index in graphData){
                        var item={
                            'time': graphData[index]['collect_time'],
                            'cpu_percent': graphData[index]['cpu_percent']
                        };
                        cpuData.push(item);
                    }
                    cpuMorris=new Morris.Line({
                        // ID of the element in which to draw the chart.
                        element: 'cpuchart',
                        // Chart data records -- each entry in this array corresponds to a point on
                        // the chart.
                        data: cpuData,
                        // The name of the data record attribute that contains x-values.
                        xkey: 'time',
                        // A list of names of data record attributes that contain y-values.
                        ykeys: ['cpu_percent'],
                        // Labels for the ykeys -- will be displayed when you hover over the
                        // chart.
                        labels:['cpu利用率'],
                        yLabelFormat: function (y) { return y.toString() + '%'; },

                    });
                }
            }
            buildNetworkGraph=function(graphData){
                //TODO 测试用　
                var networkData = [];
                if(!networkMorris){
                    for(index in graphData){
                        var item={
                            'time': graphData[index]['collect_time'],
                            'network_rx_bytes': graphData[index]['network_rx_bytes'], //接受字节数
                            'network_tx_bytes': graphData[index]['network_tx_bytes'] //发送字节数
                        };
                        networkData.push(item);
                    }
                    networkMorris=new Morris.Line({
                        // ID of the element in which to draw the chart.
                        element: 'networkchart',
                        // Chart data records -- each entry in this array corresponds to a point on
                        // the chart.
                        data: networkData,
                        // The name of the data record attribute that contains x-values.
                        xkey: 'time',
                        // A list of names of data record attributes that contain y-values.
                        ykeys: ['network_rx_bytes', 'network_tx_bytes'],
                        // Labels for the ykeys -- will be displayed when you hover over the
                        // chart.
                        labels:['接收字节', '发送字节'],
                        yLabelFormat: function (y) { return y.toString() + 'Byte'; },

                    });
                }
            }

　      }
    }
});
app.directive('easyPieChart', function(){
    return {
        restrict: 'C',
        // Assign the angular scope attribute formatting
        scope: {
            cpuPercent: '=',
            memPercent: '=',
        },
        link: function(scope, element, attrs){
            // Hook in our watched items
            scope.$watchCollection('[cpuPercent, menPercent]', function(){
                build(scope, element, attrs);
            });
            function build(scope, element, attrs){
                /* 使用 圆饼图显示 资源使用情况*/
                var oldie = /msie\s*(8|7|6)/.test(navigator.userAgent.toLowerCase());
                $(element).easyPieChart({
                    barColor: $(element).data('color'),
                    trackColor: '#EEEEEE',
                    scaleColor: false,
                    lineCap: 'butt',
                    lineWidth: 8,
                    animate: oldie ? false : 1000,
                    size:75
                }).css('color', $(this).data('color'));

            }

        }
    }
});
app.factory('dialog', function(){
    //显示dialog fn为点击confirm后执行的函数， dialog为指定显示哪一个dialog
    return{
        show: function(fn, dialog){
            if(!dialog){
                return;
            }
             var buttonListOne=[
                   {
                       html: "<i class='icon-trash bigger-110'></i>&nbsp; Delete",
                       'class': 'btn btn-danger btn-xs',
                       'click': confirm,
                   },
                   {
                       html: "<i class='icon-remove bigger-110'></i>&nbsp; Cancel",
                       'class': 'btn btn-primary btn-xs',
                       'click': cancel
                   }
               ];
            var buttonListTwo=[
                {
                    html: "<i class='bigger-110'></i>&nbsp; OK",
                    'class': 'btn btn-danger btn-xs',
                    'click': confirm,
                }
            ]
            var buttons = dialog.hasClass('error')?  buttonListTwo: buttonListOne;

             function confirm(){
                 if(typeof(fn)=='function'){
                     fn();
                 }
                that = $(this);
                that.dialog('close');
             }
             function cancel(){
                that = $(this);
                that.dialog('close');
             }
             dialog.removeClass('hide').dialog({
                 resizable:false,
                 modal: true,
                 buttons: buttons
             })
        }
    }
})

app.factory('image', function($http, $location, dialog){
    var endpoint = 'http://10.103.241.154:2377/images/';
    var _images = []; //存储获得的镜像信息

    //service  main for  image
    // format_data 自定义image 属性 列表显示 镜像名称 tag time 以及virtualsize
    var format_data =function(data){
        var images= [];
        var imageName, imageTag, repo;
        for(index in data){
            var item = data[index];
             for(repoIndex in item['RepoTags']){
                 repo = item['RepoTags'][repoIndex];

                 imageName = repo.split(':')[0];
                 imageTag = repo.split(':')[1];
                 var image={};
                 image.name = imageName;
                 image.tag = imageTag;
                 image.time = item.Created*1000;
                 image.size = item.VirtualSize;

                 var alreadyHasFlag = false;
                //  如果当前镜像和已经存入的镜像相同 则遗弃
                 for(var index in images){
                     var oldImage = images[index];
                     if($.trim(oldImage.name)==image.name && $.trim(oldImage.tag == image.tag)){
                         alreadyHasFlag = true;
                         break;
                     }
                 }

                 if(!alreadyHasFlag){
                     images.push(image);
                 }
             }
        }
        return images;
    }
    return self={
        data: function(option, fn){
                var url = option ? endpoint+option.name+':'+option.tag+'/json': endpoint+'json';
                var option={
                    url: url,
                    method: 'GET'
                };
                $http(option)
                .success(function(data, status, headers){
                    data = format_data(data);
                    _images = data; //将data赋值为images
                    if(typeof(fn) == 'function'){
                        fn(data);
                    }
                });
        },
        remove: function(name, fn){
            var url = '/delete/images/';
            function get_do_remove(force){
                return function(){

                    delete_url= force? endpoint+name+'?force=True':endpoint+name;
                    var option = {
                        url: url,
                        method: 'POST',
                        params:{
                            delete_url:delete_url
                        }
                    }
                    $http(option)
                    .success(function(data, status, header){
                        if(data.status == 'ok'){
                            self.data(null, fn); //更新_images
                        }else{
                            if(data.code == '409' || data.code == '500'){
                                do_remove= get_do_remove(true);
                                dialog.show(do_remove, $('#dialog-delform2'));
                            }
                        }
                    })
                    .error(function(data, status, header){
                        if(status=='409'){
                            do_remove= get_do_remove(true);
                            dialog.show(do_remove, $('#dialog-delform2'));
                        }
                    })
                }
            }
          //   默认如果有依赖于镜像的实例，则不强制删除 即默认不加force=true参数

            do_remove=get_do_remove(false);
            dialog.show(do_remove, $('#dialog-delform'));
        },
        getSubList: function(start, end){
            var data= [];
            data = _images.slice(start, end);
            return data;
        },
        getLength: function(){
            return _images.length;
        }
    }

});
app.factory('container', function($http, $location, dialog){
    var endpoint = 'http://10.103.241.154:2377/containers/';
    var _containers= {}; //存储container列表

    // data 函数实体动态构建函数 如果isＬist为true 则返回一个函数用来获取整个container列表 否则返回一个data内部函数获取当前id的container信息
    // 在新一版的js中函数可以设置默认参数 现在还不行(本来想设置isList默认为true) 等以后有机会

    function data_fun_control(isList){
        if(isList){
            return function(id, fn){
                var data = _containers;
                if(typeof(fn)=='function'){
                    fn(data);
                }
            }
        }else{
            return function(id ,fn, key){
                // 如果key不为空 则函数最后返回data[key]的值

                var url = endpoint+id+'/json';
                var val = null;
                var option={
                    url: url,
                    method: 'GET'
                }
                $http(option)
                .success(function(data, status, headers){
                    data = format_data(data);

                    if(typeof(fn) == 'function'){
                        if(key){
                            fn(data, data[key]);
                        }else{
                            fn(data);
                        }

                    }
                })
                .error(function(data, status){
                    console.log(status);
                });
            }

        }
    }
    //获得container的运行状态
    function format_state_container(state){
        // 对于获得某一个container的详细信息的运行状态 state参数为一个object

        if(typeof(state) == 'string'){
            var stateStr = $.trim(state);
            var re = /Exited/;
            return stateStr? re.test(stateStr)? 'stop':'running' : 'error';
        }else{
            error = state['Error'];
            running = state['Running'];
            if(error){
                return 'error';
            }
            return running?'running':'stop';
        }
    }
    // format portbinds
    function format_bind_ports(portBindings){
        var portList=[];
        for(exposePort in portBindings){
            var bindPortList = portBindings[exposePort];
            if(bindPortList){
                for(var item in bindPortList){
                    var bindPort = bindPortList[item];
                    var item = {};
                    item.exposePort = exposePort;
                    item.bindHostIp = bindPort['HostIp'];
                    item.bindHostPort = bindPort['HostPort'];
                    portList.push(item);
                }
            }
        }
        // return porlist , the value that every item in list  is 'exposePort' , bindIp, bindHostPort
        return portList;
    }
    // format volumes
    function format_volumes(volumes){
        var volumesList = [];
        for(volumeInContainer in volumes){
            var item = {};
            item.volumeInContainer = volumeInContainer;
            item.volumeInHost = volumes[volumeInContainer];
            volumesList.push(item);
        }

        return volumesList;
    }
    // format env define by  self
    function format_env(env){
        var envList = [];
        for(index in env){
            var item={};
            item.name= env[index].split('=')[0];
            item.value = env[index].split('=')[1];

            envList.push(item);
        }

        return envList;
    }
    // format link
    function format_links(links){
        var linkList =[];
        for(index in links){
            var item = {};
            item.server = links[index].split(':')[0].slice(1);
            item.alias = links[index].split(':')[1].slice(1);

            linkList.push(item);
        }

        return linkList;
    }
    // format name
    function format_name_node(name){
        name = name.slice(1); //去掉首字符'/'
        var node_name=name.split('/');
        var node = node_name[0];
        var name = node_name[1];
        if(node && node[0] == '/'){
            node=node.slice(1);
        }
        if(name && name[0] == '/'){
            name=name.slice(1);
        }
        return [node, name];
    }

    // format APT function
    function format_data(data){
        // get state
        data.Status= format_state_container(data['State']);

        // get portList
        data.portList = format_bind_ports(data['HostConfig']['PortBindings']);

        // gett volumeList
        data.volumesList = format_volumes(data['Volumes']);

        // get envList
        data.envList = format_env(data['Config']['Env']);

        // get linkList
        data.linkList = format_links(data['HostConfig']['Links']);

        // get name  && node
        data.node_name = format_name_node(data['Name']);

        return data;
    }
    //service  main for  container
    var self=null;
    return self={
        init: function(){
            var url = endpoint+'json?all=1';
            var option={
                url: url,
                method:'GET',
                async: false
            };

            $.ajax(option)
            .done(function(data, status, XHR){
                for(item in data){
                    data[item]['Status'] = format_state_container(data[item]['Status']);
                    data[item]['node_name'] = format_name_node(data[item]['Names'][data[item]['Names'].length-1]);
                }
                _containers = data;
            })
            .fail(function(XHR, status, errorThrown){
                console.log(status);
            });
        },
        new: function(option, fn){
            var url = '/new/container/';
            var create_url= endpoint+'create?name='+option.Name;
            var newName = option.Name;
            delete option.Name;

            var data={
                'url': create_url,
                'params': option
            }
            data = JSON.stringify(data)

            var option={
                url: url,
                type: 'POST',
                data: data
            }
            $.ajax(option)
            .done(function(data, status, headers){
                //  创建成功后开启容器
                if(data.status == 'ok'){
                    afterStartFun = function(){
                        $location.path('/container/list');
                    }
                    self.start(newName, afterStartFun);
                }
                else{
                    //code 为 409 说明存在命名冲突
                    if(data.code=='409' || data.code == '500'){
                        confirm_fun= function(){
                            fn(data.code);
                        }
                        if(data.code=='500'){
                            dialog.show(confirm_fun, $('#dialog-servererrorform'))
                        }else{
                            dialog.show(confirm_fun, $('#dialog-renameConflictform'))
                        }

                    }
                }
            })
        },
        data: function(id, fn){
            // 如果id为空 获得container列表 否则获得当前id的container信息
            inner_data_process = id? data_fun_control(false): data_fun_control(true);
            inner_data_process(id, fn);

        },
        start: function(id, name, afterStartFun){
            var url = endpoint+id+'/start';
            var option={
                url:url,
                method: 'POST'
            }
            $http(option)
            .success(function(data, status, heades){
                if(typeof(afterStartFun)=='function'){
                    afterStartFun(data);
                }
                //运行成功以后 开启资源收集线程模块 收集资源使用状况
                self.storeResourceUsage(name)
            })
            .error(function(data, status, headers){
                console.log(status);
            });
        },
        storeResourceUsage: function(name){
            var url = '/get/resource_usage/'+name+'/';
            var option = {
                url: url,
                method: 'GET'
            }
            $http(option)
            .success(function(data, status, headers){
                console.log(data['status']);
            })
            .error(function(data, status, headers){
                console.log(data);
            })

        },
        resourceCollectForCurrentRunningContainers: function(){
            for(var index in _containers){
                var container = _containers[index];
                if(container['Status']=='running'){
                    name = container['node_name'][1];
                    self.storeResourceUsage(name);

                }
            }
        },
        stop: function(id, afterStopFun){
            var cUrl= endpoint+id+'/stop';
            var option={
                url: cUrl,
                method: 'POST'
            }
            $http(option)
            .success(function(data, status, headers){
                if(typeof(afterStopFun)=='function'){
                    afterStopFun(data);
                }
            })
            .error(function(data, status, headers){
                console.log(status)
                if(status=='304'){
                    // 如果304 表明容器内部服务已经运行完毕 容器自动停止了 这时重新刷新列表
                    // afterStopFun 一般用于更新contaienr.stop属性
                    if(typeof(afterStopFun)=='function'){
                        afterStopFun(data);
                    }
                }
            });
        },
        remove: function(id, fn){
            var url = '/delete/containers/';
            var delete_url= endpoint+id;
            function do_remove(){
              var option = {
                url: url,
                method: 'POST',
                params:{
                    'delete_url':delete_url
                }
              }
              $http(option)
              .success(function(data, status, header){
                  self.data(null, fn); //删除成功后，更新_containers变量
              })
              .error(function(data, status, header){
                  console.log(status);
              })
            }
            dialog.show(do_remove, $('#dialog-delform'));
        },
        getLog: function(id){
            var url = endpoint+id+'/logs?stderr=1&stdout=1';
            var option = {
                url: url,
                method: 'GET'
            }
            return $http(option);
        },
        getResourceStats: function(id){
            var url = '/containers/'+id+'/stats/';
            var option = {
                url: url,
                method: 'GET'
            }
            return $http(option);
        },
        getNameList: function(isRun,fn){// isRun 为 true的话， 只获得正在运行的docker实例的名字

            var url = endpoint+'json?all=1';
            var option = {
                url: url,
                method: 'GET'
            };
            $http(option)
            .success(function(data, status, headers){
                var nameList = [];
                var length = data.length;

                for(item in data){
                    var id = data[item]['Id'];

                    // inner_data_process函数主要用于获得当前对应的container的详细信息
                    var inner_data_process = data_fun_control(false);
                    length--; // length减为0 说明data已经遍历完了 此时nameList的值即为我们需要的结果 此时调用fn回调函数给$scope对应 的属性赋值

                    //callBack回调函数 用于在成功获取一个container实例信息后的执行的回调函数
                    callBack= function(){

                        // 因为callBack是回调函数 如果直接定义callBack的话， 在callBack函数内部使用item会出错 因此此时for循环已经遍历结束
                        // item为恒定 且其对应的data[item]为undefind(同理 length恒为0)
                        // 只能通过闭包设置currentＩtem
                        var currentItem = item;
                        var currentLength = length;
                        return function(containerDetail, status){
                                if(isRun && status =='running'|| (!isRun)){
                                    var names = data[currentItem]['Names'];
                                        name  = names[names.length-1]; //Names属性对应的数组中只有最后一个是真正的名字 其他项都是对应的link服务的别名
                                        name = name.split(':')[0].slice(1);
                                        nameList.push(name);
                                }
                                if(currentLength==0){
                                    if(typeof(fn) == 'function'){
                                        fn(nameList);
                                    }
                                }
                            }
                        }();

                    // Ｓtatus作为参数主要为了获取当前container的运行状态 就将作为参数传递给callBack函数作为参数
                    // 保证在callBack函数中其status参数为running时只添加运行的container name 或者全部container name
                    inner_data_process(id, callBack, 'Status');
                }
            })
            .error(function(data, status){
                console.log(status);
            });
        },
        // 用于实现翻页操作后获得对应的子数据项 并更新列表数据
        getSubList: function(start, end){
            var data= [];
            data = _containers.slice(start, end);
            return data;
        },
        getLength: function(){
            return _containers.length;
        }
    }

});
app.factory('resource', function($http, $location, dialog){
    var endpoint = 'http://10.103.241.154:2377/';
    return self={
        getInfo: function(fn){
            var url='/info';
            var info_url = endpoint+'info';
            option={
                url:url,
                method: 'GET',
                params:{
                    'info_url':info_url
                }
            };
            $http(option)
            .success(function(data, status, headers){
                if(data.status == 'ok'){
                    info = data.msg
                    for(item in info.node_array){
                        node = info.node_array[item];
                        var unit = (node.mem_use).replace(/[0-9]/g,'');
                        unit = $.trim(unit);
                        var memuse_value = parseInt(node.mem_use);
                        var memhas_value = parseInt(node.mem_has);

                        if(unit.indexOf('K')>=0){
                            memuse_value = memuse_value*1024
                        }
                        if(unit.indexOf('M')>=0){
                            memuse_value = memuse_value*1024*1024
                        }
                        if(unit.indexOf('G')>=0){
                            memuse_value = memuse_value*1024*1024*1024
                        }
                        memhas_value = memhas_value*1024*1024*1024
                        node.usage_rate_mem = (memuse_value/memhas_value)*100
                        node.usage_rate_mem = node.usage_rate_mem.toFixed(2)

                        node.usage_rate_cup = (node.cpu_use/node.cpu_has)*100
                        node.usage_rate_cup = node.usage_rate_cup.toFixed(2)

                        info.node_array[item] = node;
                    }
                    if(typeof(fn) == 'function'){
                        fn(info);
                    }
                }
            })
            .error(function(data, status, headers){

            })

        }
    };
});
app.config(['$routeProvider', function($routeProvider){

    $routeProvider
        .when('/image/list', {
            templateUrl: '/static/angular/list.html',
            controller: 'imageListController'
        })
        .when('/container/create/', {
            templateUrl: '/static/angular/create.html',
            controller: 'containerCreateController',
        })
        .when('/container/list', {
            templateUrl: '/static/angular/list.html',
            controller: 'containerController',
        })
        .when('/container/details/:ID', {
            templateUrl: '/static/angular/details.html',
            controller: 'containerDetailController'
        })
        .when('/resource', {
            templateUrl: '/static/angular/resource.html',
            controller: 'resourceController'
        })
        .otherwise({
            redirectTo: '/resource'
        });
}]);
