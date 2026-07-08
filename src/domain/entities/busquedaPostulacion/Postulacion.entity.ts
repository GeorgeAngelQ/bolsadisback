import { EstadoPostulacion } from '../../enums/PostulacionEnums.enum'
import { BusinessRuleViolationError, InvalidEntityStateError } from '../../errors/DomainError'

export interface PostulacionProps {
  id: number
  idCandidato: number
  idVacante: number
  fechaPostulacion: Date
  estado: EstadoPostulacion
  cartaPresentacion?: string
  calificacion?: number
  comentarioCalificacion?: string
  fechaCalificacion?: Date
}

export class Postulacion {
  readonly id: number
  readonly idCandidato: number
  readonly idVacante: number
  readonly fechaPostulacion: Date
  private estado: EstadoPostulacion
  private cartaPresentacion?: string
  private calificacion?: number
  private comentarioCalificacion?: string
  private fechaCalificacion?: Date

  // RN-39: calificación entre 1 y 5
  private static readonly MIN_CALIFICACION = 1
  private static readonly MAX_CALIFICACION = 5

  constructor(props: PostulacionProps) {
    this.id = props.id
    this.idCandidato = props.idCandidato
    this.idVacante = props.idVacante
    this.fechaPostulacion = props.fechaPostulacion
    this.estado = props.estado
    this.cartaPresentacion = props.cartaPresentacion
    this.calificacion = props.calificacion
    this.comentarioCalificacion = props.comentarioCalificacion
    this.fechaCalificacion = props.fechaCalificacion
  }

  getEstado(): EstadoPostulacion { return this.estado }
  getCartaPresentacion(): string | undefined { return this.cartaPresentacion }
  getCalificacion(): number | undefined { return this.calificacion }
  getComentarioCalificacion(): string | undefined { return this.comentarioCalificacion }
  getFechaCalificacion(): Date | undefined { return this.fechaCalificacion }

  estaActiva(): boolean {
    return ![EstadoPostulacion.RETIRADA, EstadoPostulacion.RECHAZADA, EstadoPostulacion.ACEPTADA]
      .includes(this.estado)
  }

  estaConcluida(): boolean {
    return [EstadoPostulacion.ACEPTADA, EstadoPostulacion.RECHAZADA, EstadoPostulacion.RETIRADA]
      .includes(this.estado)
  }

  puedeSolicitarRetiro(): boolean {
    return [EstadoPostulacion.ENVIADA, EstadoPostulacion.EN_REVISION].includes(this.estado)
  }

  actualizarEstado(nuevoEstado: EstadoPostulacion): void {
    this.estado = nuevoEstado
  }

  retirar(): void {
    // RN-38: no se puede retirar si ya está en proceso
    if (!this.puedeSolicitarRetiro()) {
      throw new InvalidEntityStateError(
        'Postulacion',
        'No puedes retirar una postulación que ya está en proceso',
      )
    }
    this.estado = EstadoPostulacion.RETIRADA
  }

  calificar(calificacion: number, comentario?: string): void {
    // RN-39: solo se califica si está concluida
    if (!this.estaConcluida()) {
      throw new InvalidEntityStateError('Postulacion', 'Solo puedes calificar procesos concluidos')
    }

    if (this.calificacion !== undefined) {
      throw new BusinessRuleViolationError(
        'RN-39',
        'Ya calificaste esta experiencia de postulación',
      )
    }

    if (calificacion < Postulacion.MIN_CALIFICACION || calificacion > Postulacion.MAX_CALIFICACION) {
      throw new BusinessRuleViolationError(
        'calificacion',
        `La calificación debe estar entre ${Postulacion.MIN_CALIFICACION} y ${Postulacion.MAX_CALIFICACION}`,
      )
    }

    this.calificacion = calificacion
    this.comentarioCalificacion = comentario
    this.fechaCalificacion = new Date()
  }
}
