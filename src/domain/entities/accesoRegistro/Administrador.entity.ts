export type NivelAdministrador = 'superadmin' | 'admin'

export interface AdministradorProps {
  id: number
  idUsuario: number
  nombres: string
  apellidos: string
  nivel: NivelAdministrador
}

export class Administrador {
  readonly id: number
  readonly idUsuario: number
  private nombres: string
  private apellidos: string
  private nivel: NivelAdministrador

  constructor(props: AdministradorProps) {
    this.id = props.id
    this.idUsuario = props.idUsuario
    this.nombres = props.nombres
    this.apellidos = props.apellidos
    this.nivel = props.nivel
  }

  getNombreCompleto(): string { return `${this.nombres} ${this.apellidos}` }
  getNombres(): string { return this.nombres }
  getApellidos(): string { return this.apellidos }
  getNivel(): NivelAdministrador { return this.nivel }
  esSuperAdmin(): boolean { return this.nivel === 'superadmin' }
}
