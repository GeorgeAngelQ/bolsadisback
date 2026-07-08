import { NivelHabilidad, TipoHabilidad } from '../../enums/PerfilEnums.enum'

export interface HabilidadProps {
  id: number
  idPerfil: number
  nombre: string
  nivel: NivelHabilidad
  tipo: TipoHabilidad
}

export class Habilidad {
  readonly id: number
  readonly idPerfil: number
  private nombre: string
  private nivel: NivelHabilidad
  private tipo: TipoHabilidad

  constructor(props: HabilidadProps) {
    this.id = props.id
    this.idPerfil = props.idPerfil
    this.nombre = props.nombre
    this.nivel = props.nivel
    this.tipo = props.tipo
  }

  getNombre(): string { return this.nombre }
  getNivel(): NivelHabilidad { return this.nivel }
  getTipo(): TipoHabilidad { return this.tipo }

  actualizar(datos: Partial<Pick<HabilidadProps, 'nombre' | 'nivel' | 'tipo'>>): void {
    if (datos.nombre) this.nombre = datos.nombre
    if (datos.nivel) this.nivel = datos.nivel
    if (datos.tipo) this.tipo = datos.tipo
  }
}
