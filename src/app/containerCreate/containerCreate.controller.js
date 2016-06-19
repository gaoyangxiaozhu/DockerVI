(function(){
    // container details page controller
    angular.module("dockerApp.containers")
    .controller('containerCreateCtrl', ['$scope', '$state', '$stateParams', 'Container', 'Image', 'SweetAlert','formatData', function($scope, $state, $stateParams, Container, Image, SweetAlert, formatData){

        var _imageId = $state.params.id;
        var source = $state.params.source;

        //根据镜像来源进行image相关数据的初始化工作
        if(source ==='remote'){
            $scope.remote = true;
            $scope.imageName = _imageId;
            $scope.imageTag = 'latest';
        }else{
            Image.getImageDetail({id : _imageId}).then(function(result){
                $scope.imageName = result.name;
                $scope.imageSize = result.size;
                $scope.imageTag = result.tag;
            });
        }

        $scope.step = 1; //默认第一步
        //TODO 应该改为从配置文件读取或从后台读取可配置的容器大小信息
        $scope.containerSize=[
            {
                mem: '128M',
                cpu: '1CPU(共享)',
                level: 'XXS',
            },
            {
                mem: '256M',
                cpu: '1CPU(共享)',
                level: 'XS'
            },
            {
                'mem': '512M',
                'cpu': '1CPU(共享)',
                'level': 'S',
            },
            {
                'mem': '512M',
                'cpu': '2CPU(共享)',
                'level': 'M',
            },
            {
                'mem': '1024M',
                'cpu': '2CPU(共享)',
                'level': 'M+',
            }
        ];
        // 定义container
        $scope.container = {};
        $scope.container.name ="";
        $scope.container.size = $scope.containerSize[0];

        $scope.available = {};
        $scope.available.name = true;
        // 端口相关
        $scope.portSt = {};
        $scope.portSt.portInstanceList = [];
        $scope.portSt.newPort = "";
        $scope.portSt.hostPort = "";
        $scope.portSt.newPortRegex = false;
        $scope.portSt.hostPortRegex = false;

        // 环境变量相关
        $scope.env = {};
        $scope.env.envInstanceList = [];
        $scope.envKey = "";
        $scope.envValue = "";

        // volume 相关
        $scope.volume = {};
        $scope.volume.volumeList = [];
        $scope.volumeHost = "";
        $scope.volumeDest = "";

        // link 相关
        $scope.link = {};
        $scope.link.linkInstanceList = [];
        $scope.linkName = "";
        $scope.linkAlias = "";


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

        $scope.nextStep = function(step){
            switch (step) {
                case 1:
                    $scope.step = 1;
                    break;
                case 2:
                    //如果需要到第二步　当前在第三步的话　直接返回
                    if($scope.step === 3){
                        $scope.step = 2;
                        return;
                    }
                    //如果当前在第一步　并且containerName符合条件　就进入下一步
                    if($scope.available.name){
                        $scope.step = 2;
                    }
                    break;
                case 3:
                    $scope.step = 3;
                    break;
                default:

            }
        };

        $scope.createConteiner = function(){
            $scope.waitForCreated = true;
            // 执行ajax函数 根据表单数据生成container
            var imageName = $scope.imageTag == 'latest' ? $scope.imageName : [$scope.imageName, $scope.imageTag].join(":");
            var postData = formatData.getPostDataFormat(imageName, //镜像名
                                                $scope.container.name , $scope.container.size, //创建的cntainer的名字和大小
                                                $scope.portSt.portInstanceList, //暴露和映射的端口
                                                $scope.env.envInstanceList, //自定义环境变量
                                                $scope.link.linkInstanceList, //链接服务
                                                $scope.volume.volumeList, //挂载卷
                                                $scope.container.cmd); //自启动命令

           Container.createContainer({ postData: postData}).then(function(result){
               $scope.waitForCreated = true;
               if(result.msg && result.msg == 'ok'){
                   //如果创建成功就启动容器并在返回容器列表页面
                   $state.go(
                       'containerDetail',{
                           id : $scope.container.name, 
                          new : $scope.container.name
                      }
                  );
              }else{//显示错误信息
                  SweetAlert.swal({
                      title: result.status + ' Error',
                      text: result.error_msg,
                      type: "warning",
                      confirmButtonColor: "#DD6B55",
                      confirmButtonText: "确定",
                      closeOnConfirm: true },
                      function(){
                            $state.reload();
                      }
                  );
              }
          });
      };

      $scope.delItem =function(instance, scopeArrayList){
          var target = null;
          var instanceListLength = scopeArrayList.length;
          for(var index in scopeArrayList){
              if(scopeArrayList[index]　==　instance){
                  target　=　index;
              }
          }
          scopeArrayList[target]　= scopeArrayList[instanceListLength-1];
          scopeArrayList.pop();
        };
    }]);

    angular.module('dockerApp.containers')
    .controller('containerFormController', ['$scope', '$stateParams', 'Container', 'Image', function($scope, $stateParams, Container, Image){

        //选择容器实例大小
        $scope.selectContainerSize = function(s){
            $scope.container.size = s;
        };
        $scope.checkContainerName = function(){
            var name = $scope.container.name ? $scope.container.name.trim() : "";
            if(name){
                if(name[0] === '_' || name[0] === '-'){
                    $scope.available.name = false;
                    switch (name[0]) {
                        case '-':
                            $scope.available.nameErrorMsg="容器名称不能以-开头";
                            break;
                        default:
                            $scope.available.nameErrorMsg="容器名称不能以_开头";
                    }
                }else{
                    if(!(/^[a-zA-Z0-9-_]*$/.test(name))){
                        $scope.available.name = false;
                        $scope.available.nameErrorMsg="容器名称只能包含英文字母，数字以及中划线 -以及下划线";
                    }else{
                        $scope.available.name = true;
                    }
                }
            }else{
                $scope.available.name = false;
                $scope.available.nameErrorMsg="服务名称不能为空";
            }
        };

    }]);
    angular.module('dockerApp.containers')
    .controller('portFieldController', ['$scope', '$stateParams', 'Container', 'Image', function($scope, $stateParams, Container, Image){
        $scope.addPort = function(){
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
                $scope.portSt.hostPort=String($scope.portSt.hostPort);
            }
            var reg1 = /[1-9]\d*\/tcp/gi;
            var reg2 = /[1-9]\d*/gi;
            if(!$scope.portSt.newPort.match(reg1)){
                $scope.portSt.newPortRegex = true;
            }
            if(!$scope.portSt.hostPort.match(reg2) && $scope.portSt.hostPort){
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

        };
        $scope.delePort = function(portInstance){
            $scope.delItem(portInstance, $scope.portSt.portInstanceList);
        };

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

            $scope.envKey = "";
            $scope.envValue = "";
            $scope.addEnvForm.$setPristine();
            $scope.addEnvForm.$submitted = false;
        };
        $scope.deleEnv = function(envInstance){
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

        $scope.containerNameList=[];
        var defaultOption = "选择一个服务";
        $scope.containerNameList.push(defaultOption);

        // 获取container的容器name列表
        Container.getContainerList({ running: true }).then(function(result){
            $scope.containerNameList = $scope.containerNameList.concat(result);
        });
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
