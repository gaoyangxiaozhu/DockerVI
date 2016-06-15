// image list page controller
(function(){
    angular.module("dockerApp.cluster")
    .controller('clusterCtrl', ['$scope', '$location', 'Cluster', 'Volume', function($scope, $location, Cluster, Volume){
        $scope.clusterList =[];
        $scope.container = {};

        $scope.swarm = {};
        $scope.swarm.container = {};
        $scope.swarm.host = {};
        $scope.swarm.cpu = {};
        $scope.swarm.mem = {};
        $scope.swarm.imageNums =  0;
        $scope.swarm.volumeNums = 0;
        $scope.swarm.nodes = 0;
        $scope.swarm.healtynodes = 0;

        Volume.getVolumesCount().then(function(result){
            $scope.swarm.volumeNums = result.count;
        });

        Cluster.getClusterList().then(function(results){
            $scope.swarm.nodes = results.nodes;
            $scope.swarm.healtynodes = results.healtynodes;
            $scope.swarm.imageNums = results.imageNums;


            $scope.swarm.mem.has = results.totalMemByGB;
            $scope.swarm.mem.use = (results.totalUsedMem / 1000 / 1000 / 1000).toFixed(2);


            $scope.swarm.cpu.has = results.totalCpu;
            $scope.swarm.cpu.use = results.totalUsedCpu;

            $scope.swarm.container.nums = results.containerNums;
            $scope.swarm.container.running = results.containerRunningNums;
            $scope.swarm.container.paused = results.containerPauseNums;
            $scope.swarm.container.stop =  results.containerStopNums;


            $scope.swarm.container.option = {
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b}: {c} ({d}%)"
                },
                legend: {
                    orient: 'horizontal',
                    top: '10%',
                    data:['运行中','暂停中','停止']
                },
               series: [
                   {
                       name:'容器状况',
                       type:'pie',
                       radius: ['40%', '55%'],

                       data:[
                           {value : $scope.swarm.container.running, name:'运行中'},
                           {value : results.containerPauseNums, name:'暂停中'},
                           {value : results.containerStopNums, name:'停止'}
                       ]
                   }
               ]
           };


           $scope.swarm.host.option = {
               tooltip: {
                   trigger: 'item',
                   formatter: "{a} <br/>{b}: {c} ({d}%)"
               },
               legend: {
                   orient: 'horizontal',
                   top: '10%',
                   data:['健康主机','异常主机']
               },
              series: [
                  {
                      name:'主机状况',
                      type:'pie',
                      radius: ['45%', '55%'],

                      data:[
                          {
                              value : $scope.swarm.nodes ,
                              name:'健康主机',
                              itemStyle:{
                                  normal:{
                                      color: '#12b668'
                                  }
                              }
                          },
                          {
                              value : $scope.swarm.nodes - $scope.swarm.healtynodes,
                              name:'异常主机',
                              itemStyle:{
                                  normal:{
                                      color: '#df5734'
                                  }
                              }
                          },
                      ]
                  }
              ]
          };


          $scope.swarm.cpu.option = {
              tooltip: {
                  trigger: 'item',
                  formatter: "{a} <br/>{b}: {c} ({d}%)"
              },
              legend: {
                  orient: 'horizontal',
                  top: '10%',
                  data:['可分配cpu核数','已分配cpu核数']
              },
             series: [
                 {
                     name:'cpu',
                     type:'pie',
                     radius: ['45%', '55%'],

                     data:[
                         {
                             value : $scope.swarm.cpu.has,
                             name :'可分配cpu核数',
                             itemStyle:{
                                 normal:{
                                     color: '#12b668'
                                 }
                             }
                         },
                         {
                             value : $scope.swarm.cpu.use,
                             name:'已分配cpu核数',
                             itemStyle:{
                                 normal:{
                                     color: '#60e5a6'
                                 }
                             }
                         },
                     ]
                 }
             ]
         };

         $scope.swarm.mem.option = {
             tooltip: {
                 trigger: 'item',
                 formatter: "{a} <br/>{b}: {c} ({d}%)"
             },
             legend: {
                 orient: 'horizontal',
                 top: '10%',
                 data:['可分配内存(GB)','已分配内存(GB)']
             },
            series: [
                {
                    name:'cpu',
                    type:'pie',
                    radius: ['45%', '55%'],

                    data:[
                        {
                            value : $scope.swarm.mem.has,
                            name:'可分配内存(GB)',
                            itemStyle:{
                                normal:{
                                    color: '#12b668'
                                }
                            }
                        },
                        {
                            value : $scope.swarm.mem.use / 1000 / 1000 / 1000,
                            name:'已分配内存(GB)',
                            itemStyle:{
                                normal:{
                                    color: '#60e5a6'
                                }
                            }
                        },
                    ]
                }
            ]
        };
        });
    }]);
})();
