import { IPostulacionRepository } from '@domain/repositories/busquedaPostulacion/PostulacionRepositories'
import { IAuditLoggerService } from '@application/ports/IAuditLoggerService'
import { EstadoPostulacion } from '@domain/enums/PostulacionEnums.enum'
import { EntityNotFoundError, BusinessRuleViolationError } from '@domain/errors/DomainError'

export interface CalificarExperienciaInputDto {
  idPostulacion: number
  idCandidato: number
  idUsuario: number
  calificacion: number
  comentario?: string
}

export class CalificarExperienciaPostulacionUseCase {
  constructor(
    private readonly postulacionRepository: IPostulacionRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: CalificarExperienciaInputDto): Promise<void> {
    const postulacion = await this.postulacionRepository.findById(input.idPostulacion)
    if (!postulacion) throw new EntityNotFoundError('Postulacion', input.idPostulacion)

    if (postulacion.idCandidato !== input.idCandidato) {
      throw new BusinessRuleViolationError('postulacion', 'No tienes acceso a esta postulación')
    }

    // RN-39: reglas de calificación encapsuladas en la entidad
    postulacion.calificar(input.calificacion, input.comentario)
    await this.postulacionRepository.update(postulacion)

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'postulacion_calificada',
      modulo: 'postulacion',
      objetoAfectado: 'Postulacion',
      idObjetoAfectado: input.idPostulacion,
      resultado: 'exitoso',
    })
  }
}
