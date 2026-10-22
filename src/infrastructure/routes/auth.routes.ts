import { Router } from 'express'
import { AuthController, AccesibilidadController, GestionCuentasController, RolController } from '../controllers/accesoRegistro/AuthController'
import { AuthMiddleware } from '../middlewares/authMiddleware'
import { requireAdministrador } from '../middlewares/roleMiddleware'
import { validate } from '../middlewares/validationMiddleware'
import { ids } from '@infrastructure/validators/common/common.schemas'
import {
  actualizarContrasenaSchema, asignarPermisosSchema, crearIntermediadorSchema, crearRolSchema,
  guardarPreferenciasSchema, loginSchema, motivoCuentaSchema, registrarCandidatoSchema,
  registrarEmpresaSchema, solicitarRecuperacionSchema, tokenParamsSchema,
} from '@infrastructure/validators/accesoRegistro/accesoRegistro.schema'

export function createAuthRoutes(
  authMiddleware: AuthMiddleware,
  auth: AuthController,
  accesibilidad: AccesibilidadController,
  cuentas: GestionCuentasController,
  roles: RolController,
): Router {
  const router = Router()

  router.post('/candidatos/registro', validate({ body: registrarCandidatoSchema }), auth.registrarCandidato)
  router.post('/empresas/registro', validate({ body: registrarEmpresaSchema }), auth.registrarEmpresa)
  router.post('/login', validate({ body: loginSchema }), auth.iniciarSesion)
  router.post('/recuperar-contrasena', validate({ body: solicitarRecuperacionSchema }), auth.solicitarRecuperacion)
  router.get('/recuperar-contrasena/:token', validate({ params: tokenParamsSchema }), auth.validarToken)
  router.patch('/recuperar-contrasena', validate({ body: actualizarContrasenaSchema }), auth.actualizarContrasena)

  router.get('/accesibilidad', authMiddleware, accesibilidad.obtener)
  router.put('/accesibilidad', authMiddleware, validate({ body: guardarPreferenciasSchema }), accesibilidad.guardar)
  router.delete('/accesibilidad', authMiddleware, accesibilidad.restablecer)

  router.post('/cuentas/intermediadores', authMiddleware, requireAdministrador(), validate({ body: crearIntermediadorSchema }), cuentas.crearIntermediador)  
  router.patch('/cuentas/:id/suspender', authMiddleware, requireAdministrador(), validate({ params: ids('id'), body: motivoCuentaSchema }), cuentas.suspender)  
  router.patch('/cuentas/:id/reactivar', authMiddleware, requireAdministrador(), validate({ params: ids('id') }), cuentas.reactivar)
  router.delete('/cuentas/:id', authMiddleware, requireAdministrador(), validate({ params: ids('id'), body: motivoCuentaSchema }), cuentas.eliminar)

  router.get('/roles', authMiddleware, requireAdministrador(), roles.listar)
  router.post('/roles', authMiddleware, requireAdministrador(), validate({ body: crearRolSchema }), roles.crear)
  router.put('/roles/:id/permisos', authMiddleware, requireAdministrador(), validate({ params: ids('id'), body: asignarPermisosSchema }), roles.asignarPermisos)

  return router
}
