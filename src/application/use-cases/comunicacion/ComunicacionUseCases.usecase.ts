import {
  IConversacionRepository,
  IMensajeInternoRepository,
  IPlantillaNotificacionRepository,
  INotificacionRepository,
} from '@domain/repositories/comunicacion/ComunicacionRepositories'
import { IPostulacionRepository } from '@domain/repositories/busquedaPostulacion/PostulacionRepositories'
import { IAsignacionIntermediadorRepository } from '@domain/repositories/intermediacion/IntermediacionRepositories'
import { IAuditLoggerService } from '@application/ports/IAuditLoggerService'
import { INotificationService } from '@application/ports/INotificationService'
import {
  Conversacion,
  MensajeInterno,
  PlantillaNotificacion,
  Notificacion,
} from '@domain/entities/comunicacion/ComunicacionEntities.entity'
import { EstadoConversacion, TipoConversacion, CanalNotificacion } from '@domain/enums/ComunicacionEnums.enum'
import {
  EntityNotFoundError,
  BusinessRuleViolationError,
  DuplicateEntityError,
} from '@domain/errors/DomainError'

// ============================================================
// INICIAR CONVERSACION
// ============================================================

export interface IniciarConversacionInputDto {
  idPostulacion: number
  idUsuarioEmisor: number
  tipoEmisor: 'candidato' | 'empresa' | 'intermediador'
  idUsuarioReceptor: number
}

export interface IniciarConversacionOutputDto {
  idConversacion: number
  esNueva: boolean
}

export class IniciarConversacionUseCase {
  constructor(
    private readonly conversacionRepository: IConversacionRepository,
    private readonly postulacionRepository: IPostulacionRepository,
    private readonly asignacionRepository: IAsignacionIntermediadorRepository,
  ) {}

  async execute(input: IniciarConversacionInputDto): Promise<IniciarConversacionOutputDto> {
    const postulacion = await this.postulacionRepository.findById(input.idPostulacion)
    if (!postulacion) throw new EntityNotFoundError('Postulacion', input.idPostulacion)

    // RN-58: candidato necesita postulación activa para contactar empresa
    if (input.tipoEmisor === 'candidato' && !postulacion.estaActiva()) {
      throw new BusinessRuleViolationError(
        'RN-58',
        'Solo puedes contactar empresas donde tengas una postulación activa',
      )
    }

    // Verificar si ya existe conversación para esta postulación
    const existente = await this.conversacionRepository.findByIdPostulacion(input.idPostulacion)
    if (existente) {
      // Si el intermediador se une, agregarlo como participante
      if (input.tipoEmisor === 'intermediador') {
        const participantes = await this.conversacionRepository.getParticipantes(existente.id)
        if (!participantes.includes(input.idUsuarioEmisor)) {
          await this.conversacionRepository.addParticipante(existente.id, input.idUsuarioEmisor)
        }
      }
      return { idConversacion: existente.id, esNueva: false }
    }

    const tipoMap: Record<string, TipoConversacion> = {
      candidato: TipoConversacion.CANDIDATO_EMPRESA,
      empresa: TipoConversacion.CANDIDATO_EMPRESA,
      intermediador: TipoConversacion.INTERMEDIADOR_EMPRESA,
    }

    const conversacion = await this.conversacionRepository.save(
      new Conversacion({
        id: 0,
        idPostulacion: input.idPostulacion,
        fechaCreacion: new Date(),
        estado: EstadoConversacion.ACTIVA,
        tipo: tipoMap[input.tipoEmisor],
      }),
    )

    await this.conversacionRepository.addParticipante(conversacion.id, input.idUsuarioEmisor)
    await this.conversacionRepository.addParticipante(conversacion.id, input.idUsuarioReceptor)

    return { idConversacion: conversacion.id, esNueva: true }
  }
}

// ============================================================
// ENVIAR MENSAJE
// ============================================================

export interface EnviarMensajeInputDto {
  idConversacion: number
  idEmisor: number
  contenido: string
  idDestinatario: number
}

