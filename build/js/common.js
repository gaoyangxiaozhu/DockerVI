$(function(){

    // nav show
    function nav_selected(){

        function update_breadcrumb(secondText, thirdText){
            breadcrumb = $('.breadcrumb');
            breadcrumb.find('li:nth-child(2)').text(secondText);
            breadcrumb.find('li:nth-child(3)').text(thirdText);
        }
        sectionId = that.data('id');
        if(!that.hasClass('active')){
            // 更新active

            that.addClass('active')
            .siblings('li').removeClass('active')
            .parents('.submenu').parents('li')
            .addClass('active open')
            .siblings('li').removeClass('active open')
            .find('li').removeClass('active')

            //更新显示模块

            $(sectionId).addClass('show').removeClass('hide')
            .siblings().removeClass('show').addClass('hide')

            //更新breadcrumb
            finalLiText = that.find('a').text()
            secondLiText = that.parents('.submenu').data('info')
            update_breadcrumb(secondLiText, finalLiText);

       }
    }
    var navList = $(".nav.nav-list > li .submenu li");
    navList.on('click', function(){
        that = $(this);
        nav_selected.call(that);
    });
    $('.image-list-item').trigger('click');
});
