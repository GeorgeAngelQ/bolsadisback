import { Router } from 'express'
import { AuthMiddleware } from '@infrastructure/middlewares/authMiddleware'
import { requireCandidato, requireIntermediador } from '@infrastructure/middlewares/roleMiddleware'
import { validate } from '@infrastructure/middlewares/validationMiddleware'
import { ids } from '@infrastructure/validators/common/common.schemas'
import {
  buscarVacantesSchema, calificarPostulacionSchema, crearAlertaSchema,
  crearRecomendacionManualSchema, editarAlertaSchema, postularVacanteSchema,
} from '@infrastructure/validators/busquedaPostulacion/postulacion.schema'
import {
  BusquedaVacanteController,
  PostulacionController,
  VacanteGuardadaController,
  AlertaEmpleoController,
  RecomendacionVacanteController
} from '@infrastructure/controllers/busquedaPostulacion/PostulacionController'

export function createPostulacionRoutes(
  auth: AuthMiddleware,
  busqueda: BusquedaVacanteController,
  postulacion: PostulacionController,
  guardada: VacanteGuardadaController,
  alerta: AlertaEmpleoController,
  recomendacion: RecomendacionVacanteController
): Router {
  const router = Router()

  router.get('/vacantes/buscar', auth, requireCandidato(), validate({ query: buscarVacantesSchema }), busqueda.buscar)
  router.get('/vacantes/:id', auth, requireCandidato(), validate({ params: ids('id') }), busqueda.detalle)

  router.post('/candidatos/:idCandidato/vacantes/:idVacante/postulaciones', auth, requireCandidato(), validate({ params: ids('idCandidato', 'idVacante'), body: postularVacanteSchema }), postulacion.postular)
  router.get('/candidatos/:idCandidato/postulaciones', auth, requireCandidato(), validate({ params: ids('idCandidato') }), postulacion.listar)
  router.get('/postulaciones/:id', auth, requireCandidato(), validate({ params: ids('id') }), postulacion.detalle)
  router.delete('/candidatos/:idCandidato/postulaciones/:id', auth, requireCandidato(), validate({ params: ids('idCandidato', 'id') }), postulacion.retirar)
  router.patch('/candidatos/:idCandidato/postulaciones/:id/calificar', auth, requireCandidato(), validate({ params: ids('idCandidato', 'id'), body: calificarPostulacionSchema }), postulacion.calificar)

  router.post('/candidatos/:idCandidato/vacantes-guardadas/:idVacante', auth, requireCandidato(), validate({ params: ids('idCandidato', 'idVacante') }), guardada.guardar)
  router.delete('/candidatos/:idCandidato/vacantes-guardadas/:idVacante', auth, requireCandidato(), validate({ params: ids('idCandidato', 'idVacante') }), guardada.eliminar)

  router.post('/candidatos/:idCandidato/alertas', auth, requireCandidato(), validate({ params: ids('idCandidato'), body: crearAlertaSchema }), alerta.crear)
  router.put('/candidatos/:idCandidato/alertas/:id', auth, requireCandidato(), validate({ params: ids('idCandidato', 'id'), body: editarAlertaSchema }), alerta.editar)
  router.patch('/candidatos/:idCandidato/alertas/:id/desactivar', auth, requireCandidato(), validate({ params: ids('idCandidato', 'id') }), alerta.desactivar)

  router.get('/candidatos/:idCandidato/recomendaciones', auth, requireCandidato(), validate({ params: ids('idCandidato') }), recomendacion.listar)
  router.post('/candidatos/:idCandidato/recomendaciones/:idVacante', auth, requireIntermediador(), validate({ params: ids('idCandidato', 'idVacante'), body: crearRecomendacionManualSchema }), recomendacion.crearManual)
  router.patch('/candidatos/:idCandidato/recomendaciones/:id/descartar', auth, requireCandidato(), validate({ params: ids('idCandidato', 'id') }), recomendacion.descartar)
  
  return router
}