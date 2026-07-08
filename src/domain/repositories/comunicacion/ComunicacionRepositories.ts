import { 
  Conversacion, 
  MensajeInterno, 
  Notificacion, 
  PlantillaNotificacion 
} from '../../entities/comunicacion/ComunicacionEntities.entity'


export interface IConversacionRepository {
  findById(id: number): Promise<Conversacion | null>
  findByIdPostulacion(idPostulacion: number): Promise<Conversacion | null>
  findByParticipantes(idUsuario1: number, idUsuario2: number): Promise<Conversacion | null>
  save(conv: Conversacion): Promise<Conversacion>
  update(conv: Conversacion): Promise<void>
  addParticipante(idConversacion: number, idUsuario: number): Promise<void>
  getParticipantes(idConversacion: number): Promise<number[]>
  findByIdUsuario(idUsuario: number): Promise<Conversacion[]>
}

export interface IMensajeInternoRepository {
  findByIdConversacion(idConversacion: number): Promise<MensajeInterno[]>
  findNoLeidosPorConversacionYUsuario(idConversacion: number, idUsuario: number): Promise<MensajeInterno[]>
  findSinRespuestaMasDe(diasHabiles: number): Promise<{ idConversacion: number; idUsuarioEmpresa: number }[]>
  save(msg: MensajeInterno): Promise<MensajeInterno>
  updateLeidos(idConversacion: number, idUsuario: number): Promise<void>
}

export interface INotificacionRepository {
  findByIdUsuario(idUsuario: number): Promise<Notificacion[]>
  findNoLeidasByIdUsuario(idUsuario: number): Promise<Notificacion[]>
  save(notif: Notificacion): Promise<Notificacion>
  saveMasivo(notifs: Notificacion[]): Promise<void>
  update(notif: Notificacion): Promise<void>
}

export interface IPlantillaNotificacionRepository {
  findById(id: number): Promise<PlantillaNotificacion | null>
  findAll(): Promise<PlantillaNotificacion[]>
  findActivaPorEvento(evento: string): Promise<PlantillaNotificacion | null>
  existsActivaPorEvento(evento: string, excludeId?: number): Promise<boolean>
  save(plantilla: PlantillaNotificacion): Promise<PlantillaNotificacion>
  update(plantilla: PlantillaNotificacion): Promise<void>
}
