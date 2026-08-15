import {
  IAsignacionIntermediadorRepository,
  IObservacionCandidatoRepository,
  ISeguimientoPostulacionRepository,
  IDerivacionServicioRepository,
  ICoordinacionEntrevistaRepository,
} from '@domain/repositories/intermediacion/IntermediacionRepositories'
import { IPostulacionRepository } from '@domain/repositories/busquedaPostulacion/PostulacionRepositories'
import { INotificationService } from '@application/ports/INotificationService'
import { IAuditLoggerService } from '@application/ports/IAuditLoggerService'
import {
  AsignacionIntermediador,
  ObservacionCandidato,
  SeguimientoPostulacion,
  DerivacionServicio,
  CoordinacionEntrevista,
  MAX_CANDIDATOS_POR_INTERMEDIADOR,
} from '@domain/entities/intermediacion/IntermediacionEntities.entity'
import {
  EstadoAsignacion,
  TipoObservacion,
  EstadoSeguimiento,
  ResultadoSeguimiento,
  TipoServicioExterno,
  EstadoDerivacion,
  EstadoEntrevista,
  ModalidadEntrevista,
} from '@domain/enums/IntermediacionEnums.enum'
import { EstadoPostulacion } from '@domain/enums/PostulacionEnums.enum'
import {
  EntityNotFoundError,
  BusinessRuleViolationError,
  DuplicateEntityError,
} from '@domain/errors/DomainError'

// ============================================================
// ASIGNAR CANDIDATO
// ============================================================

export class AsignarseCandidatoUseCase {
  constructor(
    private readonly asignacionRepository: IAsignacionIntermediadorRepository,
    private readonly notificationService: INotificationService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(idIntermediador: number, idCandidato: number, idUsuario: number): Promise<void> {
    // RN-41: límite de candidatos activos
    const totalActivos = await this.asignacionRepository.countActivasByIdIntermediador(idIntermediador)
    if (totalActivos >= MAX_CANDIDATOS_POR_INTERMEDIADOR) {
      throw new BusinessRuleViolationError(
        'RN-41',
        `Has alcanzado el límite de ${MAX_CANDIDATOS_POR_INTERMEDIADOR} candidatos activos`,
      )
    }

    // RN-42: candidato con un solo intermediador a la vez
    const yaAsignado = await this.asignacionRepository.existsActivaByIdCandidato(idCandidato)
    if (yaAsignado) {
      throw new BusinessRuleViolationError('RN-42', 'Este candidato ya tiene un intermediador activo')
    }

    const asignacion = await this.asignacionRepository.save(
      new AsignacionIntermediador({
        id: 0,
        idIntermediador,
        idCandidato,
        fechaAsignacion: new Date(),
        estado: EstadoAsignacion.ACTIVA,
      }),
    )

    await this.notificationService.notificar(
      idCandidato,
      'Se te asignó un intermediador laboral',
      'Un intermediador laboral se ha asignado a tu perfil para acompañarte en tu búsqueda de empleo.',
    )

    await this.auditLogger.log({
      idUsuario,
      accion: 'candidato_asignado',
      modulo: 'intermediacion',
      objetoAfectado: 'AsignacionIntermediador',
      idObjetoAfectado: asignacion.id,
      resultado: 'exitoso',
    })
  }
}

// ============================================================
// REGISTRAR OBSERVACION
// ============================================================

export interface RegistrarObservacionInputDto {
  idIntermediador: number
  idCandidato: number
  idUsuario: number
  contenido: string
  tipo: TipoObservacion
}

export class RegistrarObservacionCandidatoUseCase {
  constructor(
    private readonly asignacionRepository: IAsignacionIntermediadorRepository,
    private readonly observacionRepository: IObservacionCandidatoRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: RegistrarObservacionInputDto): Promise<{ idObservacion: number }> {
    // Verificar asignación activa — RN-44
    const asignacion = await this.asignacionRepository.findActivaByIdCandidato(input.idCandidato)
    if (!asignacion || asignacion.idIntermediador !== input.idIntermediador) {
      throw new BusinessRuleViolationError(
        'RN-44',
        'Solo puedes registrar observaciones de candidatos que tienes asignados',
      )
    }

    const observacion = await this.observacionRepository.save(
      new ObservacionCandidato({
        id: 0,
        idIntermediador: input.idIntermediador,
        idCandidato: input.idCandidato,
        contenido: input.contenido,
        fechaRegistro: new Date(),
        tipo: input.tipo,
        confidencial: true,   // RN-44: siempre confidencial
      }),
    )

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'observacion_registrada',
      modulo: 'intermediacion',
      objetoAfectado: 'ObservacionCandidato',
      idObjetoAfectado: observacion.id,
      resultado: 'exitoso',
    })

