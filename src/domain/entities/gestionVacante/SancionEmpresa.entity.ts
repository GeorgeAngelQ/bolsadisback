export enum EstadoSancion {
  ACTIVA = 'activa',
  LEVANTADA = 'levantada',
}

export interface SancionEmpresaProps {
  id: number
  idEmpresa: number
  idAdministrador: number
  motivo: string
  fechaInicio: Date
  fechaFin?: Date
  estado: EstadoSancion
  normativaInfringida?: string
}

export class SancionEmpresa {
  readonly id: number
  readonly idEmpresa: number
  readonly idAdministrador: number
  private motivo: string
  readonly fechaInicio: Date
  private fechaFin?: Date
  private estado: EstadoSancion
  private normativaInfringida?: string

  constructor(props: SancionEmpresaProps) {
    this.id = props.id
    this.idEmpresa = props.idEmpresa
    this.idAdministrador = props.idAdministrador
    this.motivo = props.motivo
    this.fechaInicio = props.fechaInicio
    this.fechaFin = props.fechaFin
    this.estado = props.estado
    this.normativaInfringida = props.normativaInfringida
  }

  getMotivo(): string { return this.motivo }
  getFechaFin(): Date | undefined { return this.fechaFin }
  getEstado(): EstadoSancion { return this.estado }
  getNormativaInfringida(): string | undefined { return this.normativaInfringida }

  estaActiva(): boolean { return this.estado === EstadoSancion.ACTIVA }

  levantar(): void {
    this.estado = EstadoSancion.LEVANTADA
    this.fechaFin = new Date()
  }
}
