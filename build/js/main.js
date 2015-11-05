$(function(){
  // 获取yyyy-mm-dd格式的时间
   function get_format_date(sec){
     var t = new Date(sec);
     return [[t.getFullYear(), t.getMonth()+1, t.getDate()].join('-'), [t.getHours()+1, t.getMinutes(), t.getSeconds()].join(':')].join(' ');
   }

  //  获得id的前15个字符
   function get_string_prefix(str){
      return str.slice(0, 20);
   }

//显示dialog
function show_dialog(fn, option){

  function confirm(){
    fn();
    that = $(this);
    that.dialog('close');
  }
  function cancel(){
    that = $(this);
    that.dialog('close');
  }
  dialog = option=='force'? $('#dialog-delform2'): $('#dialog-delform')
  dialog.removeClass('hide').dialog({
      resizable:false,
      modal: true,
      buttons: [
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
        ]
  })
}

 // docker相关API

 Docker = (function(){

    //  bind del btn for containers or images 点击触发remove function
     function bind_del_btn(){
       var that = $(this);
       var ids = that.jqGrid('getDataIDs');
       for(var i=0;i<ids.length; i++){
         delBtn ="<input type='button' value='删除' class='btn btn-danger btn-del-cm' data-id='"+that.jqGrid('getCell', ids[i], 'Id')+
         "'"+"data-row-id='"+ids[i]+"'/>";
         that.jqGrid('setRowData', ids[i], {Delete: delBtn});
       }
     }
     //ajax err 回调函数

     function err(xhr, textStatus, errorThrown){
         console.log(textStatus+' '+errorThrown);
     }
     //replace icons with FontAwesome icons like above

     function update_pager_icons(table) {
         var replacement =
         {
             'ui-icon-seek-first' : 'icon-double-angle-left bigger-140',
             'ui-icon-seek-prev' : 'icon-angle-left bigger-140',
             'ui-icon-seek-next' : 'icon-angle-right bigger-140',
             'ui-icon-seek-end' : 'icon-double-angle-right bigger-140'
         };
         $('.ui-pg-table:not(.navtable) > tbody > tr > .ui-pg-button > .ui-icon').each(function(){
             var icon = $(this);
             var $class = $.trim(icon.attr('class').replace('ui-icon', ''));

             if($class in replacement) icon.attr('class', 'ui-icon '+replacement[$class]);
         })
     }
     //Container对象定义

      function Containers(){

        var element = $("#cgrid");
        var elementPager = $("#cgrid-page");
        var urlPrefix = 'http://127.0.0.1:8080/containers/';
        // container grid选项
        var option = {
            datatype: 'local',
            colNames: [' ', 'Image', 'Id', 'Created', 'Status', 'Action'],
            colModel: [
                {name:'Delete', width:70, align:"center", fixed:true, sortable:false, resize:false},
                {name: 'Image', width: 200},
                {name: 'Id', width: 200},
                {name: 'Created', width: 200},
                {name: 'Status', width: 100, fixed:true, sortable:false, resize:true, align: 'center', formatter: initial_state_label},
                {name: 'Action', width:230, fixed:true, sortable:false, resize:true, align:'center', formatter:initial_dropbutton_action}
            ],
            rowNum:20,
            rowList:[10,20,30],
            pager: elementPager,
            altRows:true,
            height: 'auto',
            width:1001,
            viewrecords: true,
            hoverrows: false,
            caption: 'Container List',
            loadComplete : function() {
                var table = this;
                setTimeout(function(){
                    update_pager_icons(table);
                }, 0);
            },
            gridComplete: function(){
              that = element;
              //添加删除按钮
              bind_del_btn.call(that);
              that.find('.btn-del-cm').addClass('del-container-btn');
            }
        }
        //获得container的运行状态
        function get_state_container(stateStr){
            var stateStr = $.trim(stateStr);
            if(stateStr=='running'|| stateStr=='stop') return stateStr;
            var re = /Exited/;
            return stateStr? re.test(stateStr)? 'stop':'running' : 'error';
        }
        // update state contaier
        function update_container_state(state){

            var LabelHtmlTemplate= {
                err: "<span class='label label-danger label-xlg'>Error</span>",
                stop: "<span class='label label-xlg'>Stoped</span>",
                running: "<span class='label label-success label-xlg'>Running</span>"

            }
            switch(get_state_container(state)){
                case 'error': return LabelHtmlTemplate.err;
                case 'running': return LabelHtmlTemplate.running;
                case 'stop': return LabelHtmlTemplate.stop
            }

        }
        //set container state : error, stop, running ..
        function initial_state_label(cellvalue, options, rowObject){
            return update_container_state(cellvalue);
        }
        // update dropdown menu for current container
        function update_dropbutton_menu(id, status){
            var dropdownMenuTemplate = {
                noActionHead: "<div class='btn-group'>"+
                                "<button class='btn btn-sm'>No Action</button>",
                actionHead: "<div class='btn-group'>"+
                                "<button class='btn btn-sm btn-info'>Some Action</button>"+
                                "<button data-toggle='dropdown' class='btn btn-sm btn-info dropdown-toggle'><i class='icon-angle-down icon-only'></i></button>"+
                                "<ul class='dropdown-menu dropdown-yellow'>",
                noActionFooter :'</div>',
                actionFooter: '</ul></div>',

                stopState: function(id){
                        return ["<a href='#' class='start-container' data-id='"+id+"'>"+"Start</a>"];
                    },
                runningState: function(id){
                    return [
                            "<a href='#' class='stop-container' data-id='"+id+"'>"+"Stop</a>",
                            "<a href='#' class='restart-container' data-id='"+id+"'>"+"Restart</a>"
                        ];
                }

            }
            // 通过li元素拼接菜单数组
            function join_html_by_li(menuArray){
                return '<li>'+menuArray.join('</li><li>')+'</li>';
            }

            switch(get_state_container(status)){
                case 'error': return dropdownMenuTemplate.noActionHead+dropdownMenuTemplate.noActionFooter;
                case 'stop': return dropdownMenuTemplate.actionHead+join_html_by_li(dropdownMenuTemplate.stopState(id))+dropdownMenuTemplate.actionFooter;
                case 'running': return dropdownMenuTemplate.actionHead+join_html_by_li(dropdownMenuTemplate.runningState(id))+dropdownMenuTemplate.actionFooter;
            }
        }
        //initial dropdown-menu  in Containers for stop , pause , restart, start
        function initial_dropbutton_action(cellvalue, options, rowObject){
            return update_dropbutton_menu(rowObject['Id'], rowObject['Status']);
        }
        var inspect =function(id){

        }
        var remove = function(id, rowId){
          function do_remove(){
            var that  = element;
            if(!that.jqGrid('delRowData', rowId)){
              console.log('del failed');
            }
            var ajaxOption = {
              url: urlPrefix+id,
              type: 'DELETE',
              success: function(data){ console.log('remove');},
              error: err
            }
            $.ajax(ajaxOption);
          }
          show_dialog(do_remove);
        }
        var stop = function(id,fn){
            var option ={};
            var ajaxOption = {
              url: urlPrefix+id+'/stop',
              type: 'POST',
              success: function(data){ fn();},
              error: err
            }
            $.ajax(ajaxOption);

        }
        var restart = function(id,fn){
            var ajaxOption = {
              url: urlPrefix+id+'/restart',
              type: 'POST',
              success: function(data){fn()},
              error: err
            }
            $.ajax(ajaxOption);
        }
        var start = function(id,fn){
            var ajaxOption = {
              url: urlPrefix+id+'/start',
              type: 'POST',
              success: function(data){fn();},
              error: err
            }
            $.ajax(ajaxOption);
        }
        var init = function(){
          var that =element;
          var ajaxOption = {
            url: 'http://127.0.0.1:8080/containers/json?all=1',
            type: 'GET',
            dataType: 'json',
            success: function(data){
                for(var i =0; i< data.length; i++){
                  data[i]['Id']= get_string_prefix(data[i]['Id']);
                  data[i]['Created'] = get_format_date(data[i]['Created'])
                }
                option.data = data;
                that.jqGrid(option);
                that.jqGrid('navGrid', elementPager);
            },
            error: err
          }
          $.ajax(ajaxOption);
        }
        return {
          init: init,
          inspect: inspect,
          remove : remove,
          start: start,
          restart: restart,
          stop: stop,
          updateContainerState:update_container_state,
          updateDropButtonMenu: update_dropbutton_menu
        }

      }
      //Images对象定义

      function Images(){

        var element = $('#mgrid');
        var elementPager = $('#mgrid-page');
        var urlPrefix = "http://127.0.0.1:8080/images/";
        // images grid选项
        var option = {
            datatype: 'local',
            colNames: ['', 'Repository', 'Id', 'Created', 'VirtualSize', 'Size'],
            colModel: [
                {name: 'Delete', width: 70, align:"center", fixed:true, sortable:false, resize:false},
                {name: 'RepoTags', width: 200},
                {name: 'Id', width: 200},
                {name: 'Created', width: 200},
                {name: 'VirtualSize', width: 180},
                {name: 'Size', width: 100}
            ],
            rowNum:20,
            rowList:[10,20,30],
            height: 'auto',
            width: 1004,
            pager: elementPager,
            caption: 'Images List',
            viewrecords: true,
            loadComplete : function() {
                var table = this;
                setTimeout(function(){
                    update_pager_icons(table);
                }, 0);
            },
            gridComplete: function(){
              var that = element;
              // 添加删除按钮
              bind_del_btn.call(that);
              that.find('.btn-del-cm').addClass('del-image-btn')
            }
        }
        var serialize_repotags= function(repoTags){
          return repoTags.join(',');
        }
        var inspect = function(id){

        }
        var remove = function(id, rowId){
            //force为true  强制删除镜像 默认不强制删除

          function get_do_remove(force){
              var that = element;
              return function(){

                  url= force? urlPrefix+id+'?force=True':urlPrefix+id;
                  var ajaxOption = {
                    url: url,
                    type: 'DELETE',
                    success: function(data){
                        if(!that.jqGrid('delRowData', rowId)){
                          window.reload();
                        }
                    },
                    error: function(xhr, textStatus, errorThrown){
                        if(xhr.status=='409'){
                            do_remove= get_do_remove(true)
                            show_dialog(do_remove, 'force');
                        }
                    }
                  }
                  $.ajax(ajaxOption);
              }

          }
        //   默认如果有依赖于镜像的实例，则不强制删除 即默认不加force=true参数

          do_remove=get_do_remove(false);
          show_dialog(do_remove);
        }
        var init = function(){
          var ajaxOption = {
            url: 'http://127.0.0.1:8080/images/json',
            type: 'GET',
            dataType: 'json',
            success: function(data){
                for(var i =0; i< data.length; i++){
                  data[i]['RepoTags']= serialize_repotags(data[i]['RepoTags']);
                  data[i]['Id']= get_string_prefix(data[i]['Id']);
                  data[i]['Created'] = get_format_date(data[i]['Created']);
                }
                option.data = data;
                var that = element;
                that.jqGrid(option);
                that.jqGrid('navGrid', elementPager);
            },
            error: function(xhr, textStatus, errorThrown){
              console.log(errorThrown);
            }
          }
          $.ajax(ajaxOption);
        }

        return {
          init: init,
          inspect: inspect,
          remove : remove
        }
      }
      var container = Containers();//获取containers 实例
      container.init() //container初始化
      var image = Images(); //获得 images实例
      image.init() //images初始化

      // 绑定container images删除事件

      $(document).on( 'click', '.del-container-btn, .del-image-btn', function(){
          var that = $(this);
          var id = that.data('id');
          var rowId = that.data('row-id');
          if(that.hasClass('del-container-btn')){
            container.remove(id, rowId);
          }else{
            image.remove(id, rowId);
          }

      });

      function common_action_for_container_button(newState){
          that = $(this);
          currentActionTd= that.parents('td');
          currentStateTd = currentActionTd.prev('td');
          var id = that.data('id');
          return option={
              id:id,
              //action remove api 调用并执行成功后的回调函数 主要用于更新state和更新菜单选项

              succ: function succ(){
                  currentStateTd.html(container.updateContainerState(newState));
                  currentActionTd.html(container.updateDropButtonMenu(id, newState));
              }
          }

      }
    //   绑定stop container event

      $(document).on('click', '.stop-container', function(e){
            e.preventDefault();
            option=common_action_for_container_button.call(this, 'stop');
            // 调用 docker reomte api 停止 当前container
            // succ为ajax成功后在success回调函数内部执行的函数

            container.stop(option.id, option.succ);

      });

    //  绑定start container event
    $(document).on('click', '.start-container', function(e){
        e.preventDefault();
        option =common_action_for_container_button.call(this, 'running');
        //调用docker remote api 启动当前的container

        container.start(option.id, option.succ);
    });

    //绑定restart container event
    $(document).on('click', '.restart-container', function(e){
        option=common_action_for_container_button.call(this, 'running');
        // 调用docker remote api 重启当前的container

        container.restart(option.id, option.succ);

    })
   })();
});
