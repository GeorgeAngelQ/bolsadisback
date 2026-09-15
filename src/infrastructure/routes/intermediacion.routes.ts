import { Router } from 'express'
import { validar } from '../middlewares/validationMiddleware'
import { createAuthMiddleware } from '../middlewares/authMiddleware'
import { requireIntermediador, requireEmpresa } from '../middlewares/roleMiddleware'
import {
  registrarObservacionSchema,
  programarEntrevistaSchema,
  registrarResultadoSchema,
  registrarDerivacionSchema,
} from '../validators/intermediacion/intermediacion.schema'
import {
  IntermediacionLaboralController,
  ObservacionCandidatoController,
  SeguimientoPostulacionController,
  CoordinacionEntrevistaController,
  DerivacionServicioController,
} from '../controllers/intermediacion/IntermediacionController'
import { JwtTokenGenerator } from '../services/auth/JwtTokenGenerator'

export function createIntermediacionRoutes(
  asignacion: IntermediacionLaboralController,
  observacion: ObservacionCandidatoController,
  seguimiento: SeguimientoPostulacionController,
  entrevista: CoordinacionEntrevistaController,
  derivacion: DerivacionServicioController,
): Router {
  const router = Router()
  const auth = createAuthMiddleware(new JwtTokenGenerator())

  router.post('/intermediadores/:idIntermediador/candidatos/:idCandidato/asignar',
    auth, requireIntermediador(), asignacion.asignar)

  router.post('/intermediadores/:idIntermediador/candidatos/:idCandidato/observaciones',
    auth, requireIntermediador(), validar(registrarObservacionSchema), observacion.registrar)

  router.post('/intermediadores/:idIntermediador/candidatos/:idCandidato/postulaciones/:idPostulacion/seguimiento',
    auth, requireIntermediador(), seguimiento.iniciar)
  router.patch('/intermediadores/:idIntermediador/seguimientos/:id/notas',
    auth, requireIntermediador(), seguimiento.actualizarNotas)
  router.patch('/intermediadores/:idIntermediador/seguimientos/:id/resultado',
    auth, requireIntermediador(), validar(registrarResultadoSchema), seguimiento.registrarResultado)

  router.post('/postulaciones/:idPostulacion/entrevista',
    auth, requireEmpresa(), validar(programarEntrevistaSchema), entrevista.programar)

  router.post('/intermediadores/:idIntermediador/candidatos/:idCandidato/seguimientos/:idSeguimiento/derivacion',
    auth, requireIntermediador(), validar(registrarDerivacionSchema), derivacion.registrar)
  router.patch('/intermediadores/:idIntermediador/derivaciones/:id/estado',
    auth, requireIntermediador(), derivacion.actualizarEstado)

  return router
}
