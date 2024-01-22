const toggle = document.querySelector(".toggle");
const menuDashboard = document.querySelector(".menu-dashboard");
const iconoMenu = toggle.querySelector("i");
const enlacesMenu = document.querySelectorAll(".enlace");
document.body.appendChild(contenedorInfo);

// Función para crear y mostrar la tabla de ejemplo
function mostrarTabla(titulo, datos) {
  // Limpiar el contenido del contenedor antes de agregar nuevo contenido
  contenedorInfo.appendChild(tabla);

  const tabla = document.createElement("table");
  tabla.style.borderCollapse = "collapse"; // Agrega borde entre celdas

  // Crea la fila de encabezado
  const encabezado = document.createElement("tr");
  for (const encabezadoItem of datos[0]) {
    const th = document.createElement("th");
    th.textContent = encabezadoItem;
    th.style.border = "1px solid black"; // Añade borde a las celdas del encabezado
    th.style.padding = "8px";
    encabezado.appendChild(th);
  }
  tabla.appendChild(encabezado);

  // Crea filas de datos
  for (let i = 1; i < datos.length; i++) {
    const fila = document.createElement("tr");
    for (const datoItem of datos[i]) {
      const td = document.createElement("td");
      td.innerHTML = datoItem.replace(/\n/g, "<br>"); // Reemplaza saltos de línea con etiquetas <br>
      td.style.border = "1px solid black"; // Añade borde a las celdas de datos
      td.style.padding = "8px";
      fila.appendChild(td);
    }
    tabla.appendChild(fila);
  }

  tabla.style.position = "absolute";
  tabla.style.top = "50%";
  tabla.style.left = "50%";
  tabla.style.transform = "translate(-50%, -50%)";
  tabla.style.color = "black"; // Añade el color negro al texto

  // Agregar la tabla al contenedor
  contenedorInfo.appendChild(tabla);
}

// Función para crear y mostrar botones
function mostrarBotones(botones) {
  // Limpiar el contenido del contenedor antes de agregar nuevo contenido
  contenedorInfo.innerHTML = "";

  // Crear y agregar los botones al contenedor
  botones.forEach((boton) => {
    const btn = document.createElement("button");
    btn.textContent = boton.texto;
    btn.addEventListener("click", boton.onClick);
    contenedorInfo.appendChild(btn);
  });
}

toggle.addEventListener("click", () => {
  menuDashboard.classList.toggle("open");

  if (menuDashboard.classList.contains("open")) {
    iconoMenu.classList.replace("bx-menu", "bx-x");
  } else {
    iconoMenu.classList.replace("bx-x", "bx-menu");
  }
});

enlacesMenu.forEach((enlace) => {
    enlace.addEventListener("click", () => {
        const tipoEnlace = enlace.querySelector("i").classList[1];

        // Limpiar el contenido existente
        const contenedorInfo = document.getElementById("contenedorInfo");
        contenedorInfo.innerHTML = "";

        // Determinar qué contenido cargar basado en el tipo de enlace
        if (tipoEnlace === "bx-user") { // Reemplazar con el ícono/clase correcta
            cargarYMostrarUsuarios();
        } else if (tipoEnlace === "bxs-shopping-bag") {
            mostrarFormularioProducto();
            cargarYMostrarProductos();
        }
    });
});

function cargarYMostrarUsuarios() {

  const contenedorUsuarios = document.getElementById("contenedorUsuarios"); // Asegúrate de tener este contenedor en tu HTML
  contenedorUsuarios.innerHTML = ""; // Limpia el contenedor

  fetch("/api/users/")
    .then((response) => response.json())
    .then((data) => {
      const tabla = document.createElement("table");
      tabla.className = 'table-users';
      // Añadir cabeceras a la tabla
      const cabecera = tabla.insertRow();
      ["ID", "Username", "Email", "Fecha de Registro"].forEach((texto) => {
        const celda = cabecera.insertCell();
        celda.textContent = texto;
      });

      // Añadir filas a la tabla para cada usuario
      data.forEach((usuario) => {
        const fila = tabla.insertRow();
        fila.insertCell().textContent = usuario.id;
        fila.insertCell().textContent = usuario.username;
        fila.insertCell().textContent = usuario.email;
        fila.insertCell().textContent = new Date(
          usuario.date_joined
        ).toLocaleDateString();
        // Agrega más celdas si es necesario
      });

      contenedorUsuarios.appendChild(tabla);
    })
    .catch((error) => console.error("Error:", error));
}

