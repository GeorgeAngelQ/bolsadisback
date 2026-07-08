import { EstadoVacante, ModalidadTrabajo } from '../../enums/VacanteEnums.enum'
import { BusinessRuleViolationError, InvalidEntityStateError } from '../../errors/DomainError'

// RN-27: máximo de vacantes activas por empresa (primera fase)
export const MAX_VACANTES_ACTIVAS_POR_EMPRESA = 10

// RN-28: días sin contratación antes de notificar
export const DIAS_SIN_CONTRATACION_ALERTA = 60

export interface VacanteProps {
  id: number
  idEmpresa: number
  idAdministrador?: number
  titulo: string
  descripcion: string
  requisitos?: string
  categoriaLaboral?: string
  sectorEconomico?: string
  modalidad: ModalidadTrabajo
  remuneracion?: number
  ubicacion?: string
  fechaPublicacion?: Date
  fechaCierre?: Date
  estado: EstadoVacante
  motivoRechazo?: string
}

export class Vacante {
  readonly id: number
  readonly idEmpresa: number
  private idAdministrador?: number
  private titulo: string
  private descripcion: string
  private requisitos?: string
  private categoriaLaboral?: string
  private sectorEconomico?: string
  private modalidad: ModalidadTrabajo
  private remuneracion?: number
  private ubicacion?: string
  private fechaPublicacion?: Date
  private fechaCierre?: Date
  private estado: EstadoVacante
  private motivoRechazo?: string

  constructor(props: VacanteProps) {
    this.validarFechaCierre(props.fechaCierre)
    this.id = props.id
    this.idEmpresa = props.idEmpresa
    this.idAdministrador = props.idAdministrador
    this.titulo = props.titulo
    this.descripcion = props.descripcion
    this.requisitos = props.requisitos
    this.categoriaLaboral = props.categoriaLaboral
    this.sectorEconomico = props.sectorEconomico
    this.modalidad = props.modalidad
    this.remuneracion = props.remuneracion
    this.ubicacion = props.ubicacion
    this.fechaPublicacion = props.fechaPublicacion
    this.fechaCierre = props.fechaCierre
    this.estado = props.estado
    this.motivoRechazo = props.motivoRechazo
  }

  private validarFechaCierre(fechaCierre?: Date): void {
    if (fechaCierre && fechaCierre <= new Date()) {
      throw new BusinessRuleViolationError(
        'vacante',
        'La fecha de cierre debe ser posterior a la fecha actual',
      )
    }
  }

  getId(): number { return this.id }
  getIdEmpresa(): number { return this.idEmpresa }
  getIdAdministrador(): number | undefined { return this.idAdministrador }
  getTitulo(): string { return this.titulo }
  getDescripcion(): string { return this.descripcion }
  getRequisitos(): string | undefined { return this.requisitos }
  getCategoriaLaboral(): string | undefined { return this.categoriaLaboral }
  getSectorEconomico(): string | undefined { return this.sectorEconomico }
  getModalidad(): ModalidadTrabajo { return this.modalidad }
  getRemuneracion(): number | undefined { return this.remuneracion }
  getUbicacion(): string | undefined { return this.ubicacion }
  getFechaPublicacion(): Date | undefined { return this.fechaPublicacion }
  getFechaCierre(): Date | undefined { return this.fechaCierre }
  getEstado(): EstadoVacante { return this.estado }
  getMotivoRechazo(): string | undefined { return this.motivoRechazo }

  estaActiva(): boolean {
    return this.estado === EstadoVacante.APROBADA
  }

  estaEditable(): boolean {
    return this.estado !== EstadoVacante.CERRADA && this.estado !== EstadoVacante.APROBADA
  }

  puedeRecibirPostulaciones(): boolean {
    return this.estado === EstadoVacante.APROBADA &&
      (!this.fechaCierre || new Date() <= this.fechaCierre)
  }

  publicar(): void {
    this.estado = EstadoVacante.PENDIENTE
    this.fechaPublicacion = new Date()
    this.motivoRechazo = undefined
  }

  aprobar(idAdministrador: number): void {
    if (this.estado !== EstadoVacante.PENDIENTE) {
      throw new InvalidEntityStateError('Vacante', 'aprobar — solo se aprueban vacantes pendientes')
    }
    this.estado = EstadoVacante.APROBADA
    this.idAdministrador = idAdministrador
    this.motivoRechazo = undefined
  }

  rechazar(idAdministrador: number, motivo: string): void {
    if (this.estado !== EstadoVacante.PENDIENTE) {
      throw new InvalidEntityStateError('Vacante', 'rechazar — solo se rechazan vacantes pendientes')
    }
    if (!motivo || motivo.trim().length === 0) {
      throw new BusinessRuleViolationError('RN-25', 'Debe ingresar el motivo del rechazo')
    }
    this.estado = EstadoVacante.RECHAZADA
    this.idAdministrador = idAdministrador
    this.motivoRechazo = motivo
  }

  cerrar(): void {
    if (this.estado === EstadoVacante.CERRADA) {
      throw new InvalidEntityStateError('Vacante', 'cerrar — la vacante ya está cerrada')
    }
    this.estado = EstadoVacante.CERRADA
  }

  editar(datos: Partial<Omit<VacanteProps, 'id' | 'idEmpresa'>>): void {
    if (!this.estaEditable()) {
      throw new InvalidEntityStateError('Vacante', 'editar')
    }
    if (datos.titulo) this.titulo = datos.titulo
    if (datos.descripcion) this.descripcion = datos.descripcion
    if (datos.requisitos !== undefined) this.requisitos = datos.requisitos
    if (datos.categoriaLaboral !== undefined) this.categoriaLaboral = datos.categoriaLaboral
    if (datos.sectorEconomico !== undefined) this.sectorEconomico = datos.sectorEconomico
    if (datos.modalidad) this.modalidad = datos.modalidad
    if (datos.remuneracion !== undefined) this.remuneracion = datos.remuneracion
    if (datos.ubicacion !== undefined) this.ubicacion = datos.ubicacion
    if (datos.fechaCierre !== undefined) {
      this.validarFechaCierre(datos.fechaCierre)
      this.fechaCierre = datos.fechaCierre
    }
    // Vuelve a pendiente para nueva aprobación
    this.estado = EstadoVacante.PENDIENTE
    this.motivoRechazo = undefined
  }

  superaDiasVigenciaAlerta(): boolean {
    if (!this.fechaPublicacion || this.estado !== EstadoVacante.APROBADA) return false
    const diasTranscurridos = Math.floor(
      (new Date().getTime() - this.fechaPublicacion.getTime()) / (1000 * 60 * 60 * 24),
    )
    return diasTranscurridos >= DIAS_SIN_CONTRATACION_ALERTA
  }
}
