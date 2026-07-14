import { IAuditLoggerService, AuditEvent } from '../../../application/ports/IAuditLoggerService'
import { IEventoAuditoriaRepository } from '../../../domain/repositories/administracion/AdministracionRepositories'
import { EventoAuditoria } from '../../../domain/entities/administracion/AdministracionEntities.entity'

export class DatabaseAuditLoggerService implements IAuditLoggerService {
  constructor(
    private readonly auditoriaRepository: IEventoAuditoriaRepository,
  ) {}

  async log(event: AuditEvent): Promise<void> {
    try {
      await this.auditoriaRepository.save(
        new EventoAuditoria({
          id: 0,
          idUsuario: event.idUsuario,
          accion: event.accion,
          modulo: event.modulo,
          objetoAfectado: event.objetoAfectado,
          idObjetoAfectado: event.idObjetoAfectado,
          fechaHora: new Date(),
          ipOrigen: event.ipOrigen,
          resultado: event.resultado,
          detalle: event.detalle,
        }),
      )
    } catch (err) {
      console.error('[AuditLogger] Error al registrar evento:', err)
    }
  }
}
