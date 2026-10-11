import { Router } from 'express'
import { AuthMiddleware } from '../middlewares/authMiddleware'
import { requireCandidato, requireIntermediador } from '../middlewares/roleMiddleware'

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

  router.get('/vacantes/buscar', auth, requireCandidato(), busqueda.buscar)
  router.get('/vacantes/:id', auth, requireCandidato(), busqueda.detalle)

  router.post('/candidatos/:idCandidato/vacantes/:idVacante/postulaciones', auth, requireCandidato(), postulacion.postular)
  router.get('/candidatos/:idCandidato/postulaciones', auth, requireCandidato(), postulacion.listar)
  router.get('/postulaciones/:id', auth, requireCandidato(), postulacion.detalle)
  router.delete('/candidatos/:idCandidato/postulaciones/:id', auth, requireCandidato(), postulacion.retirar)
  router.patch('/candidatos/:idCandidato/postulaciones/:id/calificar', auth, requireCandidato(), postulacion.calificar)

  router.post('/candidatos/:idCandidato/vacantes-guardadas/:idVacante', auth, requireCandidato(), guardada.guardar)
  router.delete('/candidatos/:idCandidato/vacantes-guardadas/:idVacante', auth, requireCandidato(), guardada.eliminar)

  router.post('/candidatos/:idCandidato/alertas', auth, requireCandidato(), alerta.crear)
  router.put('/candidatos/:idCandidato/alertas/:id', auth, requireCandidato(), alerta.editar)
  router.patch('/candidatos/:idCandidato/alertas/:id/desactivar', auth, requireCandidato(), alerta.desactivar)

  router.get('/candidatos/:idCandidato/recomendaciones', auth, requireCandidato(), recomendacion.listar)
  router.post('/candidatos/:idCandidato/recomendaciones/:idVacante', auth, requireIntermediador(), recomendacion.crearManual)
  router.patch('/candidatos/:idCandidato/recomendaciones/:id/descartar', auth, requireCandidato(), recomendacion.descartar)

  return router
}