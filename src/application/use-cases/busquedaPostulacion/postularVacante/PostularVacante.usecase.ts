import { IPostulacionRepository } from '@domain/repositories/busquedaPostulacion/PostulacionRepositories'
import { IVacanteRepository } from '@domain/repositories/gestionVacante/VacanteRepositories'
import { IPerfilCandidatoRepository } from '@domain/repositories/gestionPerfil/IPerfilCandidatoRepository'
import { INotificationService } from '@application/ports/INotificationService'
import { IAuditLoggerService } from '@application/ports/IAuditLoggerService'
import { Postulacion } from '@domain/entities/busquedaPostulacion/Postulacion.entity'
import { EstadoPostulacion } from '@domain/enums/PostulacionEnums.enum'
import {
  BusinessRuleViolationError,
  EntityNotFoundError,
  DuplicateEntityError,
} from '@domain/errors/DomainError'

export interface PostularVacanteInputDto {
  idCandidato: number
  idVacante: number
  idUsuario: number
  cartaPresentacion?: string
  idIntermediador?: number
  idUsuarioIntermediador?: number
}

export interface PostularVacanteOutputDto {
  idPostulacion: number
  estado: EstadoPostulacion
  fechaPostulacion: Date
  mensaje: string
}

export class PostularVacanteUseCase {
  constructor(
    private readonly postulacionRepository: IPostulacionRepository,
    private readonly vacanteRepository: IVacanteRepository,
    private readonly perfilRepository: IPerfilCandidatoRepository,
    private readonly notificationService: INotificationService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: PostularVacanteInputDto): Promise<PostularVacanteOutputDto> {
    // RN-32: perfil completo obligatorio
    const perfil = await this.perfilRepository.findByIdCandidato(input.idCandidato)
    if (!perfil) throw new EntityNotFoundError('PerfilCandidato', input.idCandidato)

    if (!perfil.estaCompleto()) {
      throw new BusinessRuleViolationError(
        'RN-32',
        'Completa tu perfil antes de postular a una vacante',
      )
    }

    // RN-33: no duplicar postulaciones
    const yaPostulo = await this.postulacionRepository.existsByIdCandidatoAndIdVacante(
      input.idCandidato,
      input.idVacante,
    )
    if (yaPostulo) throw new DuplicateEntityError('Postulacion', 'candidato-vacante')

    // Validar vacante disponible
    const vacante = await this.vacanteRepository.findById(input.idVacante)
    if (!vacante) throw new EntityNotFoundError('Vacante', input.idVacante)

    if (!vacante.puedeRecibirPostulaciones()) {
      throw new BusinessRuleViolationError('vacante', 'Esta vacante ya no está disponible')
    }

    // RN-31: compatibilidad de discapacidad
    const esCompatible = await this.vacanteRepository.verificarCompatibilidadDiscapacidad(
      input.idCandidato,
      input.idVacante,
    )
    if (!esCompatible) {
      throw new BusinessRuleViolationError(
        'RN-31',
        'Esta vacante no es compatible con tu tipo de discapacidad registrado',
      )
    }

    // Crear postulación
    const postulacion = await this.postulacionRepository.save(
      new Postulacion({
        id: 0,
        idCandidato: input.idCandidato,
        idVacante: input.idVacante,
        fechaPostulacion: new Date(),
        estado: EstadoPostulacion.ENVIADA,
        cartaPresentacion: input.cartaPresentacion,
      }),
    )

    // Notificar empresa
    await this.notificationService.notificar(
      0,   // idUsuarioEmpresa — obtenido de infraestructura en producción
      'Nueva postulación recibida',
      `Tienes una nueva postulación para tu vacante "${vacante.getTitulo()}"`,
    )

    // Notificar intermediador si existe
    if (input.idUsuarioIntermediador) {
      await this.notificationService.notificar(
        input.idUsuarioIntermediador,
        'Tu candidato realizó una postulación',
        `El candidato postulé a "${vacante.getTitulo()}"`,
      )
    }

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'postulacion_enviada',
      modulo: 'postulacion',
      objetoAfectado: 'Postulacion',
      idObjetoAfectado: postulacion.id,
      resultado: 'exitoso',
    })

    return {
      idPostulacion: postulacion.id,
      estado: postulacion.getEstado(),
      fechaPostulacion: postulacion.fechaPostulacion,
      mensaje: 'Postulación enviada exitosamente. Puedes seguir su estado en Mi panel.',
    }
  }
}
