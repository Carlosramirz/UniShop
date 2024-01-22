var menuBtn = document.getElementById("menuBtn");
var sideNav = document.getElementById("sideNav");
var menu = document.getElementById("menu");

sideNav.style.right = "-250px";

menuBtn.onclick = function () {
    // Utiliza parseInt para convertir el valor en píxeles a un número entero
    var rightValue = parseInt(sideNav.style.right);

    if (rightValue === -250) {
        sideNav.style.right = "0";
        menu.src = "/img/info/close.png"; // Cambiado a close.png para cerrar el menú
    } else {
        sideNav.style.right = "-250px";
        menu.src = "/img/info/menu.png";
    }
};

/* SCROLL PAGINA */
var scroll = new SmoothScroll('a[href*="#"]', {
    speed: 1000,
    speedAsDuration: true
});
