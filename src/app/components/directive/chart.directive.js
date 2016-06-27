(function () {
   'use strict';

   angular.module('dockerApp.directives')
       .directive('chart', ['Container', function (Container) {

           var socket;

           return {
               // Restrict to elements and attributes
               restrict:'EA',
               // Assign the angular link function
               link: filedLink
           };

           /**
            * Link the directive to enable our scope watch values
            *
            * @param {object} scope - Angular link scope
            * @param {object} el - Angular link element
            * @param {object} attrs - Angular link attribute
            */
           function filedLink(scope, el, attr){
                build(scope, el, attr);
                scope.$on("$destroy", function() {
                    //关闭当前socket连接并注销socket
                    if(socket){
                        socket.close();
                        socket = null;
                    }
                });
           }
        /*
        * The main build function used to determine the logic
        *
        * @param {Object} scope - The local directive scope object
        * @param {Object} attrs - The local directive attribute object
        */
        function build(scope, el, attr){

            /********************** start 针对24小时的资源数据 start ****************************/
            var cpuChar = echarts.init(document.getElementById('cpu'));
            var memChar = echarts.init(document.getElementById('mem'));
            var bandwidthChar = echarts.init(document.getElementById('bandwidth'));

            cpuChar.setOption({
                title　: {
                    text　: 'CPU利用率'
                },
                tooltip　: {
                    trigger　: 'axis'
                },
                toolbox　:　{
                    show　:　true,
                    feature　: {
                        dataZoom　: {},
                        dataView　: {readOnly　: false},
                        magicType　: {type　: ['line', 'bar']},
                        restore　: {},
                        saveAsImage　: {}
                    }
               },
               legend　:　{
                   data:['cpu利用率']
               },
               xAxis　:　{
                   type: 'category',
                   boundaryGap: false,
                   data　: []
               },
               yAxis　:　{
                   type　: 'value',
                   boundaryGap: [0, '60%'],
                   axisLabel　:　{
                       formatter　: '{value}%'
                   }
               },
               series　:　[
                  {
                      name　:　'cpu利用率',
                      type　:　'line',
                      data　:　[]
                  }
              ]
           });

           memChar.setOption({
               title　: {
                   text　: '内存使用量'
               },
               tooltip　: {
                   trigger　: 'axis'
               },
               toolbox　:　{
                   show　:　true,
                   feature　: {
                       dataZoom　: {},
                       dataView　: {readOnly　: false},
                       magicType　: {type　: ['line', 'bar']},
                       restore　: {},
                       saveAsImage　: {}
                   }
              },
              legend　:　{
                  data:['内存使用量(GB)']
              },
              xAxis　:　{
                  type: 'category',
                  boundaryGap: false,
                  data　: []
              },
              yAxis　:　{
                  type　: 'value',
                  boundaryGap: [0, '60%'],
                  axisLabel　:　{
                      formatter　: '{value}/Gb'
                  }
              },
              series　:　[
                 {
                     name　:　'内存使用量(GB)',
                     type　:　'line',
                     data　:　[]
                 }
             ]
          });

          bandwidthChar.setOption({
              title　: {
                  text　: '网络带宽'
              },
              tooltip　: {
                  trigger　: 'axis'
              },
              toolbox　:　{
                  show　:　true,
                  feature　: {
                      dataZoom　: {},
                      dataView　: {readOnly　: false},
                      magicType　: {type　: ['line', 'bar']},
                      restore　: {},
                      saveAsImage　: {}
                  }
             },
             legend　:　{
                 data:['入带宽', '出带宽']
             },
             xAxis　:　{
                 type: 'category',
                 boundaryGap: false,
                 data　: []
             },
             yAxis　:　{
                 type　: 'value',
                 boundaryGap: [0, '60%'],
                 axisLabel　:　{
                     formatter　: '{value}'
                 }
             },
             series　:　[
                {
                    name　:　'入带宽',
                    type　:　'line',
                    data　:　[]
                },
                {
                    name : '出带宽',
                    type : 'line',
                    data : []
                }
            ]
         });
        scope.$watchCollection('[dayResources, dayLoading]', function(){
            if(scope.dayLoading){
                cpuChar.showLoading();
                memChar.showLoading();
                bandwidthChar.showLoading();

            }

            if(scope.dayResources){
                cpuChar.hideLoading();
                memChar.hideLoading();
                bandwidthChar.hideLoading();

                var isEmpty = scope.dayResources.isEmpty; //判断是否获取的资源数据为空
                //如果资源数据不为空
                if(!isEmpty){
                    cpuChar.setOption({
                       xAxis:{
                           data: scope.dayResources.tm
                       },
                       series:[
                          {
                              name:'cpu利用率',
                              type:'line',
                              data:scope.dayResources.cpu
                          }
                      ]
                   });

                   memChar.setOption({
                      xAxis:{
                          data: scope.dayResources.tm
                      },
                      series:[
                         {
                             name:'内存使用量(GB)',
                             type:'line',
                             data:scope.dayResources.mem
                         }
                     ]
                  });

                  bandwidthChar.setOption({
                     xAxis:{
                         data: scope.dayResources.tm
                     },
                     series:[
                        {
                            name : '入带宽',
                            type : 'line',
                            data : scope.dayResources.rx
                        },
                        {
                            name : '出带宽',
                            type : 'line',
                            data : scope.dayResources.tx
                        }
                    ]
                 });
                }


            }

        });
/************************end 24小时　资源数据可视化绘制 end ********************************/

/************************start 针对实时资源数据获取　start ********************************/
        var cpuRealChar = echarts.init(document.getElementById('cpuReal'));
        var memRealChar = echarts.init(document.getElementById('memReal'));
        var bandwidthRealChar = echarts.init(document.getElementById('bandwidthReal'));

        cpuRealChar.setOption({
            title　: {
                text　: 'CPU利用率'
            },
            tooltip　: {
                trigger　: 'axis'
            },
            toolbox　:　{
                show　:　true,
                feature　: {
                    dataZoom　: {},
                    dataView　: {readOnly　: false},
                    magicType　: {type　: ['line', 'bar']},
                    restore　: {},
                    saveAsImage　: {}
                }
           },
           legend　:　{
               data:['cpu利用率']
           },
           xAxis　:　{
               type: 'category',
               boundaryGap: false,
               data　: []
           },
           yAxis　:　{
               type　: 'value',
               boundaryGap: [0, '60%'],
               axisLabel　:　{
                   formatter　: '{value}%'
               }
           },
           series　:　[
              {
                  name　:　'cpu利用率',
                  type　:　'line',
                  smooth : true,
                  areaStyle : {
                      normal : {}
                  },
                  data　:　[]
              }
          ]
        });

        memRealChar.setOption({
           title　: {
               text　: '内存使用量'
           },
           tooltip　: {
               trigger　: 'axis'
           },
           toolbox　:　{
               show　:　true,
               feature　: {
                   dataZoom　: {},
                   dataView　: {readOnly　: false},
                   magicType　: {type　: ['line', 'bar']},
                   restore　: {},
                   saveAsImage　: {}
               }
          },
          legend　:　{
              data : ['内存使用量(GB)']
          },
          xAxis　:　{
              type: 'category',
              boundaryGap: false,
              data　: []
          },
          yAxis　:　{
              type　: 'value',
              boundaryGap: [0, '60%'],
              axisLabel　:　{
                  formatter　: '{value}/Gb'
              }
          },
          series　:　[
             {
                 name　:　'内存使用量(GB)',
                 type　:　'line',
                 smooth : true,
                 areaStyle : {
                     normal : {}
                 },
                 data　:　[]
             }
         ]
        });

        bandwidthRealChar.setOption({
          title　: {
              text　: '网络带宽'
          },
          tooltip　: {
              trigger　: 'axis'
          },
          toolbox　:　{
              show　:　true,
              feature　: {
                  dataZoom　: {},
                  dataView　: {readOnly　: false},
                  magicType　: {type　: ['line', 'bar']},
                  restore　: {},
                  saveAsImage　: {}
              }
         },
         legend　:　{
             data : ['入带宽', '出带宽']
         },
         xAxis　:　{
             type : 'category',
             boundaryGap : false,
             data　: []
         },
         yAxis　:　{
             type　: 'value',
             boundaryGap : [0, '60%'],
             axisLabel　:　{
                 formatter　: '{value}'
             }
         },
         series　:　[
            {
                name　:　'入带宽',
                type　:　'line',
                smooth:true,
                areaStyle : {
                    normal : {}
                },
                data　:　[]
            },
            {
                name : '出带宽',
                type : 'line',
                smooth : true,
                areaStyle : {
                    normal : {}
                },
                data : []
            }
        ]
        });

        scope.$watchCollection('[realResources, realResources.cpu, realResources.mem, realResources.rx, realResources.tx, realResources.tm]', function(){
            if(scope.realResources){
                cpuRealChar.setOption({
                   xAxis:{
                       data: scope.realResources.tm
                   },
                   series:[
                      {
                          name:'cpu利用率',
                          type:'line',
                          data:scope.realResources.cpu
                      }
                  ]
               });

               memRealChar.setOption({
                  xAxis:{
                      data: scope.realResources.tm
                  },
                  series:[
                     {
                         name:'内存使用量(GB)',
                         type:'line',
                         data:scope.realResources.mem
                     }
                 ]
              });

              bandwidthRealChar.setOption({
                 xAxis:{
                     data: scope.realResources.tm
                 },
                 series:[
                    {
                        name : '入带宽',
                        type : 'line',
                        data : scope.realResources.rx
                    },
                    {
                        name : '出带宽',
                        type : 'line',
                        data : scope.realResources.tx
                    }
                ]
             });

            }

        });
        if(!socket){
            socket = io.connect('http://localhost:9090/resources');
            socket.on('message', function(data){
                if(data){
                    //code 为通知码　　０表示获取内容为空 １表示出错 2表示连接建立 3表示当前请求动作成功完成
                    switch (data.code) {
                        case 0 :
                            break;
                        case 1 ://error
                            break;
                        case 2:
                            socket.emit('init', scope.container.node, scope.container.name);
                            break;
                        case 3:
                            cb(null, data);
                            break;
                        default:

                    }
                    scope.$apply();
                }
            });
            socket.on('getContainerStats', function(results, init){
                console.log(results);
                if(init){
                    scope.realResources = results;
                    scope.$apply();
                    //只有容器处于运行状态才进行后续资源数据的获取
                    if(scope.container.status == 'running'){
                        socket.emit('sendResourceData', scope.container.node, scope.container.name);
                    }
                }else{
                    if(scope.realResources){
                        //如果获取的最后一行数据的时间和之前获取的数据的最后一行的时间一样　说明没有新的资源数据到达　不进行资源数据的更新
                        if(results && scope.realResources && scope.realResources.tm[scope.realResources.tm.length - 1 ] == results.tm[0]) return;
                        scope.realResources.cpu = scope.realResources.cpu.concat(results.cpu);
                        scope.realResources.mem = scope.realResources.mem.concat(results.mem);
                        scope.realResources.rx = scope.realResources.rx.concat(results.rx);
                        scope.realResources.tx = scope.realResources.tx.concat(results.tx);
                        scope.realResources.tm = scope.realResources.tm.concat(results.tm);
                        scope.$apply();
                    }

                }
            });
            //当容器由停止变为运行状态时　获取后续资源数据
            scope.$watchCollection('[container, changeStatus]', function(){
                if(scope.container && scope.container.status == 'running' && scope.changeStatus){
                    socket.emit('sendResourceData', scope.container.node, scope.container.name);
                }
            });
        }

/************************end 针对实时资源数据获取　end********************************/
    }
    }]);
})();