    return { idObservacion: observacion.id }
  }
}

// ============================================================
// INICIAR SEGUIMIENTO
// ============================================================

export class IniciarSeguimientoPostulacionUseCase {
  constructor(
    private readonly asignacionRepository: IAsignacionIntermediadorRepository,
    private readonly seguimientoRepository: ISeguimientoPostulacionRepository,
    private readonly postulacionRepository: IPostulacionRepository,
  ) {}

  async execute(
    idPostulacion: number,
    idIntermediador: number,
    idCandidato: number,
  ): Promise<{ idSeguimiento: number; esNuevo: boolean }> {
    // Verificar asignación
    const asignacion = await this.asignacionRepository.findActivaByIdCandidato(idCandidato)
    if (!asignacion || asignacion.idIntermediador !== idIntermediador) {
      throw new BusinessRuleViolationError('seguimiento', 'No tienes este candidato asignado')
    }

    // Si ya existe un seguimiento activo, retornarlo
    const existente = await this.seguimientoRepository.findActivoByIdPostulacion(idPostulacion)
    if (existente) {
      return { idSeguimiento: existente.id, esNuevo: false }
    }

    const seguimiento = await this.seguimientoRepository.save(
      new SeguimientoPostulacion({
        id: 0,
        idIntermediador,
        idPostulacion,
        fechaInicio: new Date(),
        estado: EstadoSeguimiento.ACTIVO,
      }),
    )

    return { idSeguimiento: seguimiento.id, esNuevo: true }
  }
}

// ============================================================
// ACTUALIZAR NOTAS DE SEGUIMIENTO
// ============================================================

export class ActualizarNotasSeguimientoUseCase {
  constructor(
    private readonly seguimientoRepository: ISeguimientoPostulacionRepository,
  ) {}

  async execute(idSeguimiento: number, idIntermediador: number, notas: string): Promise<void> {
    const seguimiento = await this.seguimientoRepository.findById(idSeguimiento)
    if (!seguimiento) throw new EntityNotFoundError('SeguimientoPostulacion', idSeguimiento)

    if (seguimiento.idIntermediador !== idIntermediador) {
      throw new BusinessRuleViolationError('seguimiento', 'No tienes acceso a este seguimiento')
    }

    seguimiento.actualizarNotas(notas)
    await this.seguimientoRepository.update(seguimiento)
  }
}

// ============================================================
// PROGRAMAR ENTREVISTA
// ============================================================

export interface ProgramarEntrevistaInputDto {
  idPostulacion: number
  idUsuario: number
  fechaEntrevista: string
  modalidad: ModalidadEntrevista
  lugar?: string
  urlReunion?: string
  ajustesNecesarios?: string
  idUsuarioCandidato: number
  idUsuarioIntermediador?: number
}

