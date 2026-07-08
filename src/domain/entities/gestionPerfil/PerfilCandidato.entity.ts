import { NivelEducativo } from '../../enums/PerfilEnums.enum'
import { BusinessRuleViolationError } from '../../errors/DomainError'

// RN-11: campos mínimos para perfil completo
const PORCENTAJE_MINIMO_COMPLETO = 100

export interface PerfilCandidatoProps {
  id: number
  idCandidato: number
  resumenProfesional?: string
  nivelEducativo?: NivelEducativo
  visible: boolean
  porcentajeCompletitud: number
  fechaActualizacion?: Date
}

export class PerfilCandidato {
  readonly id: number
  readonly idCandidato: number
  private resumenProfesional?: string
  private nivelEducativo?: NivelEducativo
  private visible: boolean
  private porcentajeCompletitud: number
  private fechaActualizacion?: Date

  constructor(props: PerfilCandidatoProps) {
    this.id = props.id
    this.idCandidato = props.idCandidato
    this.resumenProfesional = props.resumenProfesional
    this.nivelEducativo = props.nivelEducativo
    this.visible = props.visible
    this.porcentajeCompletitud = props.porcentajeCompletitud
    this.fechaActualizacion = props.fechaActualizacion
  }

  getResumenProfesional(): string | undefined { return this.resumenProfesional }
  getNivelEducativo(): NivelEducativo | undefined { return this.nivelEducativo }
  isVisible(): boolean { return this.visible }
  getPorcentajeCompletitud(): number { return this.porcentajeCompletitud }
  getFechaActualizacion(): Date | undefined { return this.fechaActualizacion }

  estaCompleto(): boolean {
    return this.porcentajeCompletitud >= PORCENTAJE_MINIMO_COMPLETO
  }

  activarVisibilidad(): void { this.visible = true }
  desactivarVisibilidad(): void { this.visible = false }

  actualizarPorcentaje(porcentaje: number): void {
    if (porcentaje < 0 || porcentaje > 100) {
      throw new BusinessRuleViolationError('completitud', 'El porcentaje debe estar entre 0 y 100')
    }
    this.porcentajeCompletitud = porcentaje
    this.fechaActualizacion = new Date()
  }

  actualizarDatos(datos: Partial<Pick<PerfilCandidatoProps, 'resumenProfesional' | 'nivelEducativo'>>): void {
    if (datos.resumenProfesional !== undefined) this.resumenProfesional = datos.resumenProfesional
    if (datos.nivelEducativo !== undefined) this.nivelEducativo = datos.nivelEducativo
    this.fechaActualizacion = new Date()
  }
}
