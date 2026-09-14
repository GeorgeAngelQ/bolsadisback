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
import { DatabaseAuditLoggerService } from "@infrastructure/services/audit/DatabaseAuditLoggerService"
import { ExcelJsGeneratorService } from "@infrastructure/services/documents/ExcelJsGeneratorService"
import { PdfKitGeneratorService } from "@infrastructure/services/documents/PdfKitGeneratorService"
import { LocalFileStorageService } from "@infrastructure/services/storage/LocalFileStorageService"

export function buildModulo8Container(deps: {
   reporteCuotaRepo: any
   reporteGestionRepo: any
   reporteGlobalRepo: any
   dashboardRepo: any
   perfilEmpresaRepo: any
   auditoriaRepo: any
}) {
   const auditLogger = new DatabaseAuditLoggerService(deps.auditoriaRepo)
   const pdfGeneratorService = new PdfKitGeneratorService()
   const fileStorageService = new LocalFileStorageService()
   const excelGeneratorService = new ExcelJsGeneratorService()

  return {
      generarReporteCuota: new GenerarReporteCuotaInclusionUseCase(deps.reporteCuotaRepo, deps.perfilEmpresaRepo, auditLogger),
      generarReporteGestion: new GenerarReporteGestionIntermediadorUseCase(deps.reporteGestionRepo, auditLogger),
      generarReporteGlobal: new GenerarReporteInclusionLaboralUseCase(deps.reporteGlobalRepo, auditLogger),
      compararPeriodos: new CompararPeriodosReporteUseCase(deps.reporteGlobalRepo),
      obtenerDashboard: new ObtenerDashboardIndicadoresUseCase(deps.dashboardRepo),
      exportarPDF: new ExportarReportePDFUseCase(deps.reporteCuotaRepo, deps.reporteGestionRepo, deps.reporteGlobalRepo, pdfGeneratorService, fileStorageService, auditLogger),
      exportarExcel: new ExportarReporteExcelUseCase(deps.reporteCuotaRepo, deps.reporteGestionRepo, deps.reporteGlobalRepo, excelGeneratorService, fileStorageService, auditLogger),
      exportarConsolidado: new ExportarConsolidadoEmpresasUseCase(deps.reporteCuotaRepo, excelGeneratorService, fileStorageService, auditLogger)
  }
}

export type Modulo8Container = ReturnType<typeof buildModulo8Container>