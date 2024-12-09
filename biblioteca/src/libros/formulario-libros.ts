import Swal from "sweetalert2";
document.addEventListener("DOMContentLoaded", async () => {
    const formulario = document.getElementById("formulario-libros") as HTMLFormElement;
    const params = new URLSearchParams(window.location.search);
    const cancelar = document.getElementById("cancelar") as HTMLButtonElement;
    const id = params.get("id");
  
    // Cargar datos del libro si estamos editando
    if (id) {
        const respuesta = await fetch(`http://localhost:4000/api/libros/${id}`);
        const libro = await respuesta.json();
        
        (document.getElementById("codigo") as HTMLInputElement).value = libro.codigo;
        (document.getElementById("nombre") as HTMLInputElement).value = libro.nombre;
        (document.getElementById("categoria") as HTMLSelectElement).value = libro.categoria;
        (document.getElementById("tipo") as HTMLSelectElement).value = libro.tipo;
        (document.getElementById("autor") as HTMLInputElement).value = libro.autor;
        (document.getElementById("editorial") as HTMLInputElement).value = libro.editorial;
        (document.getElementById("anio") as HTMLInputElement).value = libro.anio_publicacion;
        (document.getElementById("stock") as HTMLInputElement).value = libro.stock.toString();
    }

    cancelar.addEventListener("click", () => {
      location.href = "/src/libros/libros.html";
    });
  
    // Manejar envío del formulario
    formulario.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const datos = {
        codigo: (document.getElementById("codigo") as HTMLInputElement).value,
        tipo: (document.getElementById("tipo") as HTMLSelectElement).value,
        categoria: (document.getElementById("categoria") as HTMLSelectElement).value,
        nombre: (document.getElementById("nombre") as HTMLInputElement).value,
        autor: (document.getElementById("autor") as HTMLInputElement).value,
        editorial: (document.getElementById("editorial") as HTMLInputElement).value,
        anio_publicacion: parseInt((document.getElementById("anio") as HTMLInputElement).value, 10),
        stock: parseInt((document.getElementById("stock") as HTMLInputElement).value, 10),
      };
      try {
        const url = id ? `http://localhost:4000/api/libros/${id}` : "http://localhost:4000/api/libros";
        const method = id ? "PUT" : "POST";
    
        const respuesta = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos),
        });
        if (!respuesta.ok) throw new Error("Error en la operación");
      Swal.fire({
        title: "Operación exitosa",
        text: id ? "Libro actualizado correctamente." : "Libro agregado correctamente.",
        icon: "success",
      }).then(() => {
        location.href = "/src/libros/libros.html";
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo realizar la operación. Inténtalo de nuevo.",
        icon: "error",
      });
    }
    });
  });
  
  