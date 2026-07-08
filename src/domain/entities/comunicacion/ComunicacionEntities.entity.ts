import { EstadoConversacion, TipoConversacion, CanalNotificacion } from '../../enums/ComunicacionEnums.enum'
import { BusinessRuleViolationError, InvalidEntityStateError } from '../../errors/DomainError'

// ---------- Conversacion ----------

export interface ConversacionProps {
  id: number
  idPostulacion?: number
  fechaCreacion: Date
  fechaUltimoMensaje?: Date
  estado: EstadoConversacion
  tipo: TipoConversacion
}

export class Conversacion {
  readonly id: number
  readonly idPostulacion?: number
  readonly fechaCreacion: Date
  private fechaUltimoMensaje?: Date
  private estado: EstadoConversacion
  readonly tipo: TipoConversacion

  constructor(props: ConversacionProps) {
    this.id = props.id
    this.idPostulacion = props.idPostulacion
    this.fechaCreacion = props.fechaCreacion
    this.fechaUltimoMensaje = props.fechaUltimoMensaje
    this.estado = props.estado
    this.tipo = props.tipo
  }

  getEstado(): EstadoConversacion { return this.estado }
  getFechaUltimoMensaje(): Date | undefined { return this.fechaUltimoMensaje }
  isActiva(): boolean { return this.estado === EstadoConversacion.ACTIVA }

  registrarMensaje(): void {
    if (!this.isActiva()) {
      throw new InvalidEntityStateError('Conversacion', 'enviar mensaje — la conversación está cerrada')
    }
    this.fechaUltimoMensaje = new Date()
  }

  cerrar(): void { this.estado = EstadoConversacion.CERRADA }
}

// ---------- MensajeInterno ----------

export interface MensajeInternoProps {
  id: number
  idConversacion: number
  idEmisor: number
  contenido: string
  fechaEnvio: Date
  leido: boolean
  fechaLectura?: Date
}

export class MensajeInterno {
  readonly id: number
  readonly idConversacion: number
  readonly idEmisor: number
  private contenido: string
  readonly fechaEnvio: Date
  private leido: boolean
  private fechaLectura?: Date

  constructor(props: MensajeInternoProps) {
    if (!props.contenido || props.contenido.trim().length === 0) {
      throw new BusinessRuleViolationError('mensaje', 'El mensaje no puede estar vacío')
    }
    this.id = props.id
    this.idConversacion = props.idConversacion
    this.idEmisor = props.idEmisor
    this.contenido = props.contenido
    this.fechaEnvio = props.fechaEnvio
    this.leido = props.leido
    this.fechaLectura = props.fechaLectura
  }

  getContenido(): string { return this.contenido }
  isLeido(): boolean { return this.leido }
  getFechaLectura(): Date | undefined { return this.fechaLectura }

  // RN-52: los mensajes no pueden eliminarse
  marcarLeido(): void {
    if (!this.leido) {
      this.leido = true
      this.fechaLectura = new Date()
    }
  }
}

// ---------- Notificacion ----------

export interface NotificacionProps {
  id: number
  idUsuario: number
  idPlantilla?: number
  idAlerta?: number
  titulo: string
  contenido: string
  fechaEnvio: Date
  leida: boolean
  canal: CanalNotificacion
  formatoAccesible: boolean
}

export class Notificacion {
  readonly id: number
  readonly idUsuario: number
  readonly idPlantilla?: number
  readonly idAlerta?: number
  readonly titulo: string
  readonly contenido: string
  readonly fechaEnvio: Date
  private leida: boolean
  readonly canal: CanalNotificacion
  readonly formatoAccesible: boolean

  constructor(props: NotificacionProps) {
    this.id = props.id
    this.idUsuario = props.idUsuario
    this.idPlantilla = props.idPlantilla
    this.idAlerta = props.idAlerta
    this.titulo = props.titulo
    this.contenido = props.contenido
    this.fechaEnvio = props.fechaEnvio
    this.leida = props.leida
    this.canal = props.canal
    this.formatoAccesible = props.formatoAccesible
  }

  isLeida(): boolean { return this.leida }
  marcarLeida(): void { this.leida = true }
}

// ---------- PlantillaNotificacion ----------

export interface PlantillaNotificacionProps {
  id: number
  idAdministrador: number
  nombre: string
  asunto?: string
  cuerpo: string
  evento: string
  rolesDestino?: string
  activa: boolean
  fechaCreacion: Date
}

export class PlantillaNotificacion {
  readonly id: number
  readonly idAdministrador: number
  private nombre: string
  private asunto?: string
  private cuerpo: string
  private evento: string
  private rolesDestino?: string
  private activa: boolean
  readonly fechaCreacion: Date

  constructor(props: PlantillaNotificacionProps) {
    if (!props.evento || props.evento.trim().length === 0) {
      throw new BusinessRuleViolationError('plantilla', 'Debe asociar la plantilla a un evento')
    }
    if (!props.cuerpo || props.cuerpo.trim().length === 0) {
      throw new BusinessRuleViolationError('plantilla', 'El cuerpo de la notificación no puede estar vacío')
    }
    this.id = props.id
    this.idAdministrador = props.idAdministrador
    this.nombre = props.nombre
    this.asunto = props.asunto
    this.cuerpo = props.cuerpo
    this.evento = props.evento
    this.rolesDestino = props.rolesDestino
    this.activa = props.activa
    this.fechaCreacion = props.fechaCreacion
  }

  getNombre(): string { return this.nombre }
  getAsunto(): string | undefined { return this.asunto }
  getCuerpo(): string { return this.cuerpo }
  getEvento(): string { return this.evento }
  getRolesDestino(): string | undefined { return this.rolesDestino }
  isActiva(): boolean { return this.activa }

  activar(): void { this.activa = true }
  desactivar(): void { this.activa = false }

  actualizar(datos: Partial<Pick<PlantillaNotificacionProps, 'nombre' | 'asunto' | 'cuerpo' | 'rolesDestino'>>): void {
    if (datos.nombre) this.nombre = datos.nombre
    if (datos.asunto !== undefined) this.asunto = datos.asunto
    if (datos.cuerpo) {
      if (datos.cuerpo.trim().length === 0) {
        throw new BusinessRuleViolationError('plantilla', 'El cuerpo no puede estar vacío')
      }
      this.cuerpo = datos.cuerpo
    }
    if (datos.rolesDestino !== undefined) this.rolesDestino = datos.rolesDestino
  }

  construirContenido(datos: Record<string, string>): string {
    let contenido = this.cuerpo
    for (const [clave, valor] of Object.entries(datos)) {
      contenido = contenido.replace(new RegExp(`{{${clave}}}`, 'g'), valor)
    }
    return contenido
  }
}
