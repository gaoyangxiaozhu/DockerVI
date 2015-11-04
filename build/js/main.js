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
function show_dialog(fn){

  function confirm(){
    fn();
    that = $(this);
    that.dialog('close');
  }
  function cancel(){
    that = $(this);
    that.dialog('close');
  }
  $('#dialog-delform').removeClass('hide').dialog({
      title: 'Delete Data?',
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

      function Containers(){

        var element = $("#cgrid");
        var elemntPager = $("#cgrid-page");
        // container grid选项
        var option = {
            datatype: 'local',
            colNames: [' ', 'Image', 'Id', 'Created', 'Status'],
            colModel: [
                {name:'Delete', width:70, align:"center"},
                {name: 'Image', width: 150},
                {name: 'Id', width: 200},
                {name: 'Created', width: 200},
                {name: 'Status', width: 180}
            ],
            rowNum:30,
            rowList:[10,20,30],
            pager: elemntPager,
            altRows:true,
            height: 'auto',
            hoverrows: false,
            caption: 'Container List',
            gridComplete: function(){
              that = element;
              //添加删除按钮
              bind_del_btn.call(that);
              that.find('.btn-del-cm').addClass('del-container-btn');
            }
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
              url: 'http://127.0.0.1:8080/containers/'+id,
              type: 'DELETE',
              success: function(data){
                console.log('success');
              },
              error: function(xhr, textStatus, errorThrown){
                  console.log(errorThrown);
              }
            }
            $.ajax(ajaxOption);
          }
          show_dialog(do_remove);
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
                console.log(data);
                console.log(that);
                that.jqGrid(option);
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
      function Images(){

        var element = $('#mgrid');
        var elementPager = $('#mgrid-page');
        // images grid选项
        var option = {
            datatype: 'local',
            colNames: ['', 'Repository', 'Id', 'Created', 'VirtualSize', 'Size'],
            colModel: [
                {name: 'Delete', width: 70, align:"center"},
                {name: 'RepoTags', width: 200},
                {name: 'Id', width: 200},
                {name: 'Created', width: 200},
                {name: 'VirtualSize', width: 180},
                {name: 'Size', width: 100}
            ],
            rowNum:30,
            pager: elementPager,
            height: 'auto',
            caption: 'Images List',
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
          do_remove = function(){
            that = element;
            if(!that.jqGrid('delRowData', rowId)){
              console.log('del failed');
            }
            var ajaxOption = {
              url: 'http://127.0.0.1:8080/images/'+id,
              type: 'DELETE',
              success: function(data){
                console.log('success');
              },
              error: function(xhr, textStatus, errorThrown){
                  console.log(errorThrown);
              }
            }
            $.ajax(ajaxOption);
          }
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

      })
   })();
})
