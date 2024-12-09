// prestamos.ts
import Swal from 'sweetalert2';

// Tabla de préstamos (aseguramos que no sea null)
const tablaPrestamos = document.querySelector<HTMLTableSectionElement>('#tabla-prestamos tbody') as HTMLTableSectionElement;
const botonAgregarAlquiler = document.getElementById("boton-agregar-alquiler") as HTMLButtonElement;
const filtroGeneral = document.getElementById("filtro-general") as HTMLInputElement;
const filtroEstado = document.getElementById("filtro-estado") as HTMLSelectElement;
const botonRestablecer = document.getElementById("boton-restablecer")!;
if (!tablaPrestamos) {
  throw new Error('No se encontró el elemento de la tabla de préstamos.');
}

// Asegurarnos de que esté disponible globalmente
(window as any).marcarComoDevuelto = marcarComoDevuelto;

// Tipos de datos
interface Libro {
    nombre: string;
    cantidad: number;
  }
  
interface Prestamo {
    id: number;
    cedula_estudiante: string;
    nombre_estudiante: string;
    apellido_estudiante: string;
    libros: Libro[];
    fecha_prestamo: string;
    fecha_entrega: string;
    devuelto: boolean;
    fecha_devolucion: string;
  }

  let prestamosOriginales: Prestamo[] = [];

  // Cargar préstamos
  async function cargarPrestamos(): Promise<void> {
    try {
      const response = await fetch('http://localhost:4000/api/prestamos');
      prestamosOriginales = await response.json();
      renderizarPrestamos(prestamosOriginales);
    } catch (error) {
      console.error('Error al cargar préstamos:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los préstamos.',
        icon: 'error',
      });
    }
  }
  
  // Renderizar préstamos
  function renderizarPrestamos(prestamos: Prestamo[]): void {
    tablaPrestamos.innerHTML = prestamos
      .map((prestamo) => {
        const listaLibros = prestamo.libros
          .map((libro, index) => `${index + 1}. ${libro.nombre} Cantidad: ${libro.cantidad}`)
          .join('<hr>');
  
        return `
          <tr>
            <td>${prestamo.id}</td>
            <td>${prestamo.cedula_estudiante}</td>
            <td>${prestamo.nombre_estudiante} ${prestamo.apellido_estudiante}</td>
            <td>${listaLibros}</td>
            <td>${new Date(prestamo.fecha_prestamo).toLocaleDateString()}</td>
            <td>${new Date(prestamo.fecha_entrega).toLocaleDateString()}</td>
            <td>${prestamo.devuelto ? 'Devuelto' : 'Alquilado'}</td>
            <td>
              ${prestamo.fecha_devolucion 
                ? new Date(prestamo.fecha_devolucion).toLocaleDateString()
                : `<button onclick="marcarComoDevuelto(${prestamo.id})">Marcar Devuelto</button>`
              }
            </td>
          </tr>
        `;
      })
      .join('');
  }
  
  // Filtrar préstamos
  function filtrarPrestamos(): void {
    const termino = filtroGeneral.value.trim().toLowerCase();
    const estadoSeleccionado = filtroEstado.value;
  
    const prestamosFiltrados = prestamosOriginales.filter((prestamo) => {
      const coincideCedula = prestamo.cedula_estudiante.toLowerCase().includes(termino);
      const coincideFecha = new Date(prestamo.fecha_prestamo).toLocaleDateString().includes(termino);
      const coincideEstado =
        estadoSeleccionado === ''
          || (estadoSeleccionado === 'true' && prestamo.devuelto)
          || (estadoSeleccionado === 'false' && !prestamo.devuelto);
  
      return (coincideCedula || coincideFecha) && coincideEstado;
    });
  
    renderizarPrestamos(prestamosFiltrados);
  }
  
  // Restablecer filtros
  botonRestablecer.addEventListener("click", () => {
    filtroGeneral.value = '';
    filtroEstado.value = '';
    renderizarPrestamos(prestamosOriginales);
  });
  
  // Escuchar eventos para los filtros
  filtroGeneral.addEventListener("input", filtrarPrestamos);
  filtroEstado.addEventListener("change", filtrarPrestamos);
  
  // Inicializar la carga de datos
  cargarPrestamos();
  
  botonAgregarAlquiler.addEventListener("click", () => {
    window.location.href = "/src/prestamos/formulario-prestamos.html";
  });

// Marcar como devuelto
export async function marcarComoDevuelto(idPrestamo: number): Promise<void> {
    const fechaDevolucion = new Date().toISOString().split('T')[0];
  try {
    const response = await fetch(`http://localhost:4000/api/prestamos/${idPrestamo}/devolver`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify({
        fecha_devolucion: fechaDevolucion,
      }),
    });
    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        title: 'Éxito',
        text: data.mensaje,
        icon: 'success',
      });
      cargarPrestamos(); // Recargar la lista
    } else {
        Swal.fire({
        title: 'Error',
        text: data.error,
        icon: 'error',
        });
      const error = await response.json();
      throw new Error(error.message || 'Error al marcar como devuelto.');
    }
  } catch (error) {
    console.error('Error al marcar como devuelto:', error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo marcar como devuelto.',
      icon: 'error',
    });
  }
}