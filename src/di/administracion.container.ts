import { 
   ActualizarConfiguracionAccesibilidadGlobalUseCase, 
   BuscarEventosAuditoriaUseCase, 
   DetectarPatronesAnomaloUseCase, 
   EditarContenidoInformativoUseCase, 
   EliminarTipoDiscapacidadUseCase, 
   ExportarRegistroAuditoriaUseCase, 
   PublicarContenidoInformativoUseCase, 
   RetirarContenidoInformativoUseCase 
} from "@application/use-cases/administracion/AdministracionUseCases.usecase"
import { WcagAccessibilityChecker } from "@infrastructure/services/accessibility/WcagAccessibilityChecker"
import { DatabaseAuditLoggerService } from "@infrastructure/services/audit/DatabaseAuditLoggerService"
import { InAppNotificationService } from "@infrastructure/services/notifications/InAppNotificationService"

export function buildModulo7Container(deps: {
   contenidoRepo: any
   tipoDiscapacidadRepo: any
   configAccesibilidadRepo: any
   // mantenimientoRepo: any
   auditoriaRepo: any
   notificacionRepo: any
}) {
   const accessibilityChecker = new WcagAccessibilityChecker()
   const auditLogger = new DatabaseAuditLoggerService(deps.auditoriaRepo)
   const notificationService = new InAppNotificationService(deps.notificacionRepo)

  return {
      publicarContenido: new PublicarContenidoInformativoUseCase(deps.contenidoRepo, accessibilityChecker, auditLogger),
      editarContenido: new EditarContenidoInformativoUseCase(deps.contenidoRepo, auditLogger),
      retirarContenido: new RetirarContenidoInformativoUseCase(deps.contenidoRepo, auditLogger),
      eliminarTipoDiscapacidad: new EliminarTipoDiscapacidadUseCase(deps.tipoDiscapacidadRepo, auditLogger),
      actualizarConfigAccesibilidad: new ActualizarConfiguracionAccesibilidadGlobalUseCase(deps.configAccesibilidadRepo, notificationService, auditLogger),
      buscarEventosAuditoria: new BuscarEventosAuditoriaUseCase(deps.auditoriaRepo),
      detectarPatrones: new DetectarPatronesAnomaloUseCase(deps.auditoriaRepo, notificationService),
      exportarAuditoria: new ExportarRegistroAuditoriaUseCase(deps.auditoriaRepo, auditLogger),
      // programarManteniento: new ProgramarMantenimientoUseCase(deps.mantenimientoRepo, notificationService, auditLogger),
      // finalizarMantenimiento: new FinalizarMantenimientoUseCase(deps.mantenimientoRepo, notificationService, auditLogger),
  }
}

export type Modulo7Container = ReturnType<typeof buildModulo7Container>