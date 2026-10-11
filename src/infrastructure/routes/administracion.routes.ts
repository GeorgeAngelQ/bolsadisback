import { Router } from 'express'
import { validar } from '../middlewares/validationMiddleware'
import { AuthMiddleware } from '../middlewares/authMiddleware'
import { requireAdministrador } from '../middlewares/roleMiddleware'
import {
  ContenidoInformativoController,
  CategoriaController,
  ConfiguracionAccesibilidadController,
  AuditoriaController,
  // MantenimientoController,
} from '../controllers/administracion/AdministracionController'

export function createAdministracionRoutes(
  auth: AuthMiddleware,
  contenido: ContenidoInformativoController,
  categoria: CategoriaController,
  configAcc: ConfiguracionAccesibilidadController,
  auditoria: AuditoriaController,
  //mantenimiento: MantenimientoController,
): Router {
  const router = Router()

  router.post('/contenido', auth, requireAdministrador(), contenido.publicar)
  router.put('/contenido/:id', auth, requireAdministrador(), contenido.editar)
  router.patch('/contenido/:id/retirar', auth, requireAdministrador(), contenido.retirar)
  router.delete('/tipos-discapacidad/:id', auth, requireAdministrador(), categoria.eliminarTipoDiscapacidad)
  router.put('/configuracion/accesibilidad', auth, requireAdministrador(), configAcc.actualizar)
  router.get('/auditoria', auth, requireAdministrador(), auditoria.buscar)
  router.get('/auditoria/patrones', auth, requireAdministrador(), auditoria.detectarPatrones)
  router.get('/auditoria/exportar', auth, requireAdministrador(), auditoria.exportar)
  // router.post('/mantenimiento', auth, requireAdministrador(), mantenimiento.programar)
  // router.patch('/mantenimiento/finalizar', auth, requireAdministrador(), mantenimiento.finalizar)

  return router
}