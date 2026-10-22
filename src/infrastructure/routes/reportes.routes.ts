import { Router } from 'express'
import { AuthMiddleware } from '@infrastructure/middlewares/authMiddleware'
import { requireAdministrador, requireEmpresa, requireIntermediador } from '@infrastructure/middlewares/roleMiddleware'
import { validate } from '@infrastructure/middlewares/validationMiddleware'
import { ids } from '@infrastructure/validators/common/common.schemas'
import {
  compararReportesSchema, consolidadoQuerySchema, exportarParamsSchema, generarReporteCuotaSchema,
  generarReporteGestionSchema, generarReporteGlobalSchema,
} from '@infrastructure/validators/reportes/reporte.schema'
import {
  ReporteCuotaController,
  ReporteGestionController,
  ReporteGlobalController,
  DashboardController,
  ExportacionController,
} from '@infrastructure/controllers/reportes/ReporteController'

export function createReportesRoutes(
  auth: AuthMiddleware,
  cuota: ReporteCuotaController,
  gestion: ReporteGestionController,
  global: ReporteGlobalController,
  dashboard: DashboardController,
  exportacion: ExportacionController,
): Router {
  const router = Router()

  router.post('/empresas/:idEmpresa/reportes/cuota', auth, requireEmpresa(), validate({ params: ids('idEmpresa'), body: generarReporteCuotaSchema }), cuota.generar)
  router.post('/intermediadores/:idIntermediador/reportes/gestion', auth, requireIntermediador(), validate({ params: ids('idIntermediador'), body: generarReporteGestionSchema }), gestion.generar)
  router.post('/reportes/inclusion-laboral', auth, requireAdministrador(), validate({ body: generarReporteGlobalSchema }), global.generar)
  router.get('/reportes/inclusion-laboral/comparar', auth, requireAdministrador(), validate({ query: compararReportesSchema }), global.comparar)
  router.get('/dashboard', auth, requireAdministrador(), dashboard.obtener)
  router.get('/reportes/:tipo/:id/exportar/pdf', auth, validate({ params: exportarParamsSchema }), exportacion.exportarPDF)
  router.get('/reportes/:tipo/:id/exportar/excel', auth, validate({ params: exportarParamsSchema }), exportacion.exportarExcel)
  router.get('/reportes/consolidado/empresas', auth, requireAdministrador(), validate({ query: consolidadoQuerySchema }), exportacion.exportarConsolidado)

  return router
}