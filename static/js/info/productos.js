let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCart = document.querySelector('.icon-cart');
let iconCartSpan = document.querySelector('.icon-cart span');
let body = document.querySelector('body');
let closeCart = document.querySelector('.close');
let checkoutButton = document.querySelector('.checkOut'); // Selecciona el botón "Menu de pago"
let products = [];
let cart = [];

iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});

closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});

checkoutButton.addEventListener('click', () => {
    // Redirige a la página de pago cuando se hace clic en el botón "Menu de pago"
    window.location.href = '/pago/'; // Reemplaza '/ruta-de-tu-pagina-de-pago' con la ruta correcta
});

const addDataToHTML = () => {
    listProductHTML.innerHTML = ''; // Limpia el contenedor de productos antes de añadir nuevos

    if (products.length > 0) {
        products.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.dataset.id = product.id;
            newProduct.classList.add('item');

            // Formatear el precio con tres dígitos decimales
            const formattedPrice = parseFloat(product.price).toFixed(3).toString();

            newProduct.innerHTML = `
                <img src="/media/${product.image}" alt="${product.name}">
                <h2>${product.name}</h2>
                <div class="price">$${formattedPrice}</div>
                <button class="addCart">Agregar al carrito</button>
            `;
            listProductHTML.appendChild(newProduct);
        });
    }
};


listProductHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('addCart')) {
        let id_product = positionClick.parentElement.dataset.id;
        addToCart(id_product);
    }
});

const addToCart = (product_id) => {
    let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);
    if (cart.length <= 0) {
        cart = [{
            product_id: product_id,
            quantity: 1
        }];
    } else if (positionThisProductInCart < 0) {
        cart.push({
            product_id: product_id,
            quantity: 1
        });
    } else {
        cart[positionThisProductInCart].quantity++;
    }
    addCartToHTML();
    addCartToMemory();
};

const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
};

const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    if (cart.length > 0) {
        cart.forEach(item => {
            totalQuantity += item.quantity;
            let newItem = document.createElement('div');
            newItem.classList.add('item');
            newItem.dataset.id = item.product_id;

            let positionProduct = products.findIndex((value) => value.id == item.product_id);
            let info = products[positionProduct];
            console.log(info); // Esto mostrará el objeto `info` en la consola
            listCartHTML.appendChild(newItem);
            newItem.innerHTML = `
            <div class="image">
                <img src="/media/${info.image}" alt="${info.name}">
            </div>
            <div class="name">
                ${info.name}
            </div>
            <div class="totalPrice">$${(info.price * item.quantity).toFixed(3)}</div>
            <div class="quantity">
                <span class="minus">&lt;</span>
                <span>${item.quantity}</span>
                <span class="plus">&gt;</span>
            </div>
        `;
        
        });
    }
    iconCartSpan.innerText = totalQuantity;
};

listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('minus') || positionClick.classList.contains('plus')) {
        let product_id = positionClick.parentElement.parentElement.dataset.id;
        let type = 'minus';
        if (positionClick.classList.contains('plus')) {
            type = 'plus';
        }
        changeQuantityCart(product_id, type);
    }
});

const changeQuantityCart = (product_id, type) => {
    let positionItemInCart = cart.findIndex((value) => value.product_id == product_id);
    if (positionItemInCart >= 0) {
        let info = cart[positionItemInCart];
        switch (type) {
            case 'plus':
                cart[positionItemInCart].quantity++;
                break;
            default:
                let changeQuantity = cart[positionItemInCart].quantity - 1;
                if (changeQuantity > 0) {
                    cart[positionItemInCart].quantity = changeQuantity;
                } else {
                    cart.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    addCartToHTML();
    addCartToMemory();
};

const initApp = () => {
    fetch('/api/product/')  
    .then(response => response.json())
    .then(data => {
        console.log(data);
        products = []; // Limpia la lista existente antes de añadir nuevos productos
        products = data;
        addDataToHTML();

        // Obtener datos del carrito desde el almacenamiento local
        if (localStorage.getItem('cart')) {
            cart = JSON.parse(localStorage.getItem('cart'));
            addCartToHTML();
        }
    });
};

initApp();

