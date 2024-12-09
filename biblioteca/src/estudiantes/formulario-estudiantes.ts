import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", async () => {
  const formulario = document.getElementById("formulario-estudiantes") as HTMLFormElement;
  const cancelar = document.getElementById("cancelar") as HTMLButtonElement;
  const tituloFormulario = document.getElementById("titulo-formulario")!;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  let sancionado:boolean;

  // Cargar datos del estudiante si estamos editando
  if (id) {
    tituloFormulario.textContent = "Editar Estudiante";
    try {

       // Convertir la fecha al formato correcto (YYYY-MM-DD) para el campo de tipo 'date'
        function formatearFecha(fecha: string): string {
                return fecha.split("T")[0];
        }
        const respuesta = await fetch(`http://localhost:4000/api/estudiantes/${id}`);
        if (!respuesta.ok) throw new Error("Error al obtener los datos del estudiante");
        const estudiante = await respuesta.json();

        (document.getElementById("cedula") as HTMLInputElement).value = estudiante.cedula;
        (document.getElementById("nombre") as HTMLInputElement).value = estudiante.nombre;
        (document.getElementById("apellido") as HTMLInputElement).value = estudiante.apellido;
        (document.getElementById("sexo") as HTMLSelectElement).value = estudiante.sexo;
        (document.getElementById("fecha_nacimiento") as HTMLInputElement).value = formatearFecha(estudiante.fecha_nacimiento);
        sancionado= estudiante.sancionado;
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los datos del estudiante.",
        icon: "error",
      });
    }
  }

  // Manejar envío del formulario
  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const datos = {
      cedula: (document.getElementById("cedula") as HTMLInputElement).value,
      nombre: (document.getElementById("nombre") as HTMLInputElement).value,
      apellido: (document.getElementById("apellido") as HTMLInputElement).value,
      sexo: (document.getElementById("sexo") as HTMLSelectElement).value,
      fecha_nacimiento: (document.getElementById("fecha_nacimiento") as HTMLInputElement).value,
      sancionado: sancionado,
    };

    const url = id ? `http://localhost:4000/api/estudiantes/${id}` : "http://localhost:4000/api/estudiantes";
    const method = id ? "PUT" : "POST";

    try {
      const respuesta = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (!respuesta.ok) throw new Error("Error en la operación");

      Swal.fire({
        title: "Operación exitosa",
        text: id ? "Estudiante actualizado correctamente." : "Estudiante agregado correctamente.",
        icon: "success",
      }).then(() => {
        location.href = "/src/estudiantes/estudiantes.html";
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo realizar la operación. Inténtalo de nuevo.",
        icon: "error",
      });
    }
  });

  // Botón cancelar
  cancelar.addEventListener("click", () => {
    location.href = "/src/estudiantes/estudiantes.html";
  });
});
