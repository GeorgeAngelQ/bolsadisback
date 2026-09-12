import { ActualizarEstadoDerivacionUseCase, ActualizarNotasSeguimientoUseCase, AsignarseCandidatoUseCase, IniciarSeguimientoPostulacionUseCase, ProgramarEntrevistaUseCase, RegistrarDerivacionServicioUseCase, RegistrarObservacionCandidatoUseCase, RegistrarResultadoSeleccionUseCase } from "@application/use-cases/intermediacion/IntermediacionUseCases.usecase";
import { DatabaseAuditLoggerService } from "@infrastructure/services/audit/DatabaseAuditLoggerService";
import { InAppNotificationService } from "@infrastructure/services/notifications/InAppNotificationService";

export function buildModulo5Container(deps: {
   asignacionRepo: any
   observacionRepo: any
   seguimientoRepo: any
   postulacionRepo: any
   entrevistaRepo: any
   derivacionRepo: any
   notificacionRepo: any
   auditoriaRepo: any
}) {
  const auditLogger = new DatabaseAuditLoggerService(deps.auditoriaRepo)
  const notificationService = new InAppNotificationService(deps.notificacionRepo)
  return {
   asignarCandidato: new AsignarseCandidatoUseCase(deps.asignacionRepo, notificationService, auditLogger),
   registrarObservacion: new RegistrarObservacionCandidatoUseCase(deps.asignacionRepo, deps.observacionRepo, auditLogger),
   iniciarSeguimiento: new IniciarSeguimientoPostulacionUseCase(deps.asignacionRepo, deps.seguimientoRepo, deps.postulacionRepo),
   actualizarNotas: new ActualizarNotasSeguimientoUseCase(deps.seguimientoRepo),
   registrarResultado: new RegistrarResultadoSeleccionUseCase(deps.seguimientoRepo, deps.postulacionRepo, notificationService, auditLogger),
   programarEntrevista: new ProgramarEntrevistaUseCase(deps.entrevistaRepo, deps.postulacionRepo, notificationService, auditLogger),
   registrarDerivacion: new RegistrarDerivacionServicioUseCase(deps.derivacionRepo, deps.seguimientoRepo, notificationService, auditLogger),
   actualizarDerivacion: new ActualizarEstadoDerivacionUseCase(deps.derivacionRepo, notificationService, auditLogger)
  }
}

export type Modulo5Container = ReturnType<typeof buildModulo5Container>
