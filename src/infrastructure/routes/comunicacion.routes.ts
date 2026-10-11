import { Router } from 'express'
import { AuthMiddleware } from '../middlewares/authMiddleware'
import { requireAdministrador, requireEmpresa } from '../middlewares/roleMiddleware'
import {
  ConversacionController,
  MensajeController,
  PlantillaNotificacionController,
} from '../controllers/comunicacion/ComunicacionController'

export function createComunicacionRoutes(
  auth: AuthMiddleware,
  conversacion: ConversacionController,
  mensaje: MensajeController,
  plantilla: PlantillaNotificacionController,
): Router {
  const router = Router()

  router.post('/conversaciones', auth, conversacion.iniciar)
  router.get('/conversaciones/:id/historial', auth, conversacion.historial)
  router.post('/conversaciones/:idConversacion/mensajes', auth, mensaje.enviar)
  router.post('/empresas/:idEmpresa/mensajes/masivo', auth, requireEmpresa(), mensaje.enviarMasivo)
  router.patch('/conversaciones/:idConversacion/mensajes/leidos', auth, mensaje.marcarLeidos)
  router.post('/plantillas-notificacion', auth, requireAdministrador(), plantilla.crear)
  router.put('/plantillas-notificacion/:id', auth, requireAdministrador(), plantilla.editar)
  router.patch('/plantillas-notificacion/:id/desactivar', auth, requireAdministrador(), plantilla.desactivar)

  return router
}