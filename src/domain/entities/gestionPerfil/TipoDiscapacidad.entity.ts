import { CategoriaDiscapacidad } from '../../enums/PerfilEnums.enum'

export interface TipoDiscapacidadProps {
  id: number
  nombre: string
  categoria: CategoriaDiscapacidad
  descripcion?: string
  codigoConadis?: string
}

export class TipoDiscapacidad {
  readonly id: number
  readonly nombre: string
  readonly categoria: CategoriaDiscapacidad
  readonly descripcion?: string
  readonly codigoConadis?: string

  constructor(props: TipoDiscapacidadProps) {
    this.id = props.id
    this.nombre = props.nombre
    this.categoria = props.categoria
    this.descripcion = props.descripcion
    this.codigoConadis = props.codigoConadis
  }
}
