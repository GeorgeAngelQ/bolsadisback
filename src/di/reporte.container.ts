import { Repositories } from './repositories'
import { SharedServices } from './shared.container'

import { 
   CompararPeriodosReporteUseCase, 
   ExportarConsolidadoEmpresasUseCase, 
   ExportarReporteExcelUseCase, 
   ExportarReportePDFUseCase, 
   GenerarReporteCuotaInclusionUseCase, 
   GenerarReporteGestionIntermediadorUseCase, 
   GenerarReporteInclusionLaboralUseCase, 
   ObtenerDashboardIndicadoresUseCase 
} from "@application/use-cases/reportes/ReporteUseCases.usecase"

export type Modulo8Repos = Pick<
  Repositories,
  | 'reporteCuotaRepo'
  | 'reporteGestionRepo'
  | 'reporteGlobalRepo'
  | 'dashboardRepo'
  | 'perfilEmpresaRepo'
>

export function buildModulo8Container(repos: Modulo8Repos, shared: SharedServices) {
  const { 
   auditLogger, 
   fileStorage: fileStorageService,
   pdfService,
   excelService
   } = shared

  return {
      generarReporteCuota: new GenerarReporteCuotaInclusionUseCase(repos.reporteCuotaRepo, repos.perfilEmpresaRepo, auditLogger),
      generarReporteGestion: new GenerarReporteGestionIntermediadorUseCase(repos.reporteGestionRepo, auditLogger),
      generarReporteGlobal: new GenerarReporteInclusionLaboralUseCase(repos.reporteGlobalRepo, auditLogger),
      compararPeriodos: new CompararPeriodosReporteUseCase(repos.reporteGlobalRepo),
      obtenerDashboard: new ObtenerDashboardIndicadoresUseCase(repos.dashboardRepo),
      exportarPDF: new ExportarReportePDFUseCase(repos.reporteCuotaRepo, repos.reporteGestionRepo, repos.reporteGlobalRepo, pdfService, fileStorageService, auditLogger),
      exportarExcel: new ExportarReporteExcelUseCase(repos.reporteCuotaRepo, repos.reporteGestionRepo, repos.reporteGlobalRepo, excelService, fileStorageService, auditLogger),
      exportarConsolidado: new ExportarConsolidadoEmpresasUseCase(repos.reporteCuotaRepo, excelService, fileStorageService, auditLogger)
  }
}

export type Modulo8Container = ReturnType<typeof buildModulo8Container>