export class EnviarMensajeUseCase {
  constructor(
    private readonly conversacionRepository: IConversacionRepository,
    private readonly mensajeRepository: IMensajeInternoRepository,
    private readonly notificationService: INotificationService,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: EnviarMensajeInputDto): Promise<{ idMensaje: number }> {
    const conversacion = await this.conversacionRepository.findById(input.idConversacion)
    if (!conversacion) throw new EntityNotFoundError('Conversacion', input.idConversacion)

    // Verificar que el emisor es participante — RN-51
    const participantes = await this.conversacionRepository.getParticipantes(input.idConversacion)
    if (!participantes.includes(input.idEmisor)) {
      throw new BusinessRuleViolationError('RN-51', 'No eres participante de esta conversación')
    }

    // Registrar actividad en la conversación (valida que esté activa)
    conversacion.registrarMensaje()
    await this.conversacionRepository.update(conversacion)

    // RN-52: los mensajes no pueden eliminarse — simplemente se guardan
    const mensaje = await this.mensajeRepository.save(
      new MensajeInterno({
        id: 0,
        idConversacion: input.idConversacion,
        idEmisor: input.idEmisor,
        contenido: input.contenido,
        fechaEnvio: new Date(),
        leido: false,
      }),
    )

    // RN-53: notificar al destinatario dentro de las 2 horas (en producción
    // esto sería un job programado; aquí se notifica inmediatamente)
    await this.notificationService.notificar(
      input.idDestinatario,
      'Nuevo mensaje',
      'Tienes un nuevo mensaje en el portal.',
    )

    await this.auditLogger.log({
      idUsuario: input.idEmisor,
      accion: 'mensaje_enviado',
      modulo: 'comunicacion',
      objetoAfectado: 'MensajeInterno',
      idObjetoAfectado: mensaje.id,
      resultado: 'exitoso',
    })

    return { idMensaje: mensaje.id }
  }
}

// ============================================================
// ENVIAR MENSAJE MASIVO
// ============================================================

export interface EnviarMensajeMasivoInputDto {
  idEmpresa: number
  idUsuarioEmpresa: number
  idsCandidatos: number[]
  contenido: string
}

export class EnviarMensajeMasivoUseCase {
  constructor(
    private readonly conversacionRepository: IConversacionRepository,
    private readonly mensajeRepository: IMensajeInternoRepository,
    private readonly notificationService: INotificationService,
  ) {}

  async execute(input: EnviarMensajeMasivoInputDto): Promise<{ totalEnviados: number }> {
    if (!input.idsCandidatos || input.idsCandidatos.length === 0) {
      throw new BusinessRuleViolationError('mensaje_masivo', 'Selecciona al menos un candidato')
    }

    let totalEnviados = 0

    for (const idCandidato of input.idsCandidatos) {
      // Buscar conversación existente o crear nueva
      let conversacion = await this.conversacionRepository.findByParticipantes(
        input.idUsuarioEmpresa,
        idCandidato,
      )

      if (!conversacion) {
        conversacion = await this.conversacionRepository.save(
          new Conversacion({
            id: 0,
            fechaCreacion: new Date(),
            estado: EstadoConversacion.ACTIVA,
            tipo: TipoConversacion.CANDIDATO_EMPRESA,
          }),
        )
        await this.conversacionRepository.addParticipante(conversacion.id, input.idUsuarioEmpresa)
        await this.conversacionRepository.addParticipante(conversacion.id, idCandidato)
      }

      conversacion.registrarMensaje()
      await this.conversacionRepository.update(conversacion)

      await this.mensajeRepository.save(
        new MensajeInterno({
          id: 0,
          idConversacion: conversacion.id,
          idEmisor: input.idUsuarioEmpresa,
          contenido: input.contenido,
          fechaEnvio: new Date(),
          leido: false,
        }),
      )

      await this.notificationService.notificar(
        idCandidato,
        'Nuevo mensaje de una empresa',
        'Tienes un nuevo mensaje de una empresa en el portal.',
      )

      totalEnviados++
    }

    return { totalEnviados }
  }
}