function mostrarFormularioProducto() {
  const contenedorInfo = document.getElementById("contenedorInfo");
  contenedorInfo.innerHTML = ""; // Limpia el contenido actual

  // Crear formulario
  const form = document.createElement("form");
  form.setAttribute("method", "post");
  form.setAttribute("enctype", "multipart/form-data");
  form.setAttribute("action", "/products/add/");

  // Crear campos del formulario
  const campos = [
    { etiqueta: "Nombre", tipo: "text", nombre: "name" },
    { etiqueta: "Precio", tipo: "number", nombre: "price" },
    { etiqueta: "Imagen", tipo: "file", nombre: "image" },
  ];
  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");
  const csrfHiddenInput = document.createElement("input");
  csrfHiddenInput.setAttribute("type", "hidden");
  csrfHiddenInput.setAttribute("name", "csrfmiddlewaretoken");
  csrfHiddenInput.setAttribute("value", csrfToken);
  form.appendChild(csrfHiddenInput);

  campos.forEach((campo) => {
    const label = document.createElement("label");
    label.textContent = campo.etiqueta;
    const input = document.createElement("input");
    input.setAttribute("type", campo.tipo);
    input.setAttribute("name", campo.nombre);
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(document.createElement("br"));
  });

  // Crear botón de envío
  const submitButton = document.createElement("button");
  submitButton.setAttribute("type", "submit");
  submitButton.textContent = "Agregar Producto";
  form.appendChild(submitButton);

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Previene el envío tradicional del formulario

    var formData = new FormData(form);
    fetch(form.getAttribute("action"), {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          alert("Producto agregado con éxito.");
          window.location.reload(); // Recarga la página
        } else {
          alert("Error al agregar producto.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Se produjo un error.");
      });
  });

  // Agregar el formulario al contenedor
  contenedorInfo.appendChild(form);
}

function cargarYMostrarProductos() {
  const contenedorTabla = document.getElementById("contenedorTabla");
  contenedorTabla.innerHTML = ""; // Limpia el contenedor de la tabla

  // Realizar la solicitud a la API y procesar los datos
  fetch("/api/product/")
    .then((response) => response.json())
    .then((data) => {
      const tabla = document.createElement("table");
      // Añadir cabeceras a la tabla
      const cabecera = tabla.insertRow();
      ["Nombre", "Precio", "Imagen", "Acciones"].forEach((texto) => {
        const celda = cabecera.insertCell();
        celda.textContent = texto;
      });

      // Añadir filas a la tabla para cada producto
      data.forEach((producto) => {
        const fila = tabla.insertRow();
        fila.insertCell().textContent = producto.name;
        fila.insertCell().textContent = producto.price;

        const imgCell = fila.insertCell();
        const img = document.createElement("img");
        img.src = "/media/" + producto.image;
        img.style.width = "50px";
        imgCell.appendChild(img);

        // Añadir botones de editar y eliminar
        const accionesCell = fila.insertCell();
        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.onclick = function () {
          editarProducto(producto.id);
        };
        accionesCell.appendChild(btnEditar);

        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.onclick = function () {
          eliminarProducto(producto.id);
        };
        accionesCell.appendChild(btnEliminar);
      });

      contenedorTabla.appendChild(tabla);
    })
    .catch((error) => console.error("Error:", error));
}

function eliminarProducto(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
    fetch("/api/product/delete/" + id + "/", {
      method: "DELETE",
      headers: {
        "X-CSRFToken": csrftoken,
      },
    })
      .then((response) => {
        if (response.ok) {
          alert("Producto eliminado con éxito.");
          cargarYMostrarProductos(); // Recargar la tabla para reflejar la eliminación
        } else {
          alert("Error al eliminar el producto.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Se produjo un error al intentar eliminar el producto.");
      });
  }
}

function editarProducto(id) {
  // Obtener los datos del producto que quieres editar
  fetch("/api/product/" + id + "/")
    .then((response) => response.json())
    .then((data) => {
      // Aquí puedes rellenar un formulario de edición con los datos del producto
      // Por ejemplo, estableciendo los valores de los campos del formulario
      document.getElementById("edit-name").value = data.name;
      document.getElementById("edit-price").value = data.price;
      // Más campos según sea necesario

      // Muestra el formulario de edición (puede ser un modal o un formulario en la página)
      document.getElementById("edit-form-container").style.display = "block";

      // Asigna un evento al botón de guardar del formulario de edición
      document.getElementById("edit-form").onsubmit = function (event) {
        event.preventDefault(); // Evita el envío tradicional del formulario
        // Envía los datos actualizados al servidor
        var formData = new FormData(this);
        fetch("/api/product/edit/" + id + "/", {
          method: "POST",
          body: formData,
          headers: {
            "X-CSRFToken": csrftoken,
          },
        })
          .then((response) => {
            if (response.ok) {
              alert("Producto editado con éxito.");
              cargarYMostrarProductos(); // Recargar la tabla
            } else {
              alert("Error al editar el producto.");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("Se produjo un error al intentar editar el producto.");
          });
      };
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error al cargar los datos del producto.");
    });
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const csrftoken = getCookie("csrftoken");
