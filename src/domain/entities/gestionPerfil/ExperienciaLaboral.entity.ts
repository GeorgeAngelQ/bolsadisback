import { BusinessRuleViolationError } from '../../errors/DomainError'

export interface ExperienciaLaboralProps {
  id: number
  idPerfil: number
  cargo: string
  empresa: string
  fechaInicio: Date
  fechaFin?: Date
  trabajoActual: boolean
  descripcion?: string
}

export class ExperienciaLaboral {
  readonly id: number
  readonly idPerfil: number
  private cargo: string
  private empresa: string
  private fechaInicio: Date
  private fechaFin?: Date
  private trabajoActual: boolean
  private descripcion?: string

  constructor(props: ExperienciaLaboralProps) {
    this.validarFechas(props.fechaInicio, props.fechaFin, props.trabajoActual)
    this.id = props.id
    this.idPerfil = props.idPerfil
    this.cargo = props.cargo
    this.empresa = props.empresa
    this.fechaInicio = props.fechaInicio
    this.fechaFin = props.fechaFin
    this.trabajoActual = props.trabajoActual
    this.descripcion = props.descripcion
  }

  private validarFechas(inicio: Date, fin?: Date, actual?: boolean): void {
    if (!actual && fin && fin < inicio) {
      throw new BusinessRuleViolationError(
        'experiencia',
        'La fecha de fin no puede ser anterior a la fecha de inicio',
      )
    }
  }

  getCargo(): string { return this.cargo }
  getEmpresa(): string { return this.empresa }
  getFechaInicio(): Date { return this.fechaInicio }
  getFechaFin(): Date | undefined { return this.fechaFin }
  isTrabajoActual(): boolean { return this.trabajoActual }
  getDescripcion(): string | undefined { return this.descripcion }

  calcularDuracionMeses(): number {
    const fin = this.trabajoActual ? new Date() : (this.fechaFin ?? new Date())
    const meses =
      (fin.getFullYear() - this.fechaInicio.getFullYear()) * 12 +
      (fin.getMonth() - this.fechaInicio.getMonth())
    return Math.max(0, meses)
  }

  actualizar(datos: Partial<Omit<ExperienciaLaboralProps, 'id' | 'idPerfil'>>): void {
    if (datos.cargo) this.cargo = datos.cargo
    if (datos.empresa) this.empresa = datos.empresa
    if (datos.fechaInicio) this.fechaInicio = datos.fechaInicio
    if (datos.fechaFin !== undefined) this.fechaFin = datos.fechaFin
    if (datos.trabajoActual !== undefined) this.trabajoActual = datos.trabajoActual
    if (datos.descripcion !== undefined) this.descripcion = datos.descripcion
    this.validarFechas(this.fechaInicio, this.fechaFin, this.trabajoActual)
  }
}
