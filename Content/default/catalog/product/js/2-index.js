$(document).ready(function () {
    // SLIDER NEWS
    $('#news-related').owlCarousel({
        loop: true,
        margin: 10,
        lazyLoad: true,
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
        responsiveClass: true,
        responsive: {
            0: {
                items: 1,
                nav: true
            },
            320: {
                items: 2,
                nav: true
            },
            768: {
                items: 2,
                nav: false
            },
            1000: {
                items: 4,
                nav: true,
                loop: false
            }
        }
    });
    $('.sp-wrap').smoothproducts();
});