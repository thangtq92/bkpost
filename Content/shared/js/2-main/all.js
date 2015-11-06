
$(function () {
    //Display fixed Menu when scroll up and down
    var curwinscoll = $(window).scrollTop();
    $(window).scroll(function () {
        var winscoll = curwinscoll - $(window).scrollTop();
        curwinscoll = $(window).scrollTop();
        //console.log('currentwinscroll: ' + curwinscoll);
        //console.log('scrollTop: ' + $(window).scrollTop());
        //console.log('winscoll: ' + winscoll);
        var widthBrowser = $(window).width();
        //console.log('widthBrowser: ' + widthBrowser);
        // if scroll > 150 or widthbrowser > 768, menu-wrapper add class f-menu-wrapper
        if (curwinscoll > 150 & widthBrowser > 768) {
            if ($('.menu-wrapper').hasClass('f-menu-wrapper')) {
                $('.menu-wrapper').remove('f-menu-wrapper');
            }
            $('.menu-wrapper').addClass('f-menu-wrapper');
            if (winscoll <= 0) {
                $('.menu-wrapper').css("top", "-50px");
            } else if (winscoll > 0) {
                $('.menu-wrapper').css("top", "0px");
            }
        } else {
            $('.menu-wrapper').removeClass('f-menu-wrapper');
        }
    });
});