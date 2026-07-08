import { Dni } from '../../value-objects/Dni.vo'

export interface IntermediadorLaboralProps {
  id: number
  idUsuario: number
  nombres: string
  apellidos: string
  dni: Dni
  entidadOrigen?: string
  telefono?: string
}

export class IntermediadorLaboral {
  readonly id: number
  readonly idUsuario: number
  private nombres: string
  private apellidos: string
  private dni: Dni
  private entidadOrigen?: string
  private telefono?: string

  constructor(props: IntermediadorLaboralProps) {
    this.id = props.id
    this.idUsuario = props.idUsuario
    this.nombres = props.nombres
    this.apellidos = props.apellidos
    this.dni = props.dni
    this.entidadOrigen = props.entidadOrigen
    this.telefono = props.telefono
  }

  getNombreCompleto(): string { return `${this.nombres} ${this.apellidos}` }
  getNombres(): string { return this.nombres }
  getApellidos(): string { return this.apellidos }
  getDni(): string { return this.dni.getValue() }
  getEntidadOrigen(): string | undefined { return this.entidadOrigen }
  getTelefono(): string | undefined { return this.telefono }

  actualizarDatos(datos: Partial<Pick<IntermediadorLaboralProps, 'entidadOrigen' | 'telefono'>>): void {
    if (datos.entidadOrigen !== undefined) this.entidadOrigen = datos.entidadOrigen
    if (datos.telefono !== undefined) this.telefono = datos.telefono
  }
}
