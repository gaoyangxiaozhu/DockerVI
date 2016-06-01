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
               smooth:true,
               areaStyle: {
                   normal: {}
               },
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
              data:['内存使用量(GB)']
          },
          xAxis　:　{
              type: 'category',
              boundaryGap: false,
              smooth:true,
              areaStyle: {
                  normal: {}
              },
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
             data:['入带宽', '出带宽']
         },
         xAxis　:　{
             type: 'category',
             boundaryGap: false,
             smooth:true,
             areaStyle: {
                 normal: {}
             },
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

        var socket = io.connect('http://localhost:9000/resources');

        socket.on('notice', function(msg){
            if(msg == 'OK'){
                socket.emit('init', scope.container.name);
            }else{
                //TODO 出错怎么友好处理
                console.log(msg);
            }
            scope.$apply();
        });
        socket.on('getContainerStats', function(results, init){
            if(init){
                console.log('init');
                console.log(results);
                socket.emit('sendResourceData', scope.container.name);
            }else{
                console.log(results);
            }
        });



/************************end 针对实时资源数据获取　end********************************/
    }
    }]);
})();
