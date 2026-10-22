import { Router } from 'express'
import { validate } from '@infrastructure/middlewares/validationMiddleware'
import { AuthMiddleware } from '@infrastructure/middlewares/authMiddleware'
import { requireAdministrador } from '@infrastructure/middlewares/roleMiddleware'
import { ids } from '@infrastructure/validators/common/common.schemas'
import {
  actualizarConfigAccesibilidadSchema, editarContenidoSchema, filtrosAuditoriaSchema,
  publicarContenidoSchema,
} from '@infrastructure/validators/administracion/administracion.schema'
import {
  ContenidoInformativoController,
  CategoriaController,
  ConfiguracionAccesibilidadController,
  AuditoriaController,
  // MantenimientoController,
} from '@infrastructure/controllers/administracion/AdministracionController'

export function createAdministracionRoutes(
  auth: AuthMiddleware,
  contenido: ContenidoInformativoController,
  categoria: CategoriaController,
  configAcc: ConfiguracionAccesibilidadController,
  auditoria: AuditoriaController,
  //mantenimiento: MantenimientoController,
): Router {
  const router = Router()

  router.post('/contenido', auth, requireAdministrador(), validate({ body: publicarContenidoSchema }), contenido.publicar)
  router.put('/contenido/:id', auth, requireAdministrador(), validate({ params: ids('id'), body: editarContenidoSchema }), contenido.editar)
  router.patch('/contenido/:id/retirar', auth, requireAdministrador(), validate({ params: ids('id') }), contenido.retirar)
  router.delete('/tipos-discapacidad/:id', auth, requireAdministrador(), validate({ params: ids('id') }), categoria.eliminarTipoDiscapacidad)
  router.put('/configuracion/accesibilidad', auth, requireAdministrador(), validate({ body: actualizarConfigAccesibilidadSchema }), configAcc.actualizar)
  router.get('/auditoria', auth, requireAdministrador(), validate({ query: filtrosAuditoriaSchema }), auditoria.buscar)
  router.get('/auditoria/patrones', auth, requireAdministrador(), auditoria.detectarPatrones)
  router.get('/auditoria/exportar', auth, requireAdministrador(), validate({ query: filtrosAuditoriaSchema }), auditoria.exportar)
  // router.post('/mantenimiento', auth, requireAdministrador(), mantenimiento.programar)
  // router.patch('/mantenimiento/finalizar', auth, requireAdministrador(), mantenimiento.finalizar)

  return router
}