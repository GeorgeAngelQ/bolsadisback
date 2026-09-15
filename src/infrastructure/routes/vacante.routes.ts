import { Router } from 'express'
import { createAuthMiddleware } from '../middlewares/authMiddleware'
import {
  requireEmpresa,
  requireAdministrador,
  requireIntermediador
} from '../middlewares/roleMiddleware'

import { JwtTokenGenerator } from '../services/auth/JwtTokenGenerator'
import {
  VacanteController,
  AprobacionVacanteController,
  // ReporteContenidoController,
  SancionEmpresaController
} from '@infrastructure/controllers/gestionVacante/VacanteController'

export function createVacanteRoutes(
  vacante: VacanteController,
  aprobacion: AprobacionVacanteController,
  // reporte: ReporteContenidoController,
  sancion: SancionEmpresaController
): Router {
  const router = Router()
  const auth = createAuthMiddleware(new JwtTokenGenerator())

  router.post('/empresas/:idEmpresa/vacantes', auth, requireEmpresa(), vacante.publicar)
  router.put('/empresas/:idEmpresa/vacantes/:id', auth, requireEmpresa(), vacante.editar)
  router.patch('/empresas/:idEmpresa/vacantes/:id/cerrar', auth, requireEmpresa(), vacante.cerrar)
  router.patch('/vacantes/:id/ajustes/verificar', auth, requireIntermediador(), vacante.verificarAjustes)

  router.get('/vacantes/pendientes', auth, requireAdministrador(), aprobacion.listarPendientes)
  router.patch('/vacantes/:id/aprobar', auth, requireAdministrador(), aprobacion.aprobar)
  router.patch('/vacantes/:id/rechazar', auth, requireAdministrador(), aprobacion.rechazar)

  // Reportes de contenido (deshabilitado)
  // router.post('/contenido/:tipo/:idContenido/reportes', auth, reporte.registrar)
  // router.patch('/reportes/:id/desestimar', auth, requireAdministrador(), reporte.desestimar)
  // router.patch('/reportes/:id/retirar-contenido', auth, requireAdministrador(), reporte.retirarContenido)

  router.post('/empresas/:idEmpresa/sanciones', auth, requireAdministrador(), sancion.registrar)
  router.patch('/sanciones/:id/levantar', auth, requireAdministrador(), sancion.levantar)

  return router
}