export class ProgramarEntrevistaUseCase {
  constructor(
    private readonly entrevistaRepository: ICoordinacionEntrevistaRepository,
    private readonly postulacionRepository: IPostulacionRepository,
    private readonly notificationService: INotificationService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: ProgramarEntrevistaInputDto): Promise<{ idCoordinacion: number }> {
    const postulacion = await this.postulacionRepository.findById(input.idPostulacion)
    if (!postulacion) throw new EntityNotFoundError('Postulacion', input.idPostulacion)

    // Solo se programa entrevista cuando el candidato avanza
    if (
      postulacion.getEstado() === EstadoPostulacion.RETIRADA ||
      postulacion.getEstado() === EstadoPostulacion.RECHAZADA
    ) {
      throw new BusinessRuleViolationError('entrevista', 'No se puede coordinar entrevista en este estado')
    }

    // Actualizar estado de postulación a en_proceso
    postulacion.actualizarEstado(EstadoPostulacion.EN_PROCESO)
    await this.postulacionRepository.update(postulacion)

    const coordinacion = await this.entrevistaRepository.save(
      new CoordinacionEntrevista({
        id: 0,
        idPostulacion: input.idPostulacion,
        fechaEntrevista: new Date(input.fechaEntrevista),
        modalidad: input.modalidad,
        lugar: input.lugar,
        urlReunion: input.urlReunion,
        ajustesNecesarios: input.ajustesNecesarios,
        estado: EstadoEntrevista.PROGRAMADA,
      }),
    )

    await this.notificationService.notificar(
      input.idUsuarioCandidato,
      'Se programó una entrevista',
      `Tienes una entrevista programada para el ${input.fechaEntrevista}`,
    )

    if (input.idUsuarioIntermediador) {
      await this.notificationService.notificar(
        input.idUsuarioIntermediador,
        'Entrevista programada para tu candidato',
        `Se coordinó una entrevista para tu candidato asignado.`,
      )
    }

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'entrevista_coordinada',
      modulo: 'intermediacion',
      objetoAfectado: 'CoordinacionEntrevista',
      idObjetoAfectado: coordinacion.id,
      resultado: 'exitoso',
    })

    return { idCoordinacion: coordinacion.id }
  }
}

// ============================================================
// REGISTRAR RESULTADO DE SELECCIÓN
// ============================================================

export interface RegistrarResultadoInputDto {
  idSeguimiento: number
  idIntermediador: number
  idUsuario: number
  resultado: ResultadoSeguimiento
  idPostulacion: number
  idUsuarioCandidato: number
}

export class RegistrarResultadoSeleccionUseCase {
  constructor(
    private readonly seguimientoRepository: ISeguimientoPostulacionRepository,
    private readonly postulacionRepository: IPostulacionRepository,
    private readonly notificationService: INotificationService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: RegistrarResultadoInputDto): Promise<void> {
    const seguimiento = await this.seguimientoRepository.findById(input.idSeguimiento)
    if (!seguimiento) throw new EntityNotFoundError('SeguimientoPostulacion', input.idSeguimiento)

    if (seguimiento.idIntermediador !== input.idIntermediador) {
      throw new BusinessRuleViolationError('seguimiento', 'No tienes acceso a este seguimiento')
    }

    // RN-45: resultado registrado en entidad con cierre automático
    seguimiento.registrarResultado(input.resultado)
    await this.seguimientoRepository.update(seguimiento)

    const postulacion = await this.postulacionRepository.findById(input.idPostulacion)
    if (postulacion) {
      const estadoMap: Record<ResultadoSeguimiento, EstadoPostulacion> = {
        [ResultadoSeguimiento.CONTRATADO]: EstadoPostulacion.ACEPTADA,
        [ResultadoSeguimiento.RECHAZADO]: EstadoPostulacion.RECHAZADA,
        [ResultadoSeguimiento.RETIRADO]: EstadoPostulacion.RETIRADA,
        [ResultadoSeguimiento.DERIVADO]: EstadoPostulacion.EN_PROCESO,
        [ResultadoSeguimiento.EN_PROCESO]: EstadoPostulacion.EN_PROCESO,
      }
      postulacion.actualizarEstado(estadoMap[input.resultado])
      await this.postulacionRepository.update(postulacion)
    }

    // RN-46: notificación automática al intermediador si es contratado
    if (input.resultado === ResultadoSeguimiento.CONTRATADO) {
      await this.notificationService.notificar(
        input.idUsuario,
        '¡Candidato contratado!',
        'Uno de tus candidatos fue contratado exitosamente.',
      )
      await this.notificationService.notificar(
        input.idUsuarioCandidato,
        '¡Felicidades! Fuiste contratado',
        'Tu proceso de selección resultó exitoso.',
      )
    } else {
      await this.notificationService.notificar(
        input.idUsuarioCandidato,
        'Tu proceso de selección ha concluido',
        'Tu proceso de postulación ha finalizado.',
      )
    }

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'resultado_seleccion_registrado',
      modulo: 'intermediacion',
      objetoAfectado: 'SeguimientoPostulacion',
      idObjetoAfectado: input.idSeguimiento,
      resultado: 'exitoso',
      detalle: input.resultado,
    })
  }
}

