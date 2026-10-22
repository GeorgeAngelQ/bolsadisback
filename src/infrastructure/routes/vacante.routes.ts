import { Router } from 'express'
import { AuthMiddleware } from '@infrastructure/middlewares/authMiddleware'
import {
  requireEmpresa,
  requireAdministrador,
  requireIntermediador
} from '@infrastructure/middlewares/roleMiddleware'
import { validate } from '@infrastructure/middlewares/validationMiddleware'
import { ids } from '@infrastructure/validators/common/common.schemas'
import {
  aprobarVacanteSchema, editarVacanteSchema, publicarVacanteSchema, rechazarVacanteSchema,
  registrarSancionSchema, verificarAjustesSchema,
} from '@infrastructure/validators/gestionVacante/vacante.schema'
import {
  VacanteController,
  AprobacionVacanteController,
  // ReporteContenidoController,
  SancionEmpresaController
} from '@infrastructure/controllers/gestionVacante/VacanteController'

export function createVacanteRoutes(
  auth: AuthMiddleware,
  vacante: VacanteController,
  aprobacion: AprobacionVacanteController,
  // reporte: ReporteContenidoController,
  sancion: SancionEmpresaController
): Router {
  const router = Router()

  router.post('/empresas/:idEmpresa/vacantes', auth, requireEmpresa(), validate({ params: ids('idEmpresa'), body: publicarVacanteSchema }), vacante.publicar)
  router.put('/empresas/:idEmpresa/vacantes/:id', auth, requireEmpresa(), validate({ params: ids('idEmpresa', 'id'), body: editarVacanteSchema }), vacante.editar)
  router.patch('/empresas/:idEmpresa/vacantes/:id/cerrar', auth, requireEmpresa(), validate({ params: ids('idEmpresa', 'id') }), vacante.cerrar)
  router.patch('/vacantes/:id/ajustes/verificar', auth, requireIntermediador(), validate({ params: ids('id'), body: verificarAjustesSchema }), vacante.verificarAjustes)

  router.get('/vacantes/pendientes', auth, requireAdministrador(), aprobacion.listarPendientes)
  router.patch('/vacantes/:id/aprobar', auth, requireAdministrador(), validate({ params: ids('id'), body: aprobarVacanteSchema }), aprobacion.aprobar)
  router.patch('/vacantes/:id/rechazar', auth, requireAdministrador(), validate({ params: ids('id'), body: rechazarVacanteSchema }), aprobacion.rechazar)

  // Reportes de contenido (deshabilitado)
  // router.post('/contenido/:tipo/:idContenido/reportes', auth, reporte.registrar)
  // router.patch('/reportes/:id/desestimar', auth, requireAdministrador(), reporte.desestimar)
  // router.patch('/reportes/:id/retirar-contenido', auth, requireAdministrador(), reporte.retirarContenido)

  router.post('/empresas/:idEmpresa/sanciones', auth, requireAdministrador(), validate({ params: ids('idEmpresa'), body: registrarSancionSchema }), sancion.registrar)
  router.patch('/sanciones/:id/levantar', auth, requireAdministrador(), validate({ params: ids('id') }), sancion.levantar)

  return router
}