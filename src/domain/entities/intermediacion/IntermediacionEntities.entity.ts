import {
  EstadoAsignacion,
  TipoObservacion,
  EstadoSeguimiento,
  ResultadoSeguimiento,
  TipoServicioExterno,
  EstadoDerivacion,
  EstadoEntrevista,
  ModalidadEntrevista,
} from '../../enums/IntermediacionEnums.enum'
import { BusinessRuleViolationError, InvalidEntityStateError } from '../../errors/DomainError'

// RN-41: máximo candidatos asignados por intermediador
export const MAX_CANDIDATOS_POR_INTERMEDIADOR = 20

// ---------- AsignacionIntermediador ----------

export interface AsignacionIntermediadorProps {
  id: number
  idIntermediador: number
  idCandidato: number
  fechaAsignacion: Date
  fechaFinalizacion?: Date
  estado: EstadoAsignacion
  motivoFinalizacion?: string
}

export class AsignacionIntermediador {
  readonly id: number
  readonly idIntermediador: number
  readonly idCandidato: number
  readonly fechaAsignacion: Date
  private fechaFinalizacion?: Date
  private estado: EstadoAsignacion
  private motivoFinalizacion?: string

  constructor(props: AsignacionIntermediadorProps) {
    this.id = props.id
    this.idIntermediador = props.idIntermediador
    this.idCandidato = props.idCandidato
    this.fechaAsignacion = props.fechaAsignacion
    this.fechaFinalizacion = props.fechaFinalizacion
    this.estado = props.estado
    this.motivoFinalizacion = props.motivoFinalizacion
  }

  getEstado(): EstadoAsignacion { return this.estado }
  isActiva(): boolean { return this.estado === EstadoAsignacion.ACTIVA }

  finalizar(motivo?: string): void {
    this.estado = EstadoAsignacion.FINALIZADA
    this.fechaFinalizacion = new Date()
    this.motivoFinalizacion = motivo
  }

  reasignar(): void {
    this.estado = EstadoAsignacion.REASIGNADA
    this.fechaFinalizacion = new Date()
  }
}

// ---------- ObservacionCandidato ----------

export interface ObservacionCandidatoProps {
  id: number
  idIntermediador: number
  idCandidato: number
  contenido: string
  fechaRegistro: Date
  tipo: TipoObservacion
  confidencial: boolean
}

export class ObservacionCandidato {
  readonly id: number
  readonly idIntermediador: number
  readonly idCandidato: number
  private contenido: string
  readonly fechaRegistro: Date
  private tipo: TipoObservacion
  private confidencial: boolean

  constructor(props: ObservacionCandidatoProps) {
    if (!props.contenido || props.contenido.trim().length === 0) {
      throw new BusinessRuleViolationError('observacion', 'El contenido no puede estar vacío')
    }
    this.id = props.id
    this.idIntermediador = props.idIntermediador
    this.idCandidato = props.idCandidato
    this.contenido = props.contenido
    this.fechaRegistro = props.fechaRegistro
    this.tipo = props.tipo
    this.confidencial = props.confidencial
  }

  getContenido(): string { return this.contenido }
  getTipo(): TipoObservacion { return this.tipo }
  isConfidencial(): boolean { return this.confidencial }

  editar(nuevoContenido: string): void {
    if (!nuevoContenido || nuevoContenido.trim().length === 0) {
      throw new BusinessRuleViolationError('observacion', 'El contenido no puede estar vacío')
    }
    this.contenido = nuevoContenido
  }
}

// ---------- SeguimientoPostulacion ----------

export interface SeguimientoPostulacionProps {
  id: number
  idIntermediador: number
  idPostulacion: number
  fechaInicio: Date
  fechaUltimaActualizacion?: Date
  estado: EstadoSeguimiento
  notas?: string
  resultado?: ResultadoSeguimiento
}

export class SeguimientoPostulacion {
  readonly id: number
  readonly idIntermediador: number
  readonly idPostulacion: number
  readonly fechaInicio: Date
  private fechaUltimaActualizacion?: Date
  private estado: EstadoSeguimiento
  private notas?: string
  private resultado?: ResultadoSeguimiento

  constructor(props: SeguimientoPostulacionProps) {
    this.id = props.id
    this.idIntermediador = props.idIntermediador
    this.idPostulacion = props.idPostulacion
    this.fechaInicio = props.fechaInicio
    this.fechaUltimaActualizacion = props.fechaUltimaActualizacion
    this.estado = props.estado
    this.notas = props.notas
    this.resultado = props.resultado
  }

  getEstado(): EstadoSeguimiento { return this.estado }
  getNotas(): string | undefined { return this.notas }
  getResultado(): ResultadoSeguimiento | undefined { return this.resultado }
  isActivo(): boolean { return this.estado === EstadoSeguimiento.ACTIVO }