// ============================================================
// REGISTRAR DERIVACIÓN
// ============================================================

export interface RegistrarDerivacionInputDto {
  idSeguimiento: number
  idCandidato: number
  idIntermediador: number
  idUsuario: number
  tipoServicio: TipoServicioExterno
  entidadDestino: string
  motivo: string
  idUsuarioCandidato: number
}

export class RegistrarDerivacionServicioUseCase {
  constructor(
    private readonly derivacionRepository: IDerivacionServicioRepository,
    private readonly seguimientoRepository: ISeguimientoPostulacionRepository,
    private readonly notificationService: INotificationService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: RegistrarDerivacionInputDto): Promise<{ idDerivacion: number }> {
    const seguimiento = await this.seguimientoRepository.findById(input.idSeguimiento)
    if (!seguimiento) throw new EntityNotFoundError('SeguimientoPostulacion', input.idSeguimiento)

    if (seguimiento.idIntermediador !== input.idIntermediador) {
      throw new BusinessRuleViolationError('derivacion', 'No tienes acceso a este seguimiento')
    }

    // RN-47: campos obligatorios validados en la entidad
    const derivacion = await this.derivacionRepository.save(
      new DerivacionServicio({
        id: 0,
        idSeguimiento: input.idSeguimiento,
        idCandidato: input.idCandidato,
        tipoServicio: input.tipoServicio,
        entidadDestino: input.entidadDestino,
        motivo: input.motivo,
        fechaDerivacion: new Date(),
        estado: EstadoDerivacion.PENDIENTE,
      }),
    )

    // RN-49: marcar seguimiento como derivado
    seguimiento.registrarResultado(ResultadoSeguimiento.DERIVADO)
    await this.seguimientoRepository.update(seguimiento)

    await this.notificationService.notificar(
      input.idUsuarioCandidato,
      'Has sido derivado a un servicio de apoyo',
      `Fuiste derivado a: ${input.entidadDestino} (${input.tipoServicio})`,
    )

    await this.auditLogger.log({
      idUsuario: input.idUsuario,
      accion: 'derivacion_registrada',
      modulo: 'intermediacion',
      objetoAfectado: 'DerivacionServicio',
      idObjetoAfectado: derivacion.id,
      resultado: 'exitoso',
    })

    return { idDerivacion: derivacion.id }
  }
}

// ============================================================
// ACTUALIZAR ESTADO DERIVACIÓN
// ============================================================

export class ActualizarEstadoDerivacionUseCase {
  constructor(
    private readonly derivacionRepository: IDerivacionServicioRepository,
    private readonly notificationService: INotificationService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(
    idDerivacion: number,
    nuevoEstado: EstadoDerivacion,
    idIntermediador: number,
    idUsuarioCandidato: number,
  ): Promise<void> {
    const derivacion = await this.derivacionRepository.findById(idDerivacion)
    if (!derivacion) throw new EntityNotFoundError('DerivacionServicio', idDerivacion)

    derivacion.actualizarEstado(nuevoEstado)
    await this.derivacionRepository.update(derivacion)

    // RN-49: si concluye, notificar para reanudar proceso
    if (nuevoEstado === EstadoDerivacion.CONCLUIDA) {
      await this.notificationService.notificar(
        idUsuarioCandidato,
        'Tu derivación concluyó',
        'Tu derivación al servicio externo concluyó. Tu proceso de postulación puede reanudarse.',
      )
    }

    await this.auditLogger.log({
      idUsuario: idIntermediador,
      accion: 'derivacion_actualizada',
      modulo: 'intermediacion',
      objetoAfectado: 'DerivacionServicio',
      idObjetoAfectado: idDerivacion,
      resultado: 'exitoso',
      detalle: nuevoEstado,
    })
  }
}
