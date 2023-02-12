async function pedirInfo() {
  fetch("./productos.json")
    .then((response) => response.json())
    .then((json) => miPrograma(json));
}

pedirInfo();

function miPrograma(productos) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) ?? [];

  let seAgregaronListeners = false;

  let contenedorProductos = document.getElementById("contenedor-productos");
  let contenedorCarrito = document.getElementById(
    "contenedor-carrito-de-compra"
  );
  let mensajeCarrito = document.getElementById("mensaje-carrito");
  let buscador = document.getElementById("buscador");
  let buscar = document.getElementById("buscar");
  buscar.onclick = filtrar;

  let verCarrito = document.getElementById("ver-carrito");
  verCarrito.addEventListener("click", mostrarOcultarCarrito);

  function mostrarOcultarCarrito() {
    contenedorProductos.classList.toggle("ocultar");
    contenedorCarrito.classList.toggle("ocultar");
  }

  renderizarProductos(productos);
  renderizarCarrito(carrito);

  function decrementarUnidad(id) {
    if (carrito.length === 0) return;

    id = id.replace("dec", "");

    let posProductoBuscado = carrito.findIndex((producto) => producto.id == id);

    if (carrito[posProductoBuscado].unidades > 1) {
      carrito[posProductoBuscado].unidades--;
      carrito[posProductoBuscado].subtotal =
        carrito[posProductoBuscado].precio *
        carrito[posProductoBuscado].unidades;
    } else {
      carrito.splice(posProductoBuscado, 1);
    }
    renderizarCarrito(carrito);
  }

  function incrementarUnidad(id) {
    if (carrito.length === 0) return;
    id = parseInt(id.replace("inc", ""));

    let posProductoBuscado = carrito.findIndex((producto) => producto.id == id);
    let productoOriginal = productos.find((producto) => producto.id == id);

    if (carrito[posProductoBuscado].unidades < productoOriginal.stock) {
      carrito[posProductoBuscado].unidades++;
      carrito[posProductoBuscado].subtotal =
        carrito[posProductoBuscado].precio *
        carrito[posProductoBuscado].unidades;
    }

    renderizarCarrito(carrito);
  }

  function eliminarProductoDelCarrito(id) {
    id = parseInt(id.replace("eliminar", ""));
    let posProdAEliminar = carrito.findIndex((prod) => prod.id == id);
    carrito.splice(posProdAEliminar, 1);

    renderizarCarrito(carrito);
  }

  function finalizarCompra() {
    localStorage.removeItem("carrito");
    carrito = [];

    mensajeCarrito.innerText = `Total: $0`;

    renderizarCarrito(carrito);

    mostrarMensajeAlerta(
      "Compra realizada",
      "Gracias por su compra",
      "success",
      4000,
      "Gracias"
    );
  }

  function filtrar(e) {
    e.preventDefault();
    let productosFiltrados;
    if (buscador.value) {
      productosFiltrados = productos.filter(
        (producto) =>
          producto.nombre
            .toLowerCase()
            .includes(buscador.value.toLowerCase()) ||
          producto.categoria
            .toLowerCase()
            .includes(buscador.value.toLowerCase())
      );
    }
    renderizarProductos(productosFiltrados);
  }

  function renderizarProductos(arrayDeProductos) {
    contenedorProductos.innerHTML = "";
    arrayDeProductos.forEach((producto) => {
      let tarjetaProducto = document.createElement("div");
      tarjetaProducto.classList.add("producto");
      tarjetaProducto.id = `tarjeta${producto.id}`;

      tarjetaProducto.innerHTML = `
      <div class='producto-imagen'>
        <img src=${producto.imgUrl} />
      </div>
      <div class='contenedor-producto-info'>
        <div class='producto-info'>
          <span class='mt-2'>${producto.nombre}</span>
          <span>$${producto.precio}</span>
        </div>
        <div class='producto-boton-agregar'>
          <button id=agregar${producto.id}>Agregar</button>
        <div>
      </div>
    `;

      contenedorProductos.append(tarjetaProducto);

      let boton = document.getElementById("agregar" + producto.id);
      boton.onclick = agregarAlCarrito;
    });
  }

  function agregarAlCarrito(e) {
    let id = e.target.id.slice(7);
    let productoBuscado = productos.find((producto) => producto.id == id);
    let productoEnCarrito = carrito.find(
      (producto) => producto.id == productoBuscado.id
    );

    mostrarMensajeAlerta(
      "Producto agregado",
      "Se agregó el producto " + productoBuscado.nombre,
      "success",
      3000,
      "false",
      productoBuscado.imgUrl,
      "90px",
      "90px"
    );

    if (productoEnCarrito) {
      let posicionProducto = carrito.findIndex(
        (producto) => producto == productoEnCarrito
      );
      carrito[posicionProducto].unidades++;
      carrito[posicionProducto].subtotal =
        carrito[posicionProducto].precio * carrito[posicionProducto].unidades;
    } else {
      productoBuscado.unidades = 1;
      productoBuscado.subtotal = productoBuscado.precio;
      carrito.push(productoBuscado);
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito(carrito);
  }

  function renderizarCarrito(productosEnCarrito) {
    let contenidoCarritoDeCompra = document.getElementById(
      "contenido-carrito-de-compra"
    );

    if (productosEnCarrito.length === 0) {
      mensajeCarrito.innerHTML = "Tu carrito esta vacio!";
      contenidoCarritoDeCompra.innerHTML = "";
      return;
    }

    let contenidoTablaCarrito = "";

    productosEnCarrito.forEach((producto) => {
      contenidoTablaCarrito += `
        <tr>
          <td>${producto.nombre}<td>
          <td>
            <button id="dec${producto.id}" class='decrementar-producto-del-carrito inc-dec-input'>-</button>
              ${producto.unidades}
            <button id="inc${producto.id}" class='incrementar-producto-del-carrito inc-dec-input'>+</button>                          
          <td>
          <td>${producto.subtotal}<td>
          <td>
            <button class='eliminar-producto-del-carrito' id=eliminar${producto.id}>Eliminar</button>
          <td>                              
        <tr/>
      `;
    });

    contenidoCarritoDeCompra.innerHTML = contenidoTablaCarrito;

    if (!seAgregaronListeners) {
      console.log("Agregando listener ", seAgregaronListeners);

      contenidoCarritoDeCompra.addEventListener("click", function (evento) {
        if (evento.target.classList.contains("eliminar-producto-del-carrito")) {
          eliminarProductoDelCarrito(evento.target.id);
        }

        if (
          evento.target.classList.contains("incrementar-producto-del-carrito")
        ) {
          incrementarUnidad(evento.target.id);
        }

        if (
          evento.target.classList.contains("decrementar-producto-del-carrito")
        ) {
          decrementarUnidad(evento.target.id);
        }
      });
    }

    seAgregaronListeners = true;

    mensajeCarrito.innerText = `Total: $${calcularTotalDelCarrito()}`;
    mensajeCarrito.innerHTML += `<button id="comprar-carrito">Comprar</button>`;

    let comprar = document.getElementById("comprar-carrito");
    comprar.addEventListener("click", finalizarCompra);

    localStorage.setItem("carrito", JSON.stringify(carrito));
  }

  function calcularTotalDelCarrito() {
    let total = 0;

    carrito.forEach((c) => {
      total += c.subtotal;
    });

    return total;
  }

  let checkBoxs = document.getElementsByClassName("inputFiltro");
  for (const checkBox of checkBoxs) {
    checkBox.onclick = filtrarPorCategoria;
  }

  let ropa = document.getElementById("arneses");
  ropa.onclick = filtrarPorCategoria;

  let deporte = document.getElementById("cadenas");
  deporte.onclick = filtrarPorCategoria;

  function filtrarPorCategoria() {
    let filtros = [];
    for (const checkBox of checkBoxs) {
      if (checkBox.checked) {
        filtros.push(checkBox.id);
      }
    }
    let productosFiltrados = productos.filter((producto) =>
      filtros.includes(producto.categoria)
    );
    renderizarProductos(productosFiltrados);
    if (filtros.length == 0) {
      renderizarProductos(productos);
    }
  }

  function mostrarMensajeAlerta(
    title,
    text,
    icon,
    timer,
    showConfirmButton,
    imageUrl,
    imageWidth,
    imageHeight
  ) {
    Swal.fire({
      title,
      text,
      icon,
      timer,
      showConfirmButton,
      imageUrl,
      imageWidth,
      imageHeight,
    });
  }
}
