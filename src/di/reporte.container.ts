import { 
   CompararPeriodosReporteUseCase, 
   GenerarReporteCuotaInclusionUseCase, 
   GenerarReporteGestionIntermediadorUseCase, 
   GenerarReporteInclusionLaboralUseCase, 
   ObtenerDashboardIndicadoresUseCase 
} from "@application/use-cases/reportes/ReporteUseCases.usecase"
import { DatabaseAuditLoggerService } from "@infrastructure/services/audit/DatabaseAuditLoggerService"

export function buildModulo8Container(deps: {
   reporteCuotaRepo: any
   reporteGestionRepo: any
   reporteGlobalRepo: any
   dashboardRepo: any
   perfilEmpresaRepo: any
   auditoriaRepo: any
   notificacionRepo: any
}) {
   const auditLogger = new DatabaseAuditLoggerService(deps.auditoriaRepo)

  return {
      generarReporteCuota: new GenerarReporteCuotaInclusionUseCase(deps.reporteCuotaRepo, deps.perfilEmpresaRepo, auditLogger),
      generarReporteGesion: new GenerarReporteGestionIntermediadorUseCase(deps.reporteGestionRepo, auditLogger),
      generarReporteGlobal: new GenerarReporteInclusionLaboralUseCase(deps.reporteGlobalRepo, auditLogger),
      compararPeriodos: new CompararPeriodosReporteUseCase(deps.reporteGlobalRepo),
      obtenerDashboard: new ObtenerDashboardIndicadoresUseCase(deps.dashboardRepo)
  }
}

export type Modulo8Container = ReturnType<typeof buildModulo8Container>