// ============================================================
// MARCAR MENSAJES COMO LEÍDOS
// ============================================================

export class MarcarMensajesLeidosUseCase {
  constructor(
    private readonly conversacionRepository: IConversacionRepository,
    private readonly mensajeRepository: IMensajeInternoRepository,
  ) {}

  async execute(idConversacion: number, idUsuario: number): Promise<void> {
    const conversacion = await this.conversacionRepository.findById(idConversacion)
    if (!conversacion) throw new EntityNotFoundError('Conversacion', idConversacion)

    const participantes = await this.conversacionRepository.getParticipantes(idConversacion)
    if (!participantes.includes(idUsuario)) {
      throw new BusinessRuleViolationError('mensaje', 'No eres participante de esta conversación')
    }

    await this.mensajeRepository.updateLeidos(idConversacion, idUsuario)
  }
}

// ============================================================
// OBTENER HISTORIAL DE CONVERSACIÓN
// ============================================================

export interface HistorialConversacionOutputDto {
  idConversacion: number
  tipo: TipoConversacion
  estado: EstadoConversacion
  mensajes: {
    id: number
    idEmisor: number
    contenido: string
    fechaEnvio: Date
    leido: boolean
  }[]
  participantes: number[]
}

export class ObtenerHistorialConversacionUseCase {
  constructor(
    private readonly conversacionRepository: IConversacionRepository,
    private readonly mensajeRepository: IMensajeInternoRepository,
  ) {}

  async execute(idConversacion: number, idUsuario: number): Promise<HistorialConversacionOutputDto> {
    const conversacion = await this.conversacionRepository.findById(idConversacion)
    if (!conversacion) throw new EntityNotFoundError('Conversacion', idConversacion)

    const participantes = await this.conversacionRepository.getParticipantes(idConversacion)
    if (!participantes.includes(idUsuario)) {
      throw new BusinessRuleViolationError('RN-51', 'No tienes acceso a esta conversación')
    }

    const mensajes = await this.mensajeRepository.findByIdConversacion(idConversacion)

    return {
      idConversacion: conversacion.id,
      tipo: conversacion.tipo,
      estado: conversacion.getEstado(),
      mensajes: mensajes.map(m => ({
        id: m.id,
        idEmisor: m.idEmisor,
        contenido: m.getContenido(),
        fechaEnvio: m.fechaEnvio,
        leido: m.isLeido(),
      })),
      participantes,
    }
  }
}

// ============================================================
// GESTIONAR PLANTILLAS DE NOTIFICACIÓN
// ============================================================

export interface CrearPlantillaInputDto {
  idAdministrador: number
  nombre: string
  asunto?: string
  cuerpo: string
  evento: string
  rolesDestino?: string
}

export class CrearPlantillaNotificacionUseCase {
  constructor(
    private readonly plantillaRepository: IPlantillaNotificacionRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: CrearPlantillaInputDto): Promise<{ idPlantilla: number }> {
    // RN-68: no duplicar plantillas activas por evento
    const duplicada = await this.plantillaRepository.existsActivaPorEvento(input.evento)
    if (duplicada) {
      throw new DuplicateEntityError('PlantillaNotificacion', 'evento activo')
    }

    const plantilla = await this.plantillaRepository.save(
      new PlantillaNotificacion({
        id: 0,
        idAdministrador: input.idAdministrador,
        nombre: input.nombre,
        asunto: input.asunto,
        cuerpo: input.cuerpo,
        evento: input.evento,
        rolesDestino: input.rolesDestino,
        activa: true,
        fechaCreacion: new Date(),
      }),
    )

    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: 'plantilla_notificacion_creada',
      modulo: 'comunicacion',
      objetoAfectado: 'PlantillaNotificacion',
      idObjetoAfectado: plantilla.id,
      resultado: 'exitoso',
    })

    return { idPlantilla: plantilla.id }
  }
}

export interface EditarPlantillaInputDto {
  idPlantilla: number
  idAdministrador: number
  nombre?: string
  asunto?: string
  cuerpo?: string
  rolesDestino?: string
}

