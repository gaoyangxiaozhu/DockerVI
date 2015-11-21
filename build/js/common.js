$(function(){

    // nav show
    function nav_selected(){
        that = $(this);
        // 显示对应的面板
        tabId = that.find('a').data('href');
        $(tabId).addClass('active')
        .siblings().removeClass('active');
    }
    // 点击myTab 显示对应的面板

    $(document).on('click', '#detailsTab li', function(e){
        e.preventDefault();
        that = $(this);
        nav_selected.call(that);
    });
});
