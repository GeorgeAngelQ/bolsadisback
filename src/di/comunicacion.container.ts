import { 
   CrearPlantillaNotificacionUseCase, 
   DesactivarPlantillaNotificacionUseCase, 
   EditarPlantillaNotificacionUseCase, 
   EnviarMensajeMasivoUseCase, 
   EnviarMensajeUseCase, 
   IniciarConversacionUseCase, 
   MarcarMensajesLeidosUseCase, 
   ObtenerHistorialConversacionUseCase 
} from '@application/use-cases/comunicacion/ComunicacionUseCases.usecase'
import { DatabaseAuditLoggerService } from '@infrastructure/services/audit/DatabaseAuditLoggerService'
import { InAppNotificationService } from '@infrastructure/services/notifications/InAppNotificationService'


export function buildModulo6Container(deps: {
   conversacionRepo: any
   postulacionRepo: any
   asignacionRepo: any
   mensajeRepo: any
   plantillaRepo: any
   auditoriaRepo: any
   notificacionRepo: any
}) {
  const auditLogger = new DatabaseAuditLoggerService(deps.auditoriaRepo)
  const notificationService = new InAppNotificationService(deps.notificacionRepo)

  return {
    iniciarConversacion: new IniciarConversacionUseCase(deps.conversacionRepo, deps.postulacionRepo, deps.asignacionRepo),
    obtenerHistorial: new ObtenerHistorialConversacionUseCase(deps.conversacionRepo, deps.mensajeRepo),
    enviarMensaje: new EnviarMensajeUseCase(deps.conversacionRepo, deps.mensajeRepo, deps.notificacionRepo, auditLogger),
    enviarMasivo: new EnviarMensajeMasivoUseCase(deps.conversacionRepo, deps.conversacionRepo, notificationService),
    marcarLeidos: new MarcarMensajesLeidosUseCase(deps.conversacionRepo, deps.mensajeRepo),
    crearPlantilla: new CrearPlantillaNotificacionUseCase(deps.plantillaRepo, auditLogger),
    editarPlantilla: new EditarPlantillaNotificacionUseCase(deps.plantillaRepo, auditLogger),
    desactivarPlantilla: new DesactivarPlantillaNotificacionUseCase(deps.plantillaRepo, auditLogger),
  }
}

export type Modulo6Container = ReturnType<typeof buildModulo6Container>