  actualizarNotas(notas: string): void {
    this.notas = notas
    this.fechaUltimaActualizacion = new Date()
  }

  registrarResultado(resultado: ResultadoSeguimiento): void {
    this.resultado = resultado
    this.estado = EstadoSeguimiento.CERRADO
    this.fechaUltimaActualizacion = new Date()
  }
}

// ---------- DerivacionServicio ----------

export interface DerivacionServicioProps {
  id: number
  idSeguimiento: number
  idCandidato: number
  tipoServicio: TipoServicioExterno
  entidadDestino: string
  motivo: string
  fechaDerivacion: Date
  estado: EstadoDerivacion
}

export class DerivacionServicio {
  readonly id: number
  readonly idSeguimiento: number
  readonly idCandidato: number
  private tipoServicio: TipoServicioExterno
  private entidadDestino: string
  private motivo: string
  readonly fechaDerivacion: Date
  private estado: EstadoDerivacion

  constructor(props: DerivacionServicioProps) {
    if (!props.motivo || props.motivo.trim().length === 0) {
      throw new BusinessRuleViolationError('derivacion', 'Debe especificar el motivo de la derivación')
    }
    if (!props.entidadDestino || props.entidadDestino.trim().length === 0) {
      throw new BusinessRuleViolationError('derivacion', 'Debe indicar la entidad destino')
    }
    this.id = props.id
    this.idSeguimiento = props.idSeguimiento
    this.idCandidato = props.idCandidato
    this.tipoServicio = props.tipoServicio
    this.entidadDestino = props.entidadDestino
    this.motivo = props.motivo
    this.fechaDerivacion = props.fechaDerivacion
    this.estado = props.estado
  }

  getTipoServicio(): TipoServicioExterno { return this.tipoServicio }
  getEntidadDestino(): string { return this.entidadDestino }
  getMotivo(): string { return this.motivo }
  getEstado(): EstadoDerivacion { return this.estado }

  actualizarEstado(nuevoEstado: EstadoDerivacion): void {
    if (this.estado === EstadoDerivacion.CONCLUIDA) {
      throw new InvalidEntityStateError('DerivacionServicio', 'actualizar — ya está concluida')
    }
    this.estado = nuevoEstado
  }

  concluir(): void {
    this.estado = EstadoDerivacion.CONCLUIDA
  }
}

// ---------- CoordinacionEntrevista ----------

export interface CoordinacionEntrevistaProps {
  id: number
  idPostulacion: number
  idConversacion?: number
  fechaEntrevista: Date
  modalidad: ModalidadEntrevista
  lugar?: string
  urlReunion?: string
  ajustesNecesarios?: string
  estado: EstadoEntrevista
}

export class CoordinacionEntrevista {
  readonly id: number
  readonly idPostulacion: number
  private idConversacion?: number
  private fechaEntrevista: Date
  private modalidad: ModalidadEntrevista
  private lugar?: string
  private urlReunion?: string
  private ajustesNecesarios?: string
  private estado: EstadoEntrevista

  constructor(props: CoordinacionEntrevistaProps) {
    if (props.fechaEntrevista <= new Date()) {
      throw new BusinessRuleViolationError('entrevista', 'La fecha de entrevista debe ser posterior a hoy')
    }
    this.id = props.id
    this.idPostulacion = props.idPostulacion
    this.idConversacion = props.idConversacion
    this.fechaEntrevista = props.fechaEntrevista
    this.modalidad = props.modalidad
    this.lugar = props.lugar
    this.urlReunion = props.urlReunion
    this.ajustesNecesarios = props.ajustesNecesarios
    this.estado = props.estado
  }

  getFechaEntrevista(): Date { return this.fechaEntrevista }
  getModalidad(): ModalidadEntrevista { return this.modalidad }
  getLugar(): string | undefined { return this.lugar }
  getUrlReunion(): string | undefined { return this.urlReunion }
  getAjustesNecesarios(): string | undefined { return this.ajustesNecesarios }
  getEstado(): EstadoEntrevista { return this.estado }

  reprogramar(nuevaFecha: Date, nuevoLugar?: string, nuevaUrl?: string): void {
    if (nuevaFecha <= new Date()) {
      throw new BusinessRuleViolationError('entrevista', 'La nueva fecha debe ser posterior a hoy')
    }
    this.fechaEntrevista = nuevaFecha
    if (nuevoLugar) this.lugar = nuevoLugar
    if (nuevaUrl) this.urlReunion = nuevaUrl
    this.estado = EstadoEntrevista.REPROGRAMADA
  }

  cancelar(): void { this.estado = EstadoEntrevista.CANCELADA }
  marcarRealizada(): void { this.estado = EstadoEntrevista.REALIZADA }
}
