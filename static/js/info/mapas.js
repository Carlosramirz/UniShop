$(document).ready(function(){
    $('.mapas-carousel').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true, // Muestra botones de navegación
        prevArrow: $('.anterior'),
        nextArrow: $('.siguiente')
    });
});