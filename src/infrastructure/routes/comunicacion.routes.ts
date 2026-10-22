import { Router } from 'express'
import { AuthMiddleware } from '@infrastructure/middlewares/authMiddleware'
import { requireAdministrador, requireEmpresa } from '@infrastructure/middlewares/roleMiddleware'
import { validate } from '@infrastructure/middlewares/validationMiddleware'
import { ids } from '@infrastructure/validators/common/common.schemas'
import {
  crearPlantillaSchema, editarPlantillaSchema, enviarMasivoSchema, enviarMensajeSchema,
  iniciarConversacionSchema,
} from '@infrastructure/validators/comunicacion/comunicacion.schema'
import {
  ConversacionController,
  MensajeController,
  PlantillaNotificacionController,
} from '@infrastructure/controllers/comunicacion/ComunicacionController'

export function createComunicacionRoutes(
  auth: AuthMiddleware,
  conversacion: ConversacionController,
  mensaje: MensajeController,
  plantilla: PlantillaNotificacionController,
): Router {
  const router = Router()

  router.post('/conversaciones', auth, validate({ body: iniciarConversacionSchema }), conversacion.iniciar)
  router.get('/conversaciones/:id/historial', auth, validate({ params: ids('id') }), conversacion.historial)
  router.post('/conversaciones/:idConversacion/mensajes', auth, validate({ params: ids('idConversacion'), body: enviarMensajeSchema }), mensaje.enviar)
  router.post('/empresas/:idEmpresa/mensajes/masivo', auth, requireEmpresa(), validate({ params: ids('idEmpresa'), body: enviarMasivoSchema }), mensaje.enviarMasivo)
  router.patch('/conversaciones/:idConversacion/mensajes/leidos', auth, validate({ params: ids('idConversacion') }), mensaje.marcarLeidos)
  router.post('/plantillas-notificacion', auth, requireAdministrador(), validate({ body: crearPlantillaSchema }), plantilla.crear)
  router.put('/plantillas-notificacion/:id', auth, requireAdministrador(), validate({ params: ids('id'), body: editarPlantillaSchema }), plantilla.editar)
  router.patch('/plantillas-notificacion/:id/desactivar', auth, requireAdministrador(), validate({ params: ids('id') }), plantilla.desactivar)

  return router
}