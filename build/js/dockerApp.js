/**
@ngDoc dockerApp
@author gaoyangyang
@description
* angualr app for customer can operate docker remote api using visual interface
*/
var app = angular.module('dockerApp', ['ngRoute', 'pager', 'slider']);
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
            var buttons = dialog.hasClass('conflict-form')?  buttonListTwo: buttonListOne;

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
    var endpoint = 'http://0.0.0.0:8080/images/';
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

                 images.push(image);
             }
        }
        console.log(images);
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
            function get_do_remove(force){
                return function(){

                    url= force? endpoint+name+'?force=True':endpoint+name;
                    var ajaxOption = {
                      url: url,
                      method: 'DELETE'
                    }

                    $http(ajaxOption)
                    .success(function(data, status, header){
                        if(typeof(fn=='function')){
                             fn();
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
    }

});
app.factory('container', function($http, $location, dialog){
    var endpoint = 'http://0.0.0.0:8080/containers/';
    var _containers= {}; //存储container列表

    // data 函数实体动态构建函数 如果isＬist为true 则返回一个函数用来获取整个container列表 否则返回一个data内部函数获取当前id的container信息
    // 在新一版的js中函数可以设置默认参数 现在还不行(本来想设置isList默认为true) 等以后有机会

    function data_fun_control(isList){
        if(isList){
            return function(id, fn){
                var url = endpoint+'json?all=1';
                var option={
                    url: url,
                    method:'GET'
                };
                $http(option)
                .success(function(data, status, headers){
                    for(item in data){
                        data[item]['Status'] = format_state_container(data[item]['Status']);
                        data[item]['node_name'] = format_name_node(data[item]['Names'][data[item]['Names'].length-1]);
                    }
                    _containers = data;
                    if(typeof(fn)=='function'){
                        fn(data);
                    }
                })
                .error(function(data, status){
                    console.log(status);
                });
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
                for(bindPort in bindPortList){
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
        var node_name=name.split(':');
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
        new: function(option, fn){
            var url= endpoint+'create?name='+option.Name;
            var newName = option.Name;
            delete option.Name;
            var ajaxOption={
                url: url,
                method: 'POST',
                data: option
            }
            $http(ajaxOption)
            .success(function(data, status, headers){
                //  创建成功后开启容器
                self.start(newName);
                $location.path('/container/list');
            })
            .error(function(data, status,  headers){
                if(status=='409'){
                    confirm_fun= function(){
                        fn('409');
                    }
                    dialog.show(confirm_fun, $('#dialog-renameConflictform'))
                }
            })
        },
        data: function(id, fn){
            // 如果id为空 获得container列表 否则获得当前id的container信息

            inner_data_process = id? data_fun_control(false): data_fun_control(true);
            inner_data_process(id, fn);

        },
        start: function(id, afterStartFun){
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
            })
            .error(function(data, status, headers){
                console.log(status);
            });
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
                console.log(status);
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
            var url= endpoint+id;
            function do_remove(){
              var ajaxOption = {
                url: url,
                method: 'DELETE',
              }

              $http(ajaxOption)
              .success(function(data, status, header){
                  if(typeof(fn=='function')){
                       fn();
                  }
              })
              .error(function(data, status, header){
                  console.log(status);
              })
            }
            dialog.show(do_remove, $('#dialog-delform'));
        },
        getLog: function(id){
            var cUrl = endpoint+id+'/logs?stderr=1&stdout=1';
            var option = {
                url: cUrl,
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
        }
    }

})
app.config(['$routeProvider', function($routeProvider){

    $routeProvider
        .when('/image/list', {
            templateUrl: 'list.html',
            controller: 'imageListController'
        })
        .when('/container/create/', {
            templateUrl: 'create.html',
            controller: 'containerCreateController',
        })
        .when('/container/list', {
            templateUrl: 'list.html',
            controller: 'containerController',
        })
        .when('/container/details/:ID', {
            templateUrl: 'details.html',
            controller: 'containerDetailController'
        })
        .otherwise({
            redirectTo: '/image/list'
        });
}]);
