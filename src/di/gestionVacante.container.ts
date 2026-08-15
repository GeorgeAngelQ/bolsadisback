import { 
   AprobarVacanteUseCase, 
   ListarVacantesPendientesUseCase, 
   RechazarVacanteUseCase 
} from "@application/use-cases/gestionVacante/aprobarRechazarVacante/AprobarRechazarVacante.usecase";
import { CerrarVacanteUseCase } from "@application/use-cases/gestionVacante/cerrarVacante/CerrarVacante.usecase";
import { EditarVacanteUseCase } from "@application/use-cases/gestionVacante/editarVacante/EditarVacante.usecase";
import { 
   DesestimarReporteContenidoUseCase, 
   RegistrarReporteContenidoUseCase, 
   RetirarContenidoReportadoUseCase 
} from "@application/use-cases/gestionVacante/gestionarReportesContenido/GestionarReportesContenido.usecase";
import { PublicarVacanteUseCase } from "@application/use-cases/gestionVacante/publicarVacante/PublicarVacante.usecase";
import { LevantarSancionEmpresaUseCase, RegistrarSancionEmpresaUseCase } from "@application/use-cases/gestionVacante/registrarSancionEmpresa/GestionarSancionEmpresa.usecase";
import { VerificarAjustesRazonablesVacanteUseCase } from "@application/use-cases/gestionVacante/verificarAjustesRazonables/VerificarAjustesRazonablesVacante.usecase";

import { DatabaseAuditLoggerService } from "@infrastructure/services/audit/DatabaseAuditLoggerService";
import { InAppNotificationService } from "@infrastructure/services/notifications/InAppNotificationService";

export function buildModulo3Container(deps: {
  vacanteRepo: any
  ajusteDisponibleRepo: any
  sancionRepo: any
  perfilEmpresaRepo: any 
  tipoDiscapacidadRepo: any 
  perfilCandidatoRepo: any
  ajusteRequeridoRepo: any 
  reporteContenidoRepo: any
  notificacionRepo: any
  auditoriaRepo: any
}) {
  const auditLogger = new DatabaseAuditLoggerService(deps.auditoriaRepo)
  const notificationService = new InAppNotificationService(deps.notificacionRepo)
  return {
    publicarVacante: new PublicarVacanteUseCase(deps.vacanteRepo, deps.ajusteDisponibleRepo, deps.sancionRepo, deps.perfilEmpresaRepo, deps.tipoDiscapacidadRepo, notificationService, auditLogger),
    editarVacante: new EditarVacanteUseCase(deps.vacanteRepo, deps.ajusteDisponibleRepo, deps.tipoDiscapacidadRepo, auditLogger),
    cerrarVacante: new CerrarVacanteUseCase(deps.vacanteRepo, notificationService, auditLogger),
    aprobarVacante: new AprobarVacanteUseCase(deps.vacanteRepo, notificationService, auditLogger),
    rechazarVacante: new RechazarVacanteUseCase(deps.vacanteRepo, notificationService, auditLogger),
    listarPendientes: new ListarVacantesPendientesUseCase(deps.vacanteRepo),
    verificarAjustes: new VerificarAjustesRazonablesVacanteUseCase(deps.vacanteRepo, deps.ajusteDisponibleRepo, deps.perfilCandidatoRepo, deps.ajusteRequeridoRepo, notificationService, auditLogger),
    registrarSancion: new RegistrarSancionEmpresaUseCase(deps.sancionRepo, auditLogger),
    levantarSancion: new LevantarSancionEmpresaUseCase(deps.sancionRepo, auditLogger),
    registrarReporte: new RegistrarReporteContenidoUseCase(deps.reporteContenidoRepo, notificationService),
    desestimarReporte: new DesestimarReporteContenidoUseCase(deps.reporteContenidoRepo, auditLogger),
    retirarContenido: new RetirarContenidoReportadoUseCase(deps.reporteContenidoRepo, deps.vacanteRepo, notificationService, auditLogger),
  }
}

export type Modulo3Container = ReturnType<typeof buildModulo3Container>
