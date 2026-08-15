import { IPostulacionRepository } from '@domain/repositories/busquedaPostulacion/PostulacionRepositories'
import { INotificationService } from '@application/ports/INotificationService'
import { IAuditLoggerService } from '@application/ports/IAuditLoggerService'
import { EstadoPostulacion } from '@domain/enums/PostulacionEnums.enum'
import { EntityNotFoundError, BusinessRuleViolationError } from '@domain/errors/DomainError'

// ---------- Listar postulaciones candidato ----------

export interface PostulacionResumenOutputDto {
  idPostulacion: number
  idVacante: number
  estado: EstadoPostulacion
  fechaPostulacion: Date
  tieneEntrevistaProgramada: boolean
  tieneSeguimiento: boolean
  yaCalificada: boolean
}

export class ListarPostulacionesCandidatoUseCase {
  constructor(
    private readonly postulacionRepository: IPostulacionRepository,
  ) {}

  async execute(idCandidato: number): Promise<PostulacionResumenOutputDto[]> {
    const postulaciones = await this.postulacionRepository.findByIdCandidato(idCandidato)

    return postulaciones.map(p => ({
      idPostulacion: p.id,
      idVacante: p.idVacante,
      estado: p.getEstado(),
      fechaPostulacion: p.fechaPostulacion,
      tieneEntrevistaProgramada: false,   
      tieneSeguimiento: false,
      yaCalificada: p.getCalificacion() !== undefined,
    }))
  }
}

// ---------- Obtener detalle postulación ----------

export interface DetallePostulacionOutputDto {
  idPostulacion: number
  idVacante: number
  idCandidato: number
  estado: EstadoPostulacion
  fechaPostulacion: Date
  cartaPresentacion?: string
  calificacion?: number
  comentarioCalificacion?: string
  fechaCalificacion?: Date
  puedeRetirar: boolean
  puedeCalificar: boolean
}

export class ObtenerDetallePostulacionUseCase {
  constructor(
    private readonly postulacionRepository: IPostulacionRepository,
  ) {}

  async execute(idPostulacion: number, idCandidato: number): Promise<DetallePostulacionOutputDto> {
    const postulacion = await this.postulacionRepository.findById(idPostulacion)
    if (!postulacion) throw new EntityNotFoundError('Postulacion', idPostulacion)

    if (postulacion.idCandidato !== idCandidato) {
      throw new BusinessRuleViolationError('postulacion', 'No tienes acceso a esta postulación')
    }

    return {
      idPostulacion: postulacion.id,
      idVacante: postulacion.idVacante,
      idCandidato: postulacion.idCandidato,
      estado: postulacion.getEstado(),
      fechaPostulacion: postulacion.fechaPostulacion,
      cartaPresentacion: postulacion.getCartaPresentacion(),
      calificacion: postulacion.getCalificacion(),
      comentarioCalificacion: postulacion.getComentarioCalificacion(),
      fechaCalificacion: postulacion.getFechaCalificacion(),
      puedeRetirar: postulacion.puedeSolicitarRetiro(),
      puedeCalificar: postulacion.estaConcluida() && postulacion.getCalificacion() === undefined,
    }
  }
}

// ---------- Retirar postulación ----------

export class RetirarPostulacionUseCase {
  constructor(
    private readonly postulacionRepository: IPostulacionRepository,
    private readonly notificationService: INotificationService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(idPostulacion: number, idCandidato: number, idUsuario: number): Promise<void> {
    const postulacion = await this.postulacionRepository.findById(idPostulacion)
    if (!postulacion) throw new EntityNotFoundError('Postulacion', idPostulacion)

    if (postulacion.idCandidato !== idCandidato) {
      throw new BusinessRuleViolationError('postulacion', 'No tienes acceso a esta postulación')
    }

    // RN-38: validado en la entidad
    postulacion.retirar()
    await this.postulacionRepository.update(postulacion)

    // Notificar empresa
    await this.notificationService.notificar(
      0,   // idUsuarioEmpresa 
      'Candidato retiró su postulación',
      'Un candidato ha retirado su postulación de tu proceso de selección.',
    )

    await this.auditLogger.log({
      idUsuario,
      accion: 'postulacion_retirada',
      modulo: 'postulacion',
      objetoAfectado: 'Postulacion',
      idObjetoAfectado: idPostulacion,
      resultado: 'exitoso',
    })
  }
}
