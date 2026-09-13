import { PostularVacanteUseCase } from "@application/use-cases/busquedaPostulacion/postularVacante/PostularVacante.usecase";
import { BuscarVacantesUseCase, ObtenerDetalleVacanteUseCase } from '@application/use-cases/busquedaPostulacion/buscarVacantes/BuscarVacantes.usecase'
import { CalificarExperienciaPostulacionUseCase } from '@application/use-cases/busquedaPostulacion/calificarPostulacion/CalificarExperienciaPostulacion.usecase'
import { 
  CrearAlertaEmpleoUseCase, 
  DesactivarAlertaEmpleoUseCase, 
  EditarAlertaEmpleoUseCase 
} from '@application/use-cases/busquedaPostulacion/gestionarAlertas/GestionarAlertas.usecase'
import { GuardarVacanteFavoritaUseCase, EliminarVacanteFavoritaUseCase } from '@application/use-cases/busquedaPostulacion/gestionarFavoritos/GestionarFavoritos.usecase'
import { 
  ListarPostulacionesCandidatoUseCase, 
  ObtenerDetallePostulacionUseCase, 
  RetirarPostulacionUseCase 
} from '@application/use-cases/busquedaPostulacion/gestionarPostulaciones/GestionarPostulaciones.usecase'
import { 
  GenerarRecomendacionesAutomaticasUseCase, 
  ListarRecomendacionesCandidatoUseCase, 
  CrearRecomendacionManualUseCase, 
  DescartarRecomendacionUseCase 
} from '@application/use-cases/busquedaPostulacion/gestionarRecomendaciones/GestionarRecomendaciones.usecase'

import { DatabaseAuditLoggerService } from "@infrastructure/services/audit/DatabaseAuditLoggerService";
import { InAppNotificationService } from "@infrastructure/services/notifications/InAppNotificationService";

export function buildModulo4Container(deps: {
  vacanteRepo: any
  vacanteGuardadaRepo: any
  perfilCandidatoRepo: any
  tipoDiscapacidadRepo: any
  postulacionRepo: any
  ajusteRequeridoRepo: any
  sancionRepo: any
  alertaRepo: any
  recomendacionRepo: any
  notificacionRepo: any
  auditoriaRepo: any
}) {
  const auditLogger = new DatabaseAuditLoggerService(deps.auditoriaRepo)
  const notificationService = new InAppNotificationService(deps.notificacionRepo)
  return {
    buscarVacantes: new BuscarVacantesUseCase(deps.vacanteRepo, deps.vacanteGuardadaRepo, deps.perfilCandidatoRepo, deps.tipoDiscapacidadRepo),
    obtenerDetalleVacante: new ObtenerDetalleVacanteUseCase(deps.vacanteRepo, deps.vacanteGuardadaRepo, deps.postulacionRepo, deps.tipoDiscapacidadRepo),
    postularVacante: new PostularVacanteUseCase(deps.postulacionRepo, deps.vacanteRepo, deps.perfilCandidatoRepo, notificationService, auditLogger),
    listarPostulaciones: new ListarPostulacionesCandidatoUseCase(deps.postulacionRepo),
    obtenerDetallePostulacion: new ObtenerDetallePostulacionUseCase(deps.postulacionRepo),
    retirarPostulacion: new RetirarPostulacionUseCase(deps.postulacionRepo, notificationService, auditLogger),
    calificarPostulacion: new CalificarExperienciaPostulacionUseCase(deps.postulacionRepo, auditLogger),
    guardarFavorita: new GuardarVacanteFavoritaUseCase(deps.vacanteGuardadaRepo, deps.vacanteRepo),
    eliminarFavorita: new EliminarVacanteFavoritaUseCase(deps.vacanteGuardadaRepo),
    crearAlerta: new CrearAlertaEmpleoUseCase(deps.alertaRepo, auditLogger),
    editarAlerta: new EditarAlertaEmpleoUseCase(deps.alertaRepo),
    desactivarAlerta: new DesactivarAlertaEmpleoUseCase(deps.alertaRepo),
    generarRecomendacionesAuto: new GenerarRecomendacionesAutomaticasUseCase(deps.recomendacionRepo, deps.vacanteRepo, deps.perfilCandidatoRepo, deps.tipoDiscapacidadRepo, notificationService),
    listarRecomendaciones: new ListarRecomendacionesCandidatoUseCase(deps.recomendacionRepo),
    crearRecomendacionManual: new CrearRecomendacionManualUseCase(deps.recomendacionRepo, deps.vacanteRepo, notificationService),
    descartarRecomendacion: new DescartarRecomendacionUseCase(deps.recomendacionRepo),
  }
}

export type Modulo4Container = ReturnType<typeof buildModulo4Container>
