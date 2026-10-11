import { Router } from 'express'
import { AuthMiddleware } from '../middlewares/authMiddleware'
import { requireAdministrador, requireEmpresa, requireIntermediador } from '../middlewares/roleMiddleware'
import {
  ReporteCuotaController,
  ReporteGestionController,
  ReporteGlobalController,
  DashboardController,
  ExportacionController,
} from '../controllers/reportes/ReporteController'

export function createReportesRoutes(
  auth: AuthMiddleware,
  cuota: ReporteCuotaController,
  gestion: ReporteGestionController,
  global: ReporteGlobalController,
  dashboard: DashboardController,
  exportacion: ExportacionController,
): Router {
  const router = Router()

  router.post('/empresas/:idEmpresa/reportes/cuota', auth, requireEmpresa(), cuota.generar)
  router.post('/intermediadores/:idIntermediador/reportes/gestion', auth, requireIntermediador(), gestion.generar)
  router.post('/reportes/inclusion-laboral', auth, requireAdministrador(), global.generar)
  router.get('/reportes/inclusion-laboral/comparar', auth, requireAdministrador(), global.comparar)
  router.get('/dashboard', auth, requireAdministrador(), dashboard.obtener)
  router.get('/reportes/:tipo/:id/exportar/pdf', auth, exportacion.exportarPDF)
  router.get('/reportes/:tipo/:id/exportar/excel', auth, exportacion.exportarExcel)
  router.get('/reportes/consolidado/empresas', auth, requireAdministrador(), exportacion.exportarConsolidado)

  return router
}