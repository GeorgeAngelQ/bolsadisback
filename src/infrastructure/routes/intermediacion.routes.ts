import { Router } from 'express'
import { validate } from '@infrastructure/middlewares/validationMiddleware'
import { ids } from '@infrastructure/validators/common/common.schemas'
import { AuthMiddleware } from '@infrastructure/middlewares/authMiddleware'
import { requireIntermediador, requireEmpresa } from '@infrastructure/middlewares/roleMiddleware'
import {
  actualizarEstadoDerivacionSchema, programarEntrevistaSchema, registrarDerivacionSchema,
  registrarNotasSchema, registrarObservacionSchema, registrarResultadoSchema,
} from '@infrastructure/validators/intermediacion/intermediacion.schema'
import {
  IntermediacionLaboralController,
  ObservacionCandidatoController,
  SeguimientoPostulacionController,
  CoordinacionEntrevistaController,
  DerivacionServicioController,
} from '@infrastructure/controllers/intermediacion/IntermediacionController'

export function createIntermediacionRoutes(
  auth: AuthMiddleware,
  asignacion: IntermediacionLaboralController,
  observacion: ObservacionCandidatoController,
  seguimiento: SeguimientoPostulacionController,
  entrevista: CoordinacionEntrevistaController,
  derivacion: DerivacionServicioController,
): Router {
  const router = Router()

  router.post('/intermediadores/:idIntermediador/candidatos/:idCandidato/asignar',
    auth, requireIntermediador(), validate({ params: ids('idIntermediador', 'idCandidato') }), asignacion.asignar)

  router.post('/intermediadores/:idIntermediador/candidatos/:idCandidato/observaciones',
    auth, requireIntermediador(), validate({ params: ids('idIntermediador', 'idCandidato'), body: registrarObservacionSchema }), observacion.registrar)

  router.post('/intermediadores/:idIntermediador/candidatos/:idCandidato/postulaciones/:idPostulacion/seguimiento',
    auth, requireIntermediador(), validate({ params: ids('idIntermediador', 'idCandidato', 'idPostulacion') }), seguimiento.iniciar)
  router.patch('/intermediadores/:idIntermediador/seguimientos/:id/notas',
    auth, requireIntermediador(), validate({ params: ids('idIntermediador', 'id'), body: registrarNotasSchema }), seguimiento.actualizarNotas)
  router.patch('/intermediadores/:idIntermediador/seguimientos/:id/resultado',
    auth, requireIntermediador(), validate({ params: ids('idIntermediador', 'id'), body: registrarResultadoSchema }), seguimiento.registrarResultado)

  router.post('/postulaciones/:idPostulacion/entrevista',
    auth, requireEmpresa(), validate({ params: ids('idPostulacion'), body: programarEntrevistaSchema }), entrevista.programar)

  router.post('/intermediadores/:idIntermediador/candidatos/:idCandidato/seguimientos/:idSeguimiento/derivacion',
    auth, requireIntermediador(), validate({ params: ids('idIntermediador', 'idCandidato', 'idSeguimiento'), body: registrarDerivacionSchema }), derivacion.registrar)
  router.patch('/intermediadores/:idIntermediador/derivaciones/:id/estado',
    auth, requireIntermediador(), validate({ params: ids('idIntermediador', 'id'), body: actualizarEstadoDerivacionSchema }), derivacion.actualizarEstado)

  return router
}
