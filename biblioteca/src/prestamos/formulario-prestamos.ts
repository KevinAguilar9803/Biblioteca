import Swal from "sweetalert2";
const form = document.getElementById("form-agregar-prestamo") as HTMLFormElement;
const estudianteSelect = document.getElementById("estudiante") as HTMLSelectElement;
const libroSelect = document.getElementById("libro") as HTMLSelectElement;
const cantidadInput = document.getElementById("cantidad") as HTMLInputElement;
const btnAgregarLibro = document.getElementById("btn-agregar-libro") as HTMLButtonElement;
const tablaLibrosBody = document.querySelector("#tabla-libros tbody") as HTMLTableSectionElement;
const fechaEntregaInput = document.getElementById("fecha-entrega") as HTMLInputElement;
const cancelar = document.getElementById("cancelar") as HTMLButtonElement;

// Lista de libros seleccionados
let listaLibros: { libro_id: string; titulo: string; cantidad: number }[] = [];
let listaLibrosaux: { libro_id: string, cantidad: number }[] = [];

// Cargar estudiantes en el select
async function cargarEstudiantes() {
  try {
    const response = await fetch("http://localhost:4000/api/estudiantes");
    const estudiantes = await response.json();

    estudiantes.forEach((estudiante: any) => {
      const option = document.createElement("option");
      option.value = estudiante.id;
      option.textContent = `${estudiante.cedula} - ${estudiante.nombre} ${estudiante.apellido}`;
      estudianteSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar estudiantes:", error);
  }
}

cancelar.addEventListener("click", () => {
    location.href = "./index.html";
  });

// Cargar libros en el select
async function cargarLibros() {
  try {
    const response = await fetch("http://localhost:4000/api/libros");
    const libros = await response.json();

    libros.forEach((libro: any) => {
      const option = document.createElement("option");
      option.value = libro.id;
      option.textContent = `${libro.nombre} (${libro.stock} disponibles)`;
      libroSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar libros:", error);
  }
}

// Actualizar la tabla de libros
function actualizarTablaLibros() {
  tablaLibrosBody.innerHTML = "";

  listaLibros.forEach((libro, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${libro.titulo}</td>
      <td>${libro.cantidad}</td>
      <td><button type="button" class="btn-eliminar" data-index="${index}">Eliminar</button></td>
    `;
    tablaLibrosBody.appendChild(row);
  });

  // Manejar eventos de eliminar libro
  const botonesEliminar = document.querySelectorAll(".btn-eliminar");
  botonesEliminar.forEach((boton) =>
    boton.addEventListener("click", (event) => {
      const index = parseInt((event.target as HTMLElement).dataset.index!);
      listaLibros.splice(index, 1);
      actualizarTablaLibros();
    })
  );
}

// Agregar libro a la lista
btnAgregarLibro.addEventListener("click", () => {
  const idLibro = libroSelect.value;
  const tituloLibro = libroSelect.options[libroSelect.selectedIndex].text;
  const cantidad = parseInt(cantidadInput.value.trim());

  if (!idLibro || isNaN(cantidad) || cantidad <= 0) {
    Swal.fire({
      title: "Datos inválidos",
      text: "Por favor, seleccione un libro y una cantidad válida.",
      icon: "error",
    });
    return;
  }

  listaLibros.push({ libro_id: idLibro, titulo: tituloLibro, cantidad });
  listaLibrosaux.push({ libro_id: idLibro, cantidad})
  actualizarTablaLibros();

  // Limpiar inputs
  libroSelect.value = "";
  cantidadInput.value = "";
});

// Manejar el envío del formulario
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const idEstudiante = estudianteSelect.value;
  const fechaEntrega = fechaEntregaInput.value;

  if (!idEstudiante) {
    Swal.fire({
      title: "Estudiante no seleccionado",
      text: "Por favor, seleccione un estudiante.",
      icon: "error",
    });
    return;
  }

  if (listaLibros.length === 0) {
    Swal.fire({
      title: "Lista de libros vacía",
      text: "Por favor, agregue al menos un libro.",
      icon: "error",
    });
    return;
  }

  if (!fechaEntrega) {
    Swal.fire({
      title: "Fecha no válida",
      text: "Por favor, ingrese una fecha de entrega.",
      icon: "error",
    });
    return;
  }
  try {
    const response = await fetch("http://localhost:4000/api/prestamos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estudiante_id: idEstudiante,
        libros: listaLibrosaux,
        fecha_entrega: fechaEntrega,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      Swal.fire({
        title: "Préstamo registrado",
        text: data.mensaje,
        icon: "success",
      });
      window.location.href = "./prestamos.html";
    } else {
      Swal.fire({
        title: "Error al registrar el préstamo",
        text: data.error,
        icon: "error",
      });
    }
  } catch (error) {
    console.error("Error al registrar préstamo:", error);
  }
});

// Cargar estudiantes y libros al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarEstudiantes();
  cargarLibros();
});
