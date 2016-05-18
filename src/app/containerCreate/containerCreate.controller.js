(function(){
    // container details page controller
    angular.module("dockerApp.containers")
    .controller('containerCreateCtrl', ['$scope', '$state', '$stateParams', 'Container', 'Image',  function($scope, $state, $stateParams, Container, Image){

        $scope.imageName = $state.params.name;
        $scope.imageTag = $state.params.tag;

        $scope.containerSize=[
            {
                'num': 128,
                'unit': 'M'
            },
            {
                'num': 256,
                'unit': 'M'
            },
            {
                'num': 512,
                'unit': 'M'
            },
            {
                'num': 1024,
                'unit': 'M'
            },
            {
                'num': 2048,
                'unit':'M'
            },
            {
                'num': 4096,
                'unit': 'M'
            }
        ];

        // 定义container

        $scope.container={};
        $scope.container.name="";
        $scope.container.size="128M";
        // cup相关
        $scope.container.cpuMin = 0;
        $scope.container.cpuMax =32;
        $scope.container.cpuFrom = $scope.container.cpuMin;
        $scope.container.cpuTo = $scope.container.cpuMax;
        // 端口相关

        $scope.portSt={};
        $scope.portSt.portInstanceList=[];
        $scope.portSt.newPort="";
        $scope.portSt.hostPort="";
        $scope.portSt.newPortRegex = false;
        $scope.portSt.hostPortRegex = false;

        // 环境变量相关

        $scope.env={};
        $scope.env.envInstanceList=[];
        $scope.envKey ="";
        $scope.envValue="";

        // volume 相关
        $scope.volume={};
        $scope.volume.volumeList=[];
        $scope.volumeHost="";
        $scope.volumeDest="";

        // link 相关
        $scope.link ={};
        $scope.link.linkInstanceList=[];
        $scope.linkName="";
        $scope.linkAlias="";


         // TODO cmd相关
         $scope.container.cmd = null; //默认 可为空

        // 用于判断是否正在通过表单数据创建数据

        $scope.waitForCreated = false;

        $scope.getStatusError = function(form, inputFileName){

            if(!form[inputFileName].$pristine || (form[inputFileName].$pristine && form.$submitted)){
                return form[inputFileName].$invalid;
            }
            return false;
        };
        $scope.createConteiner = function(){
            $scope.containerForm.$submitted = true;
            $scope.waitForCreated = false;
            if($scope.containerForm.$valid){
                $scope.waitForCreated = true;

                var get_post_data_format = function(containerName, containerSize, portList, envList, linkList, volumeList){
                    // 生成create container 所需要的参数
                    function get_cpu_shares(cpu){
                        cpuShares = cpu;
                        cpuShares = cpuShares > 32 ? 32: cpuShares
                        return cpuShares
                    }
                    function get_volume_format(volumeList){
                         var bindsArray = [];
                         for(var index in volumeList){
                             var volume = volumeList[index];
                             var item = [volume.volumeHost, volume.volumeDest].join(':');
                             bindsArray.push(item);
                         }
                         return bindsArray;
                     }
                    function get_env_format(envList){
                        var env = [];
                        for(index in envList){
                            var item = [envList[index]['envKey'], envList[index]['envValue']].join('=');
                            env.push(item);
                        }
                        return env;
                    }
                    function get_links_format(linkList){
                        var links = [];
                        for(index in linkList){
                            var item = [linkList[index]['name'], linkList[index]['alias']].join(':');
                            links.push(item);
                        }
                        return links;
                    }
                    function get_port_format(portList){
                        var ports = {};
                        console.log(portList);
                        for(index in portList){
                            if(ports[portList[index]['containerPort']]){
                                ports[portList[index]['containerPort']].push({'HostPort': portList[index]['hostPort']});
                            }else{
                                ports[portList[index]['containerPort']] = [{'HostPort': portList[index]['hostPort']}];
                            }
                        }
                        return ports;
                    }
                    function get_memory_format(size){
                        var unit = size.slice(-1);
                        var num = size.slice(0,-1);
                        var memory=0;
                        switch(unit){
                            case 'M': return num*1024*1024;
                            case 'G': return num*1024*1024*1024;
                        }
                    }
                    option = {};

                    option.Image= $scope.imageFullSourceName;
                    option.Name = containerName;

                    option.Env = get_env_format(envList);

                    // 由于使用了Django， ajax传递到后台的只能是表单格式的数据 不能出现某一个属性为对象 因此这里不能使用HostConfig了
                    option.HostConfig={};
                    //TODO 先简单这样处理了
                    if($.trim($scope.container.cmd)){
                        option.Cmd = $scope.container.cmd.split(' ');
                    }
                    // TODO 这里我设置了cpushares这个变量 数值越大cpu获得的相对资源比越大
                    option.HostConfig.Cpushares = parseInt(get_cpu_shares($scope.container.cpuTo));
                    option.HostConfig.Links = get_links_format(linkList);
                    option.HostConfig.PortBindings = get_port_format(portList);
                    option.HostConfig.Memory = get_memory_format(containerSize);
                    option.HostConfig.Binds = get_volume_format(volumeList);

                    // 调用创建container的服务
                    function callBack(statusCode){
                        if(statusCode=='409' || statusCode == '500'){
                            // callBack函数最终是在dialog的confirm按钮点击以后调用的
                            // 导致没有被angular的apply包裹 需要手动调用$apply方法，$apply会自动调用$digest()方法检查model的变化
                            $scope.waitForCreated = false;
                            $scope.$apply();
                        }
                    }
                    container.new(option, callBack);
                };
                // 执行ajax函数 根据表单数据生成container

                var postData = get_post_data_format($scope.container.name , $scope.container.size, //创建的cntainer的名字和大小
                                                    $scope.portSt.portInstanceList, //暴露和映射的端口
                                                    $scope.env.envInstanceList, //自定义环境变量
                                                    $scope.link.linkInstanceList, //链接服务
                                                    $scope.volume.volumeList) //挂载卷

            }

        }
        $scope.delItem =function(instance, scopeArrayList){
                var target = null;
                var instanceListLength = scopeArrayList.length;
                for(index in scopeArrayList){
                    if(scopeArrayList[index]==instance){
                        target=index;
                    }
                }
                scopeArrayList[target]= scopeArrayList[instanceListLength-1];
                scopeArrayList.pop();
        }
    }]);
    angular.module('dockerApp.containers')
    .controller('portFieldController', ['$scope', '$stateParams', 'Container', 'Image', function($scope, $stateParams, Container, Image){
        $scope.addPort=function(){
            $scope.portSt.newPortRegex = false;
            $scope.portSt.hostPortRegex = false;
            if($scope.addPortForm.$invalid){
                $scope.addPortForm.$submitted = true;
                return;
            }
            if(/^\s*\d+\s*$/.test($scope.portSt.newPort)){
                $scope.portSt.newPort=$.trim($scope.portSt.newPort);
                $scope.portSt.newPort=String($scope.portSt.newPort)+'/tcp';
            }
            if(/^\s*\d+\s*$/.test($scope.portSt.hostPort)){
                $scope.portSt.hostPort=$.trim($scope.portSt.hostPort);
                $scope.portSt.hostPort=String($scope.portSt.hostPort)+'/tcp';
            }
            var m = /[1-9]\d*\/tcp/gi;
            if(!$scope.portSt.newPort.match(m)){
                $scope.portSt.newPortRegex = true;
            }
            if(!$scope.portSt.hostPort.match(m) && $scope.portSt.hostPort){
                $scope.portSt.hostPortRegex = true;
            }
            if($scope.portSt.newPortRegex || $scope.portSt.hostPortRegex){
                return;
            }

            var newPortItem = {};
            newPortItem.containerPort = $scope.portSt.newPort;
            newPortItem.hostPort = $scope.portSt.hostPort;
            $scope.portSt.portInstanceList.push(newPortItem);
            $scope.portSt.newPort="";
            $scope.portSt.hostPort="";
            $scope.addPortForm.$setPristine();
            $scope.addPortForm.$submitted = false;

        }
        $scope.delePort =function(portInstance){
            $scope.delItem(portInstance, $scope.portSt.portInstanceList);
        }

    }]);
    angular.module('dockerApp.containers')
    .controller('envFieldController', ['$scope', '$stateParams', 'Container', 'Image', function($scope, $stateParams, Container, Image){
        $scope.addEnv=function(){
            if($scope.addEnvForm.$invalid){
                $scope.addEnvForm.$submitted = true;
                return;
            }

            var newEnvItem = {};
            newEnvItem.envKey = $scope.envKey;
            newEnvItem.envValue = $scope.envValue;

            $scope.env.envInstanceList.push(newEnvItem);

            $scope.envKey="";
            $scope.envValue="";
            $scope.addEnvForm.$setPristine();
            $scope.addEnvForm.$submitted = false;
        };
        $scope.deleEnv =function(envInstance){
            $scope.delItem(envInstance, $scope.env.envInstanceList);
        };

    }]);
    angular.module('dockerApp.containers')
    .controller('volumeFieldController', ['$scope', '$stateParams', 'Container', 'Image', function($scope, $stateParams, Container, Image){
         $scope.addVolume=function(){
             if($scope.addVolumeForm.$invalid){
                 $scope.addVolumeForm.$submitted = true;
                 return;
             }

             var newVolumeItem = {};
             newVolumeItem.volumeHost = $scope.volumeHost;
             newVolumeItem.volumeDest = $scope.volumeDest;

             $scope.volume.volumeList.push(newVolumeItem);

             $scope.volumeHost="";
             $scope.volumeDest="";
             $scope.addVolumeForm.$setPristine();
             $scope.addVolumeForm.$submitted = false;
         };
             $scope.delVolume =function(volume){
                 $scope.delItem(volume, $scope.volume.volumeList);
             };
    }]);
    angular.module('dockerApp.containers')
    .controller('containerLinkController', ['$scope', '$stateParams', 'Container', 'Image', function($scope, $stateParams, Container, Image){
        $scope.addLink=function(){
            if($scope.notChoosedLink){
                $scope.clickedAddBtn = true;
                return;
            }
            var newLinkItem = {};
            newLinkItem.name = $scope.linkName;
            newLinkItem.alias = $scope.linkAlias;

            $scope.link.linkInstanceList.push(newLinkItem);

            $scope.linkName = $scope.containerNameList[0];
            $scope.linkAlias= "";
            $scope.addLinkForm.$setPristine();
            $scope.addLinkForm.$submitted = false;
        };
        // 获取container的容器name列表
        // 通过container服务的getNameList接口获得name列表后执行大的回调函数  胡子药用于给scope的containerNameList赋值
        $scope.containerNameList=[];
        var defaultOption = "选择一个服务";
        $scope.containerNameList.push(defaultOption);
        var get_name_list =function(data){
            $scope.containerNameList= $scope.containerNameList.concat(data);
            // 设置下拉框的默认值
        };
        var data=[];
        $scope.containerNameList= $scope.containerNameList.concat(data);
        // 设置下拉框的默认值

        $scope.linkName=$scope.containerNameList[0];
        $scope.$watch('linkName', function(newVal, oldVal){
            // 如果没有选择一个服务 notChoosedLink = true

            if($.trim(newVal) == $scope.containerNameList[0]){
                $scope.notChoosedLink = true;
            }else{
                $scope.notChoosedLink = false;
                $scope.clickedAddBtn = false;
            }
        });

        $scope.notChoosedLink = true;
        $scope.clickedAddBtn = false;



        $scope.deleLink =function(linkInstance){
            $scope.delItem(linkInstance, $scope.link.linkInstanceList);
        };


    }]);

})();
