import { INotificationService } from '../../../application/ports/INotificationService'
import { INotificacionRepository } from '../../../domain/repositories/comunicacion/ComunicacionRepositories'
import { Notificacion } from '../../../domain/entities/comunicacion/ComunicacionEntities.entity'
import { CanalNotificacion } from '../../../domain/enums/ComunicacionEnums.enum'

export class InAppNotificationService implements INotificationService {
  constructor(
    private readonly notificacionRepository: INotificacionRepository,
  ) {}

  async notificar(idUsuario: number, titulo: string, contenido: string): Promise<void> {
    if (idUsuario === 0) return 

    await this.notificacionRepository.save(
      new Notificacion({
        id: 0,
        idUsuario,
        titulo,
        contenido,
        fechaEnvio: new Date(),
        leida: false,
        canal: CanalNotificacion.PLATAFORMA,
        formatoAccesible: true,
      }),
    )
  }

  async notificarMasivo(idUsuarios: number[], titulo: string, contenido: string): Promise<void> {
    if (!idUsuarios || idUsuarios.length === 0) return

    const notificaciones = idUsuarios.map(id =>
      new Notificacion({
        id: 0,
        idUsuario: id,
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