export class EditarPlantillaNotificacionUseCase {
  constructor(
    private readonly plantillaRepository: IPlantillaNotificacionRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(input: EditarPlantillaInputDto): Promise<void> {
    const plantilla = await this.plantillaRepository.findById(input.idPlantilla)
    if (!plantilla) throw new EntityNotFoundError('PlantillaNotificacion', input.idPlantilla)

    plantilla.actualizar({
      nombre: input.nombre,
      asunto: input.asunto,
      cuerpo: input.cuerpo,
      rolesDestino: input.rolesDestino,
    })

    await this.plantillaRepository.update(plantilla)

    await this.auditLogger.log({
      idUsuario: input.idAdministrador,
      accion: 'plantilla_notificacion_editada',
      modulo: 'comunicacion',
      objetoAfectado: 'PlantillaNotificacion',
      idObjetoAfectado: input.idPlantilla,
      resultado: 'exitoso',
    })
  }
}

export class DesactivarPlantillaNotificacionUseCase {
  constructor(
    private readonly plantillaRepository: IPlantillaNotificacionRepository,
    private readonly auditLogger: IAuditLoggerService,
  ) {}

  async execute(idPlantilla: number, idAdministrador: number): Promise<void> {
    const plantilla = await this.plantillaRepository.findById(idPlantilla)
    if (!plantilla) throw new EntityNotFoundError('PlantillaNotificacion', idPlantilla)

    plantilla.desactivar()
    await this.plantillaRepository.update(plantilla)

    await this.auditLogger.log({
      idUsuario: idAdministrador,
      accion: 'plantilla_notificacion_desactivada',
      modulo: 'comunicacion',
      objetoAfectado: 'PlantillaNotificacion',
      idObjetoAfectado: idPlantilla,
      resultado: 'exitoso',
    })
  }
}

// ============================================================
// DISPARAR NOTIFICACIÓN POR EVENTO
// ============================================================

export interface DispararNotificacionInputDto {
  evento: string
  idUsuarioDestino: number
  datosEvento: Record<string, string>
  idAlerta?: number
}

export class DispararNotificacionPorEventoUseCase {
  constructor(
    private readonly plantillaRepository: IPlantillaNotificacionRepository,
    private readonly notificacionRepository: INotificacionRepository,
  ) {}

  async execute(input: DispararNotificacionInputDto): Promise<void> {
    let plantilla = await this.plantillaRepository.findActivaPorEvento(input.evento)

    let titulo = `Notificación: ${input.evento}`
    let contenido = JSON.stringify(input.datosEvento)
    let idPlantilla: number | undefined

    if (plantilla) {
      titulo = plantilla.getAsunto() ?? plantilla.getNombre()
      contenido = plantilla.construirContenido(input.datosEvento)
      idPlantilla = plantilla.id
    }

    // RN-57: formato accesible según preferencias
    await this.notificacionRepository.save(
      new Notificacion({
        id: 0,
        idUsuario: input.idUsuarioDestino,
        idPlantilla,
        idAlerta: input.idAlerta,
        titulo,
        contenido,
        fechaEnvio: new Date(),
        leida: false,
        canal: CanalNotificacion.PLATAFORMA,
        formatoAccesible: true,
      }),
    )
  }
}

export class EnviarNotificacionMasivaUseCase {
  constructor(
    private readonly notificacionRepository: INotificacionRepository,
  ) {}

  async execute(
    idsUsuarios: number[],
    titulo: string,
    contenido: string,
    idPlantilla?: number,
  ): Promise<void> {
    const notificaciones: Notificacion[] = idsUsuarios.map(id =>
      new Notificacion({
        id: 0,
        idUsuario: id,
        idPlantilla,
        titulo,
        contenido,
        fechaEnvio: new Date(),
        leida: false,
        canal: CanalNotificacion.PLATAFORMA,
        formatoAccesible: true,
      }),
    )

    await this.notificacionRepository.saveMasivo(notificaciones)
  }
}
