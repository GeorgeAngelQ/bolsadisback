import { Router } from 'express'
import { AuthController, AccesibilidadController, GestionCuentasController, RolController } from '../controllers/accesoRegistro/AuthController'
import { createAuthMiddleware } from '../middlewares/authMiddleware'
import { requireAdministrador } from '../middlewares/roleMiddleware'
import { validar } from '../middlewares/validationMiddleware'
import {
  registrarCandidatoSchema,
  registrarEmpresaSchema,
  loginSchema,
  solicitarRecuperacionSchema,
  actualizarContrasenaSchema,
  guardarPreferenciasSchema,
  crearIntermediadorSchema,
  crearRolSchema,
  asignarPermisosSchema,
} from '../validators/accesoRegistro/accesoRegistro.schema'
import { JwtTokenGenerator } from '../services/auth/JwtTokenGenerator'

export function createAuthRoutes(
  auth: AuthController,
  accesibilidad: AccesibilidadController,
  cuentas: GestionCuentasController,
  roles: RolController,
): Router {
  const router = Router()
  const tokenGenerator = new JwtTokenGenerator()
  const authMiddleware = createAuthMiddleware(tokenGenerator)

  router.post('/candidatos/registro', validar(registrarCandidatoSchema), auth.registrarCandidato)
  router.post('/empresas/registro', validar(registrarEmpresaSchema), auth.registrarEmpresa)
  router.post('/login', validar(loginSchema), auth.iniciarSesion)
  router.post('/recuperar-contrasena', validar(solicitarRecuperacionSchema), auth.solicitarRecuperacion)
  router.get('/recuperar-contrasena/:token', auth.validarToken)
  router.patch('/recuperar-contrasena', validar(actualizarContrasenaSchema), auth.actualizarContrasena)

  router.get('/accesibilidad', authMiddleware, accesibilidad.obtener)
  router.put('/accesibilidad', authMiddleware, validar(guardarPreferenciasSchema), accesibilidad.guardar)
  router.delete('/accesibilidad', authMiddleware, accesibilidad.restablecer)

  router.post('/cuentas/intermediadores', authMiddleware, requireAdministrador(), validar(crearIntermediadorSchema), cuentas.crearIntermediador)
  router.patch('/cuentas/:id/suspender', authMiddleware, requireAdministrador(), cuentas.suspender)
  router.patch('/cuentas/:id/reactivar', authMiddleware, requireAdministrador(), cuentas.reactivar)
  router.delete('/cuentas/:id', authMiddleware, requireAdministrador(), cuentas.eliminar)

  router.get('/roles', authMiddleware, requireAdministrador(), roles.listar)
  router.post('/roles', authMiddleware, requireAdministrador(), validar(crearRolSchema), roles.crear)
  router.put('/roles/:id/permisos', authMiddleware, requireAdministrador(), validar(asignarPermisosSchema), roles.asignarPermisos)

  return router
}
