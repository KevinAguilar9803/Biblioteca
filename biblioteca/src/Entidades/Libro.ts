export class Libro {
    id: number;
    codigo: string;
    categoria: string;
    editorial: string;
    nombre: string;
    autor: string;
    anioPublicacion: number;
    stock: number;
  
    constructor(
      id: number,
      codigo: string,
      categoria: string,
      editorial: string,
      nombre: string,
      autor: string,
      anioPublicacion: number,
      stock: number
    ) {
      this.id = id;
      this.codigo = codigo;
      this.categoria = categoria;
      this.editorial = editorial;
      this.nombre = nombre;
      this.autor = autor;
      this.anioPublicacion = anioPublicacion;
      this.stock = stock;
    }
  
    estaDisponible(): boolean {
      return this.stock > 0;
    }
  }
  