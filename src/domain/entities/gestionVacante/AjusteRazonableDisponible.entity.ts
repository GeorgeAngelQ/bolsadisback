import { TipoAjusteRazonable } from '../../enums/PerfilEnums.enum'

export interface AjusteRazonableDisponibleProps {
  id: number
  idVacante: number
  descripcion: string
  tipo: TipoAjusteRazonable
  verificadoPorIntermediador: boolean
}

export class AjusteRazonableDisponible {
  readonly id: number
  readonly idVacante: number
  private descripcion: string
  private tipo: TipoAjusteRazonable
  private verificadoPorIntermediador: boolean

  constructor(props: AjusteRazonableDisponibleProps) {
    this.id = props.id
    this.idVacante = props.idVacante
    this.descripcion = props.descripcion
    this.tipo = props.tipo
    this.verificadoPorIntermediador = props.verificadoPorIntermediador
  }

  getDescripcion(): string { return this.descripcion }
  getTipo(): TipoAjusteRazonable { return this.tipo }
  isVerificado(): boolean { return this.verificadoPorIntermediador }

  marcarVerificado(): void { this.verificadoPorIntermediador = true }

  actualizar(datos: Partial<Pick<AjusteRazonableDisponibleProps, 'descripcion' | 'tipo'>>): void {
    if (datos.descripcion) this.descripcion = datos.descripcion
    if (datos.tipo) this.tipo = datos.tipo
    this.verificadoPorIntermediador = false
  }
}
