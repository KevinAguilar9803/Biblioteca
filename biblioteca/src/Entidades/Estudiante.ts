export class Estudiante {
    id: number;
    cedula: string;
    nombre: string;
    apellido: string;
    sexo: string;
    fechaNacimiento: Date;
    sancionado: boolean;
  
    constructor(
      id: number,
      cedula: string,
      nombre: string,
      apellido: string,
      sexo: string,
      fechaNacimiento: string,
      sancionado: boolean
    ) {
      this.id = id;
      this.cedula = cedula;
      this.nombre = nombre;
      this.apellido = apellido;
      this.sexo = sexo;
      this.fechaNacimiento = new Date(fechaNacimiento);
      this.sancionado = sancionado;
    }
  
    getNombreCompleto(): string {
      return `${this.nombre} ${this.apellido}`;
    }
  }
  