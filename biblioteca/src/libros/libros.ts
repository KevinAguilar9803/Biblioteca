import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", async () => {
  const tablaLibros = document.getElementById("tabla-libros")!.querySelector("tbody")!;
  const botonAgregar = document.getElementById("boton-agregar")!;
  const filtroGeneral = document.getElementById("filtro-general") as HTMLInputElement;
  const filtroCategoria = document.getElementById("filtro-categoria") as HTMLSelectElement;
  const filtroTipo = document.getElementById("filtro-tipo") as HTMLSelectElement;
  const filtroStock = document.getElementById("filtro-stock") as HTMLSelectElement;
  const botonRestablecer = document.getElementById("boton-restablecer")!;

  let librosOriginales: any[] = [];

  // Función para cargar libros
  const cargarLibros = async () => {
    try {
      const respuesta = await fetch("http://localhost:4000/api/libros");
      librosOriginales = await respuesta.json();
      renderizarLibros(librosOriginales);
    } catch (error) {
      console.error("Error al cargar libros:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los libros.",
        icon: "error",
      });
    }
  };

  // Renderizar libros en la tabla
  const renderizarLibros = (libros: any[]) => {
    tablaLibros.innerHTML = libros
      .map(
        (libro) => `
        <tr>
          <td>${libro.codigo}</td>
          <td>${libro.nombre}</td>
          <td>${libro.autor}</td>
          <td>${libro.editorial}</td>
          <td>${libro.categoria}</td>
          <td>${libro.anio_publicacion}</td>
          <td>${libro.tipo}</td>
          <td>${libro.stock > 0 ? libro.stock : "Agotado"}</td>
          <td>
            <button class="editar" data-id="${libro.id}">Editar</button>
            <button class="eliminar" data-id="${libro.id}">Eliminar</button>
          </td>
        </tr>
      `
      )
      .join("");
  };

  // Filtrar libros
  const filtrarLibros = () => {
    const termino = filtroGeneral.value.trim().toLowerCase();
    const categoriaSeleccionada = filtroCategoria.value;
    const tipoSeleccionado = filtroTipo.value;
    const stockSeleccionado = filtroStock.value;

    const librosFiltrados = librosOriginales.filter((libro) => {
      const coincideGeneral =
        libro.codigo.toLowerCase().includes(termino) ||
        libro.nombre.toLowerCase().includes(termino) ||
        libro.autor.toLowerCase().includes(termino) ||
        libro.editorial.toLowerCase().includes(termino);

      const coincideCategoria = categoriaSeleccionada === "" || libro.categoria === categoriaSeleccionada;
      const coincideTipo = tipoSeleccionado === "" || libro.tipo === tipoSeleccionado;

      const coincideStock =
        stockSeleccionado === "" ||
        (stockSeleccionado === "true" && libro.stock > 0) ||
        (stockSeleccionado === "false" && libro.stock <= 0);

      return coincideGeneral && coincideCategoria && coincideTipo && coincideStock;
    });

    renderizarLibros(librosFiltrados);
  };

  // Restablecer filtros
  botonRestablecer.addEventListener("click", () => {
    filtroGeneral.value = "";
    filtroCategoria.value = "";
    filtroTipo.value = "";
    filtroStock.value = "";
    renderizarLibros(librosOriginales);
  });

  // Eventos para aplicar los filtros
  filtroGeneral.addEventListener("input", filtrarLibros);
  filtroCategoria.addEventListener("change", filtrarLibros);
  filtroTipo.addEventListener("change", filtrarLibros);
  filtroStock.addEventListener("change", filtrarLibros);

  // Navegar al formulario para agregar un libro
  botonAgregar.addEventListener("click", () => {
    location.href = "/src/libros/formulario-libros.html";
  });

  // Manejar clics en la tabla para editar o eliminar
  tablaLibros.addEventListener("click", async (event) => {
    const target = event.target as HTMLElement;

    // Editar libro
    if (target.classList.contains("editar")) {
      const id = target.dataset.id!;
      location.href = `/src/libros/formulario-libros.html?id=${id}`;
    }

    // Eliminar libro
    if (target.classList.contains("eliminar")) {
      const id = target.dataset.id!;
      if (confirm("¿Estás seguro de que deseas eliminar este libro?")) {
        try {
          const respuesta = await fetch(`http://localhost:4000/api/libros/delete/${id}`, { method: "PUT" });
          if (!respuesta.ok) throw new Error();
          Swal.fire({
            title: "Eliminación exitosa",
            text: "El libro ha sido eliminado correctamente.",
            icon: "success",
          });
          cargarLibros();
        } catch {
          Swal.fire({
            title: "Error",
            text: "No se pudo eliminar el libro. Inténtalo de nuevo.",
            icon: "error",
          });
        }
      }
    }
  });

  // Cargar libros al iniciar
  cargarLibros();
});
