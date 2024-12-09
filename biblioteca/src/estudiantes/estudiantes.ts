import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", async () => {
  const tablaEstudiantes = document.getElementById("tabla-estudiantes")!.querySelector("tbody")!;
  const botonAgregar = document.getElementById("boton-agregar")!;
  const filtroGeneral = document.getElementById("filtro-general") as HTMLInputElement;
  const filtroSancionado = document.getElementById("filtro-sancionado") as HTMLSelectElement;
  const filtroSexo = document.getElementById("filtro-sexo") as HTMLSelectElement;
  const botonRestablecer = document.getElementById("boton-restablecer")!;

  let estudiantesOriginales: any[] = [];

  function formatearFecha(fecha: string): string {
    return fecha.split("T")[0];
  }

  // Función para cargar estudiantes en la tabla
  const cargarEstudiantes = async () => {
    try {
      const respuesta = await fetch("http://localhost:4000/api/estudiantes");
      estudiantesOriginales = await respuesta.json();
      renderizarEstudiantes(estudiantesOriginales);
    } catch (error) {
      console.error("Error al cargar estudiantes:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los estudiantes.",
        icon: "error",
      });
    }
  };

  // Renderizar estudiantes en la tabla
  const renderizarEstudiantes = (estudiantes: any[]) => {
    tablaEstudiantes.innerHTML = estudiantes
      .map(
        (estudiante) => `
        <tr>
          <td>${estudiante.cedula}</td>
          <td>${estudiante.nombre}</td>
          <td>${estudiante.apellido}</td>
          <td>${estudiante.sexo === "M" ? "Masculino" : "Femenino"}</td>
          <td>${formatearFecha(estudiante.fecha_nacimiento)}</td>
          <td>${estudiante.sancionado ? "Sí" : "No"}</td>
          <td>
            <button class="editar" data-id="${estudiante.id}">Editar</button>
            <button class="eliminar" data-id="${estudiante.id}">Eliminar</button>
          </td>
        </tr>
      `
      )
      .join("");
  };

  // Filtrar estudiantes
  const filtrarEstudiantes = () => {
    const termino = filtroGeneral.value.trim().toLowerCase();
    const estadoSancionado = filtroSancionado.value;
    const sexoSeleccionado = filtroSexo.value;

    const estudiantesFiltrados = estudiantesOriginales.filter((estudiante) => {
      const coincideCedula = estudiante.cedula.toLowerCase().includes(termino);
      const coincideApellido = estudiante.apellido.toLowerCase().includes(termino);
      const coincideSancionado =
        estadoSancionado === "" ||
        (estadoSancionado === "true" && estudiante.sancionado) ||
        (estadoSancionado === "false" && !estudiante.sancionado);
      const coincideSexo = sexoSeleccionado === "" || estudiante.sexo === sexoSeleccionado;

      return (coincideCedula || coincideApellido) && coincideSancionado && coincideSexo;
    });

    renderizarEstudiantes(estudiantesFiltrados);
  };

  // Restablecer filtros
  botonRestablecer.addEventListener("click", () => {
    filtroGeneral.value = "";
    filtroSancionado.value = "";
    filtroSexo.value = "";
    renderizarEstudiantes(estudiantesOriginales);
  });

  // Eventos para aplicar los filtros
  filtroGeneral.addEventListener("input", filtrarEstudiantes);
  filtroSancionado.addEventListener("change", filtrarEstudiantes);
  filtroSexo.addEventListener("change", filtrarEstudiantes);

  // Navegar al formulario para agregar un estudiante
  botonAgregar.addEventListener("click", () => {
    location.href = "/src/estudiantes/formulario-estudiantes.html";
  });


  // Manejar clics en la tabla para editar o eliminar
  tablaEstudiantes.addEventListener("click", async (event) => {
    const target = event.target as HTMLElement;

    // Editar estudiante
    if (target.classList.contains("editar")) {
      const id = target.dataset.id!;
      location.href = `/src/estudiantes/formulario-estudiantes.html?id=${id}`;
    }

    // Eliminar estudiante
    if (target.classList.contains("eliminar")) {
      const id = target.dataset.id!;
      if (confirm("¿Estás seguro de que deseas eliminar este estudiante?")) {
        try {
          const respuesta = await fetch(`http://localhost:4000/api/estudiantes/delete/${id}`, { method: "PUT" });
          if (!respuesta.ok) throw new Error();
          Swal.fire({
            title: "Eliminación exitosa",
            text: "El estudiante ha sido eliminado correctamente.",
            icon: "success",
          });
          cargarEstudiantes();
        } catch {
          Swal.fire({
            title: "Error",
            text: "No se pudo eliminar el estudiante. Inténtalo de nuevo.",
            icon: "error",
          });
        }
      }
    }
  });

  cargarEstudiantes();
});
