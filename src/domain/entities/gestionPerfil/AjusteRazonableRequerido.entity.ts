import { TipoAjusteRazonable, PrioridadAjuste } from '../../enums/PerfilEnums.enum'

export interface AjusteRazonableRequeridoProps {
  id: number
  idPerfil: number
  descripcion: string
  tipo: TipoAjusteRazonable
  prioridad: PrioridadAjuste
}

export class AjusteRazonableRequerido {
  readonly id: number
  readonly idPerfil: number
  private descripcion: string
  private tipo: TipoAjusteRazonable
  private prioridad: PrioridadAjuste

  constructor(props: AjusteRazonableRequeridoProps) {
    this.id = props.id
    this.idPerfil = props.idPerfil
    this.descripcion = props.descripcion
    this.tipo = props.tipo
    this.prioridad = props.prioridad
  }

  getDescripcion(): string { return this.descripcion }
  getTipo(): TipoAjusteRazonable { return this.tipo }
  getPrioridad(): PrioridadAjuste { return this.prioridad }
  isEsencial(): boolean { return this.prioridad === PrioridadAjuste.ESENCIAL }

  actualizar(datos: Partial<Omit<AjusteRazonableRequeridoProps, 'id' | 'idPerfil'>>): void {
    if (datos.descripcion) this.descripcion = datos.descripcion
    if (datos.tipo) this.tipo = datos.tipo
    if (datos.prioridad) this.prioridad = datos.prioridad
  }
}
